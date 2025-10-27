import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

// Mock messages data
let mockMessages: any[] = [];

export const sendMessageProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    content: z.string(),
    recipients: z.array(z.string()), // user IDs
    staffName: z.string(),
    priority: z.enum(['low', 'medium', 'high']).default('medium')
  }))
  .mutation(({ input }) => {
    const message = {
      id: Date.now().toString(),
      ...input,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    mockMessages.push(message);
    return message;
  });

export const getMessagesProcedure = publicProcedure
  .query(() => {
    return mockMessages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  });

export const deleteMessageProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockMessages = mockMessages.filter(m => m.id !== input.id);
    return { success: true };
  });