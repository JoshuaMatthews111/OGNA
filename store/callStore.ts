import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CallSession, CallRecording, CallNote } from '@/types';

interface CallState {
  currentCall: CallSession | null;
  callHistory: CallSession[];
  recordings: CallRecording[];
  notes: CallNote[];
  isInCall: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isVideoEnabled: boolean;
  isRecording: boolean;
  callDuration: number;
  
  setCurrentCall: (call: CallSession | null) => void;
  updateCallStatus: (status: CallSession['status']) => void;
  startCall: (call: Omit<CallSession, 'id' | 'status' | 'duration' | 'createdAt' | 'updatedAt' | 'isGroupCall'>) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  toggleVideo: () => void;
  toggleRecording: () => void;
  updateDuration: (duration: number) => void;
  addRecording: (recording: CallRecording) => void;
  addNote: (note: Omit<CallNote, 'id' | 'createdAt'>) => void;
  updateCallNotes: (notes: string) => void;
  updateCallTranscription: (transcription: string) => void;
  getCallHistory: () => CallSession[];
  clearCallHistory: () => void;
}

export const useCallStore = create<CallState>()(persist(
  (set, get) => ({
    currentCall: null,
    callHistory: [],
    recordings: [],
    notes: [],
    isInCall: false,
    isMuted: false,
    isSpeakerOn: false,
    isVideoEnabled: false,
    isRecording: false,
    callDuration: 0,

    setCurrentCall: (call) => set({ 
      currentCall: call,
      isInCall: call !== null 
    }),

    updateCallStatus: (status) => set((state) => {
      if (!state.currentCall) return state;
      
      const updatedCall = {
        ...state.currentCall,
        status,
        updatedAt: new Date().toISOString(),
      };

      return {
        currentCall: updatedCall,
      };
    }),

    startCall: (callData) => {
      const isGroupCall = !!callData.groupId || (callData.participants && callData.participants.length > 1);
      
      const newCall: CallSession = {
        ...callData,
        id: `call-${Date.now()}`,
        isGroupCall: isGroupCall || false,
        status: 'calling',
        duration: 0,
        isRecording: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set({
        currentCall: newCall,
        isInCall: true,
        isMuted: false,
        isSpeakerOn: false,
        isVideoEnabled: callData.type === 'video',
        isRecording: false,
        callDuration: 0,
      });
    },

    endCall: () => set((state) => {
      if (!state.currentCall) return state;

      const endedCall: CallSession = {
        ...state.currentCall,
        status: 'ended',
        endTime: new Date().toISOString(),
        duration: state.callDuration,
        updatedAt: new Date().toISOString(),
      };

      return {
        currentCall: null,
        callHistory: [endedCall, ...state.callHistory].slice(0, 100),
        isInCall: false,
        isMuted: false,
        isSpeakerOn: false,
        isVideoEnabled: false,
        isRecording: false,
        callDuration: 0,
      };
    }),

    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    toggleSpeaker: () => set((state) => ({ isSpeakerOn: !state.isSpeakerOn })),
    toggleVideo: () => set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),
    toggleRecording: () => set((state) => {
      const newRecordingState = !state.isRecording;
      
      if (state.currentCall) {
        const updatedCall = {
          ...state.currentCall,
          isRecording: newRecordingState,
        };
        return {
          isRecording: newRecordingState,
          currentCall: updatedCall,
        };
      }
      
      return { isRecording: newRecordingState };
    }),

    updateDuration: (duration) => set({ callDuration: duration }),

    addRecording: (recording) => set((state) => ({
      recordings: [recording, ...state.recordings],
    })),

    addNote: (note) => set((state) => ({
      notes: [
        {
          ...note,
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...state.notes,
      ],
    })),

    updateCallNotes: (notes) => set((state) => {
      if (!state.currentCall) return state;
      
      return {
        currentCall: {
          ...state.currentCall,
          notes,
        },
      };
    }),

    updateCallTranscription: (transcription) => set((state) => {
      if (!state.currentCall) return state;
      
      return {
        currentCall: {
          ...state.currentCall,
          transcription,
        },
      };
    }),

    getCallHistory: () => get().callHistory,
    
    clearCallHistory: () => set({ callHistory: [], recordings: [], notes: [] }),
  }),
  {
    name: 'call-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));
