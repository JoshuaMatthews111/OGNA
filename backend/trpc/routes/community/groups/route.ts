import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import type { CommunityGroup } from '@/types';

const groups = new Map<string, CommunityGroup>();

const sampleGroups: CommunityGroup[] = [
  {
    id: '1',
    name: 'Youth Fellowship',
    description: 'A vibrant community for young adults to connect, grow in faith, and support each other.',
    category: 'youth',
    members: ['user-1', 'user-2', 'user-3'],
    admins: ['user-1'],
    isPrivate: false,
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    nextMeeting: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    meetingLocation: 'Church Hall',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-1'
  },
  {
    id: '2',
    name: 'Bible Study Group',
    description: 'Deep dive into scripture together. All are welcome to join our weekly sessions.',
    category: 'bible-study',
    members: ['user-1', 'user-2', 'user-4', 'user-5'],
    admins: ['user-2'],
    isPrivate: false,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    nextMeeting: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    meetingLocation: 'Online via Zoom',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-2'
  },
  {
    id: '3',
    name: 'Worship Ministry',
    description: 'For those passionate about leading worship and praising together.',
    category: 'ministry',
    members: ['user-3', 'user-4'],
    admins: ['user-3'],
    isPrivate: false,
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user-3'
  }
];

sampleGroups.forEach(g => groups.set(g.id, g));

export const listGroupsProcedure = publicProcedure.query(async () => {
  return Array.from(groups.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

export const getGroupProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const group = groups.get(input.id);
    if (!group) throw new Error('Group not found');
    return group;
  });

export const createGroupProcedure = protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(['bible-study', 'fellowship', 'ministry', 'support', 'youth', 'other']),
    isPrivate: z.boolean(),
    imageUrl: z.string().optional(),
    meetingLocation: z.string().optional(),
    nextMeeting: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const id = `group-${Date.now()}`;
    const group: CommunityGroup = {
      id,
      name: input.name,
      description: input.description,
      category: input.category,
      members: [ctx.user.id],
      admins: [ctx.user.id],
      isPrivate: input.isPrivate,
      imageUrl: input.imageUrl,
      meetingLocation: input.meetingLocation,
      nextMeeting: input.nextMeeting,
      createdAt: new Date().toISOString(),
      createdBy: ctx.user.id
    };
    groups.set(id, group);
    return group;
  });

export const joinGroupProcedure = protectedProcedure
  .input(z.object({ groupId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const group = groups.get(input.groupId);
    if (!group) throw new Error('Group not found');
    if (!group.members.includes(ctx.user.id)) {
      group.members.push(ctx.user.id);
      groups.set(input.groupId, group);
    }
    return group;
  });

export const leaveGroupProcedure = protectedProcedure
  .input(z.object({ groupId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const group = groups.get(input.groupId);
    if (!group) throw new Error('Group not found');
    group.members = group.members.filter(id => id !== ctx.user.id);
    groups.set(input.groupId, group);
    return group;
  });

export const updateGroupProcedure = protectedProcedure
  .input(z.object({
    groupId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    meetingLocation: z.string().optional(),
    nextMeeting: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const group = groups.get(input.groupId);
    if (!group) throw new Error('Group not found');
    if (!group.admins.includes(ctx.user.id)) throw new Error('Not authorized');
    
    Object.assign(group, {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.imageUrl && { imageUrl: input.imageUrl }),
      ...(input.meetingLocation && { meetingLocation: input.meetingLocation }),
      ...(input.nextMeeting && { nextMeeting: input.nextMeeting })
    });
    
    groups.set(input.groupId, group);
    return group;
  });

export const deleteGroupProcedure = protectedProcedure
  .input(z.object({ groupId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const group = groups.get(input.groupId);
    if (!group) throw new Error('Group not found');
    if (!group.admins.includes(ctx.user.id)) throw new Error('Not authorized');
    groups.delete(input.groupId);
    return { success: true };
  });
