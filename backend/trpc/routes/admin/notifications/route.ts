import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

// Mock notifications data
let notifications: Array<{
  id: string;
  title: string;
  message: string;
  type: string;
  recipients: string;
  status: string;
  priority: string;
  createdBy: string;
  sentAt: string;
}> = [
  {
    id: '1',
    title: 'Welcome to OGN',
    message: 'Thank you for joining Overcomers Global Network. We are excited to have you!',
    type: 'general',
    recipients: 'all',
    status: 'sent',
    priority: 'medium',
    createdBy: 'Prophet Joshua Matthews',
    sentAt: '2024-01-15T10:00:00Z'
  }
];

export const getNotificationsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['draft', 'scheduled', 'sent']).optional(),
    type: z.enum(['general', 'event', 'sermon', 'course', 'donation']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let filteredNotifications = notifications;
    
    if (input.status) {
      filteredNotifications = filteredNotifications.filter(n => n.status === input.status);
    }
    if (input.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === input.type);
    }
    
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    
    return {
      notifications: filteredNotifications.slice(offset, offset + limit),
      total: filteredNotifications.length,
      hasMore: offset + limit < filteredNotifications.length,
    };
  });

export const sendNotificationProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    message: z.string(),
    type: z.enum(['general', 'event', 'sermon', 'course', 'donation']),
    recipients: z.union([
      z.enum(['all', 'members', 'admins']),
      z.array(z.string())
    ]),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    scheduledFor: z.string().optional(),
    createdBy: z.string(),
  }))
  .mutation(({ input }) => {
    const notification = {
      id: Date.now().toString(),
      title: input.title,
      message: input.message,
      type: input.type,
      recipients: Array.isArray(input.recipients) ? input.recipients.join(',') : input.recipients,
      priority: input.priority,
      scheduledFor: input.scheduledFor,
      status: input.scheduledFor ? 'scheduled' : 'sent',
      createdBy: input.createdBy,
      sentAt: input.scheduledFor ? '' : new Date().toISOString(),
    };
    
    notifications.unshift(notification);
    return notification;
  });

export const updateNotificationProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    message: z.string().optional(),
    type: z.enum(['general', 'event', 'sermon', 'course', 'donation']).optional(),
    recipients: z.union([
      z.enum(['all', 'members', 'admins']),
      z.array(z.string())
    ]).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    scheduledFor: z.string().optional(),
    status: z.enum(['draft', 'scheduled', 'sent']).optional(),
  }))
  .mutation(({ input }) => {
    const notificationIndex = notifications.findIndex(n => n.id === input.id);
    if (notificationIndex === -1) throw new Error('Notification not found');
    
    const updatedNotification = {
      ...notifications[notificationIndex],
      ...(input.title && { title: input.title }),
      ...(input.message && { message: input.message }),
      ...(input.type && { type: input.type }),
      ...(input.recipients && { recipients: Array.isArray(input.recipients) ? input.recipients.join(',') : input.recipients }),
      ...(input.priority && { priority: input.priority }),
      ...(input.scheduledFor && { scheduledFor: input.scheduledFor }),
      ...(input.status && { status: input.status }),
    };
    
    notifications[notificationIndex] = updatedNotification;
    return updatedNotification;
  });

export const deleteNotificationProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    notifications = notifications.filter(n => n.id !== input.id);
    return { success: true };
  });