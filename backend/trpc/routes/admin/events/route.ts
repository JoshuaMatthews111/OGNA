import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

let mockEvents = [
  {
    id: '1',
    title: 'Good Friday',
    description: 'We invite everyone to join us at 6:00pm to celebrate Good Friday.',
    date: '2025-04-18',
    time: '06:00pm',
    location: 'Main Complex',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    createdBy: 'mr.matthews2022@gmail.com',
    createdAt: new Date().toISOString(),
    status: 'upcoming' as const,
  },
  {
    id: '2',
    title: 'Sunday Service',
    description: 'Join us for our weekly Sunday service with Prophet Joshua Matthews.',
    date: '2025-10-19',
    time: '10:00am',
    location: 'Main Sanctuary',
    imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800',
    createdBy: 'mr.matthews2022@gmail.com',
    createdAt: new Date().toISOString(),
    status: 'upcoming' as const,
  },
];

export const listEventsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['all', 'upcoming', 'past']).optional(),
  }).optional())
  .query(({ input }) => {
    let events = mockEvents;
    
    if (input?.status && input.status !== 'all') {
      const now = new Date();
      if (input.status === 'upcoming') {
        events = events.filter(e => new Date(e.date) >= now);
      } else {
        events = events.filter(e => new Date(e.date) < now);
      }
    }
    
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

export const getEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const event = mockEvents.find(e => e.id === input.id);
    if (!event) throw new Error('Event not found');
    return event;
  });

export const createEventProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    time: z.string(),
    location: z.string(),
    imageUrl: z.string().url().optional(),
    createdBy: z.string(),
  }))
  .mutation(({ input }) => {
    const newEvent = {
      id: Date.now().toString(),
      ...input,
      imageUrl: input.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
      createdAt: new Date().toISOString(),
      status: 'upcoming' as const,
    };
    
    mockEvents.push(newEvent);
    return newEvent;
  });

export const updateEventProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    location: z.string().optional(),
    imageUrl: z.string().url().optional(),
  }))
  .mutation(({ input }) => {
    const eventIndex = mockEvents.findIndex(e => e.id === input.id);
    if (eventIndex === -1) throw new Error('Event not found');
    
    mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...input };
    return mockEvents[eventIndex];
  });

export const deleteEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockEvents = mockEvents.filter(e => e.id !== input.id);
    return { success: true, message: 'Event deleted successfully' };
  });

export const uploadEventImageProcedure = publicProcedure
  .input(z.object({
    eventId: z.string(),
    imageUrl: z.string().url(),
    cropData: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      scale: z.number().optional(),
    }).optional(),
  }))
  .mutation(({ input }) => {
    const eventIndex = mockEvents.findIndex(e => e.id === input.eventId);
    if (eventIndex === -1) throw new Error('Event not found');
    
    mockEvents[eventIndex].imageUrl = input.imageUrl;
    return mockEvents[eventIndex];
  });
