import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import type { UserProfile } from '@/types';

const MASTER_ADMIN_EMAIL = 'mr.matthews2022@gmail.com';

const users = new Map<string, UserProfile>();

const sampleUsers: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Follower of Christ. Love worship and serving others.',
    location: 'New York, NY',
    joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'member',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    groups: ['1', '2'],
    followers: ['user-2', 'user-3'],
    following: ['user-2'],
    postsCount: 15,
    testimoniesCount: 2,
    prayerRequestsCount: 3,
    privacy: {
      showEmail: false,
      showLocation: true,
      allowDirectMessages: true,
      showOnlineStatus: true
    }
  },
  {
    id: 'user-2',
    name: 'Michael Smith',
    email: 'michael@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Bible teacher and worship leader.',
    location: 'Los Angeles, CA',
    joinDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'member',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    groups: ['2'],
    followers: ['user-1'],
    following: ['user-1', 'user-3'],
    postsCount: 28,
    testimoniesCount: 5,
    prayerRequestsCount: 1,
    privacy: {
      showEmail: false,
      showLocation: true,
      allowDirectMessages: true,
      showOnlineStatus: true
    }
  }
];

sampleUsers.forEach(u => users.set(u.id, u));

export const getUserProfileProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const user = users.get(input.userId);
    if (!user) throw new Error('User not found');
    return user;
  });

export const updateProfileProcedure = protectedProcedure
  .input(z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    avatar: z.string().optional(),
    privacy: z.object({
      showEmail: z.boolean().optional(),
      showLocation: z.boolean().optional(),
      allowDirectMessages: z.boolean().optional(),
      showOnlineStatus: z.boolean().optional()
    }).optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const user = users.get(ctx.user.id);
    if (!user) throw new Error('User not found');
    
    Object.assign(user, {
      ...(input.name && { name: input.name }),
      ...(input.bio && { bio: input.bio }),
      ...(input.location && { location: input.location }),
      ...(input.avatar && { avatar: input.avatar }),
      ...(input.privacy && { privacy: { ...user.privacy, ...input.privacy } })
    });
    
    users.set(ctx.user.id, user);
    return user;
  });

export const followUserProcedure = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const currentUser = users.get(ctx.user.id);
    const targetUser = users.get(input.userId);
    
    if (!currentUser || !targetUser) throw new Error('User not found');
    if (input.userId === ctx.user.id) throw new Error('Cannot follow yourself');
    
    if (!currentUser.following.includes(input.userId)) {
      currentUser.following.push(input.userId);
      targetUser.followers.push(ctx.user.id);
      users.set(ctx.user.id, currentUser);
      users.set(input.userId, targetUser);
    }
    
    return { success: true };
  });

export const unfollowUserProcedure = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const currentUser = users.get(ctx.user.id);
    const targetUser = users.get(input.userId);
    
    if (!currentUser || !targetUser) throw new Error('User not found');
    
    currentUser.following = currentUser.following.filter(id => id !== input.userId);
    targetUser.followers = targetUser.followers.filter(id => id !== ctx.user.id);
    
    users.set(ctx.user.id, currentUser);
    users.set(input.userId, targetUser);
    
    return { success: true };
  });

export const searchUsersProcedure = publicProcedure
  .input(z.object({
    query: z.string(),
    limit: z.number().optional()
  }))
  .query(async ({ input }) => {
    const query = input.query.toLowerCase();
    const limit = input.limit || 10;
    
    const results = Array.from(users.values())
      .filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      )
      .slice(0, limit);
    
    return results;
  });

export const isMasterAdminProcedure = protectedProcedure.query(async ({ ctx }) => {
  return ctx.user.email === MASTER_ADMIN_EMAIL;
});
