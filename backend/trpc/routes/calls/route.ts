import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import type { CallSession, CallRecording, CallParticipant } from '@/types';

const calls = new Map<string, CallSession>();
const recordings = new Map<string, CallRecording>();

export const startCallProcedure = protectedProcedure
  .input(z.object({
    receiverId: z.string().optional(),
    receiverName: z.string().optional(),
    receiverAvatar: z.string().optional(),
    groupId: z.string().optional(),
    groupName: z.string().optional(),
    participantIds: z.array(z.string()).optional(),
    type: z.enum(['audio', 'video']),
  }))
  .mutation(async ({ input, ctx }) => {
    const callId = `call-${Date.now()}`;
    const isGroupCall = !!input.groupId || (input.participantIds && input.participantIds.length > 1);
    
    let participants: CallParticipant[] | undefined;
    if (isGroupCall && input.participantIds) {
      participants = input.participantIds.map(id => ({
        id,
        name: 'User ' + id,
        status: 'waiting' as const,
        isMuted: false,
        isVideoEnabled: input.type === 'video',
      }));
    }
    
    const call: CallSession = {
      id: callId,
      callerId: ctx.user.id,
      callerName: ctx.user.name,
      callerAvatar: undefined,
      receiverId: isGroupCall ? undefined : input.receiverId,
      receiverName: isGroupCall ? undefined : input.receiverName,
      receiverAvatar: isGroupCall ? undefined : input.receiverAvatar,
      isGroupCall: isGroupCall || false,
      groupId: input.groupId,
      groupName: input.groupName,
      participants,
      type: input.type,
      status: 'calling',
      startTime: new Date().toISOString(),
      duration: 0,
      isRecording: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    calls.set(callId, call);
    console.log(`Call started: ${callId}`, call);
    return call;
  });

export const endCallProcedure = protectedProcedure
  .input(z.object({
    callId: z.string(),
    duration: z.number(),
    recordingUrl: z.string().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    if (call.callerId !== ctx.user.id && call.receiverId !== ctx.user.id) {
      throw new Error('Not authorized');
    }
    
    const updatedCall: CallSession = {
      ...call,
      status: 'ended',
      endTime: new Date().toISOString(),
      duration: input.duration,
      recordingUrl: input.recordingUrl,
      notes: input.notes,
      updatedAt: new Date().toISOString(),
    };
    
    calls.set(input.callId, updatedCall);
    console.log(`Call ended: ${input.callId}`, updatedCall);
    return updatedCall;
  });

export const updateCallStatusProcedure = protectedProcedure
  .input(z.object({
    callId: z.string(),
    status: z.enum(['calling', 'ringing', 'active', 'ended', 'missed', 'declined']),
  }))
  .mutation(async ({ input, ctx }) => {
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    if (call.callerId !== ctx.user.id && call.receiverId !== ctx.user.id) {
      throw new Error('Not authorized');
    }
    
    const updatedCall: CallSession = {
      ...call,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };
    
    calls.set(input.callId, updatedCall);
    return updatedCall;
  });

export const saveRecordingProcedure = protectedProcedure
  .input(z.object({
    callId: z.string(),
    audioUrl: z.string(),
    duration: z.number(),
  }))
  .mutation(async ({ input, ctx }) => {
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    if (call.callerId !== ctx.user.id && call.receiverId !== ctx.user.id) {
      throw new Error('Not authorized');
    }
    
    const recordingId = `rec-${Date.now()}`;
    const recording: CallRecording = {
      id: recordingId,
      callId: input.callId,
      audioUrl: input.audioUrl,
      duration: input.duration,
      createdAt: new Date().toISOString(),
    };
    
    recordings.set(recordingId, recording);
    
    const updatedCall: CallSession = {
      ...call,
      recordingUrl: input.audioUrl,
      updatedAt: new Date().toISOString(),
    };
    calls.set(input.callId, updatedCall);
    
    console.log(`Recording saved: ${recordingId}`, recording);
    return recording;
  });

export const transcribeRecordingProcedure = protectedProcedure
  .input(z.object({
    callId: z.string(),
    audioUrl: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    if (call.callerId !== ctx.user.id && call.receiverId !== ctx.user.id) {
      throw new Error('Not authorized');
    }
    
    try {
      console.log('Starting transcription for call:', input.callId);
      
      const formData = new FormData();
      const response = await fetch(input.audioUrl);
      const audioBlob = await response.blob();
      formData.append('audio', audioBlob);
      
      const transcriptionResponse = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (!transcriptionResponse.ok) {
        throw new Error('Transcription failed');
      }
      
      const result = await transcriptionResponse.json() as { text: string; language: string };
      
      const updatedCall: CallSession = {
        ...call,
        transcription: result.text,
        updatedAt: new Date().toISOString(),
      };
      calls.set(input.callId, updatedCall);
      
      const recording = Array.from(recordings.values()).find(r => r.callId === input.callId);
      if (recording) {
        const updatedRecording: CallRecording = {
          ...recording,
          transcription: result.text,
        };
        recordings.set(recording.id, updatedRecording);
      }
      
      console.log('Transcription completed:', result.text);
      return { transcription: result.text, language: result.language };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe recording');
    }
  });

export const getCallHistoryProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(async ({ input, ctx }) => {
    const userCalls = Array.from(calls.values())
      .filter(c => {
        if (c.callerId === ctx.user.id || c.receiverId === ctx.user.id) return true;
        if (c.participants) {
          return c.participants.some(p => p.id === ctx.user.id);
        }
        return false;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    
    return {
      calls: userCalls.slice(offset, offset + limit),
      total: userCalls.length,
      hasMore: offset + limit < userCalls.length,
    };
  });

export const getCallProcedure = protectedProcedure
  .input(z.object({ callId: z.string() }))
  .query(async ({ input, ctx }) => {
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    
    const isAuthorized = 
      call.callerId === ctx.user.id || 
      call.receiverId === ctx.user.id ||
      (call.participants && call.participants.some(p => p.id === ctx.user.id));
    
    if (!isAuthorized) {
      throw new Error('Not authorized');
    }
    return call;
  });

export const getRecordingsProcedure = protectedProcedure
  .input(z.object({ callId: z.string() }))
  .query(async ({ input, ctx }) => {
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    if (call.callerId !== ctx.user.id && call.receiverId !== ctx.user.id) {
      throw new Error('Not authorized');
    }
    
    const callRecordings = Array.from(recordings.values())
      .filter(r => r.callId === input.callId);
    
    return callRecordings;
  });

export const saveCallNotesProcedure = protectedProcedure
  .input(z.object({
    callId: z.string(),
    notes: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    
    const isAuthorized = 
      call.callerId === ctx.user.id || 
      call.receiverId === ctx.user.id ||
      (call.participants && call.participants.some(p => p.id === ctx.user.id));
    
    if (!isAuthorized) {
      throw new Error('Not authorized');
    }
    
    const updatedCall: CallSession = {
      ...call,
      notes: input.notes,
      updatedAt: new Date().toISOString(),
    };
    
    calls.set(input.callId, updatedCall);
    return updatedCall;
  });

export const getAllCallsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    
    const allCalls = Array.from(calls.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return allCalls;
  });

export const deleteCallRecordingProcedure = protectedProcedure
  .input(z.object({ callId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    
    const call = calls.get(input.callId);
    if (!call) throw new Error('Call not found');
    
    const updatedCall: CallSession = {
      ...call,
      recordingUrl: undefined,
      transcription: undefined,
      updatedAt: new Date().toISOString(),
    };
    
    calls.set(input.callId, updatedCall);
    
    Array.from(recordings.values())
      .filter(r => r.callId === input.callId)
      .forEach(r => recordings.delete(r.id));
    
    console.log(`Call recording deleted for call: ${input.callId}`);
    return { success: true };
  });
