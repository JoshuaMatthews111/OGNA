import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import type { Testimony, Comment } from '@/types';

const testimonies = new Map<string, Testimony>();

const sampleTestimonies: Testimony[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    title: 'Healed from Cancer',
    content: 'I was diagnosed with stage 3 cancer last year. The doctors gave me little hope, but I held onto faith. After months of prayer and treatment, my recent scan came back completely clear. Glory to God!',
    category: 'healing',
    isAnonymous: false,
    likes: ['user-2', 'user-3', 'user-4'],
    comments: [],
    shares: 5,
    isApproved: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Michael Smith',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    title: 'Financial Breakthrough',
    content: 'After being unemployed for 6 months, I got not one but three job offers in the same week! God is faithful and His timing is perfect.',
    category: 'provision',
    isAnonymous: false,
    likes: ['user-1', 'user-3'],
    comments: [],
    shares: 2,
    isApproved: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

sampleTestimonies.forEach(t => testimonies.set(t.id, t));

export const listTestimoniesProcedure = publicProcedure
  .input(z.object({
    category: z.enum(['healing', 'provision', 'salvation', 'breakthrough', 'other']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional()
  }))
  .query(async ({ input }) => {
    let filtered = Array.from(testimonies.values()).filter(t => t.isApproved);
    
    if (input.category) {
      filtered = filtered.filter(t => t.category === input.category);
    }
    
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const offset = input.offset || 0;
    const limit = input.limit || 20;
    
    return {
      testimonies: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length
    };
  });

export const getTestimonyProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const testimony = testimonies.get(input.id);
    if (!testimony) throw new Error('Testimony not found');
    return testimony;
  });

export const createTestimonyProcedure = protectedProcedure
  .input(z.object({
    title: z.string(),
    content: z.string(),
    category: z.enum(['healing', 'provision', 'salvation', 'breakthrough', 'other']),
    isAnonymous: z.boolean()
  }))
  .mutation(async ({ input, ctx }) => {
    const id = `testimony-${Date.now()}`;
    const testimony: Testimony = {
      id,
      userId: ctx.user.id,
      userName: input.isAnonymous ? 'Anonymous' : ctx.user.name,
      userAvatar: input.isAnonymous ? undefined : ctx.user.avatar,
      title: input.title,
      content: input.content,
      category: input.category,
      isAnonymous: input.isAnonymous,
      likes: [],
      comments: [],
      shares: 0,
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    testimonies.set(id, testimony);
    return testimony;
  });

export const likeTestimonyProcedure = protectedProcedure
  .input(z.object({ testimonyId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const testimony = testimonies.get(input.testimonyId);
    if (!testimony) throw new Error('Testimony not found');
    
    const index = testimony.likes.indexOf(ctx.user.id);
    if (index > -1) {
      testimony.likes.splice(index, 1);
    } else {
      testimony.likes.push(ctx.user.id);
    }
    
    testimonies.set(input.testimonyId, testimony);
    return testimony;
  });

export const addTestimonyCommentProcedure = protectedProcedure
  .input(z.object({
    testimonyId: z.string(),
    content: z.string()
  }))
  .mutation(async ({ input, ctx }) => {
    const testimony = testimonies.get(input.testimonyId);
    if (!testimony) throw new Error('Testimony not found');
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: ctx.user.id,
      userName: ctx.user.name,
      userAvatar: ctx.user.avatar,
      content: input.content,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    testimony.comments.push(comment);
    testimonies.set(input.testimonyId, testimony);
    return testimony;
  });

export const deleteTestimonyProcedure = protectedProcedure
  .input(z.object({ testimonyId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const testimony = testimonies.get(input.testimonyId);
    if (!testimony) throw new Error('Testimony not found');
    if (testimony.userId !== ctx.user.id && ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    testimonies.delete(input.testimonyId);
    return { success: true };
  });

export const approveTestimonyProcedure = protectedProcedure
  .input(z.object({ testimonyId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'admin') throw new Error('Not authorized');
    const testimony = testimonies.get(input.testimonyId);
    if (!testimony) throw new Error('Testimony not found');
    testimony.isApproved = true;
    testimonies.set(input.testimonyId, testimony);
    return testimony;
  });
