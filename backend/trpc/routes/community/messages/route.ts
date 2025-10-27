import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { DirectMessage, Conversation } from '@/types';

const messages = new Map<string, DirectMessage>();
const conversations = new Map<string, Conversation>();

export const getConversationsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userConversations = Array.from(conversations.values())
    .filter(c => c.participants.includes(ctx.user.id))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  return userConversations;
});

export const getConversationProcedure = protectedProcedure
  .input(z.object({ conversationId: z.string() }))
  .query(async ({ input, ctx }) => {
    const conversation = conversations.get(input.conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (!conversation.participants.includes(ctx.user.id)) {
      throw new Error('Not authorized');
    }
    return conversation;
  });

export const getMessagesProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional()
  }))
  .query(async ({ input, ctx }) => {
    const conversation = conversations.get(input.conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (!conversation.participants.includes(ctx.user.id)) {
      throw new Error('Not authorized');
    }
    
    const conversationMessages = Array.from(messages.values())
      .filter(m => 
        (m.senderId === ctx.user.id || m.receiverId === ctx.user.id) &&
        conversation.participants.includes(m.senderId) &&
        conversation.participants.includes(m.receiverId)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    
    return {
      messages: conversationMessages.slice(offset, offset + limit),
      total: conversationMessages.length,
      hasMore: offset + limit < conversationMessages.length
    };
  });

export const sendMessageProcedure = protectedProcedure
  .input(z.object({
    receiverId: z.string(),
    content: z.string(),
    type: z.enum(['text', 'image', 'video', 'audio']),
    mediaUrl: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const messageId = `msg-${Date.now()}`;
    const message: DirectMessage = {
      id: messageId,
      senderId: ctx.user.id,
      receiverId: input.receiverId,
      content: input.content,
      type: input.type,
      mediaUrl: input.mediaUrl,
      isRead: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    messages.set(messageId, message);
    
    const participants = [ctx.user.id, input.receiverId].sort();
    const conversationId = participants.join('-');
    
    let conversation = conversations.get(conversationId);
    if (!conversation) {
      conversation = {
        id: conversationId,
        participants,
        lastMessage: message,
        unreadCount: { [input.receiverId]: 1, [ctx.user.id]: 0 },
        isGroup: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      conversation.lastMessage = message;
      conversation.unreadCount[input.receiverId] = (conversation.unreadCount[input.receiverId] || 0) + 1;
      conversation.updatedAt = new Date().toISOString();
    }
    
    conversations.set(conversationId, conversation);
    return message;
  });

export const markAsReadProcedure = protectedProcedure
  .input(z.object({ conversationId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const conversation = conversations.get(input.conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (!conversation.participants.includes(ctx.user.id)) {
      throw new Error('Not authorized');
    }
    
    conversation.unreadCount[ctx.user.id] = 0;
    conversations.set(input.conversationId, conversation);
    
    Array.from(messages.values())
      .filter(m => m.receiverId === ctx.user.id && !m.isRead)
      .forEach(m => {
        m.isRead = true;
        messages.set(m.id, m);
      });
    
    return { success: true };
  });

export const deleteMessageProcedure = protectedProcedure
  .input(z.object({ messageId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const message = messages.get(input.messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId !== ctx.user.id) throw new Error('Not authorized');
    
    messages.delete(input.messageId);
    return { success: true };
  });

export const getAllMessagesProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(async ({ input, ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    
    const allMessages = Array.from(messages.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const offset = input.offset || 0;
    const limit = input.limit || 100;
    
    return {
      messages: allMessages.slice(offset, offset + limit),
      total: allMessages.length,
      hasMore: offset + limit < allMessages.length,
    };
  });

export const adminDeleteMessageProcedure = protectedProcedure
  .input(z.object({ messageId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    
    const message = messages.get(input.messageId);
    if (!message) throw new Error('Message not found');
    
    messages.delete(input.messageId);
    console.log(`Admin deleted message: ${input.messageId}`);
    return { success: true };
  });

export const getAllConversationsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    
    const allConversations = Array.from(conversations.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return allConversations;
  });
