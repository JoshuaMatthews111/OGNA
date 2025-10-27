import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const mockUsers = new Map<string, any>([
  ['user-1', { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'member', active: true, joinDate: '2024-01-15', avatar: 'https://i.pravatar.cc/150?img=1' }],
  ['user-2', { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'member', active: true, joinDate: '2024-02-20', avatar: 'https://i.pravatar.cc/150?img=2' }],
]);

export const listUsersProcedure = protectedProcedure
  .input(z.object({
    search: z.string().optional(),
    role: z.enum(['all', 'admin', 'moderator', 'member', 'guest']).optional(),
    status: z.enum(['all', 'active', 'inactive']).optional(),
  }).optional())
  .query(async ({ input }) => {
    let users = Array.from(mockUsers.values());
    
    if (input?.search) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(input.search!.toLowerCase()) ||
        u.email.toLowerCase().includes(input.search!.toLowerCase())
      );
    }
    
    if (input?.role && input.role !== 'all') {
      users = users.filter(u => u.role === input.role);
    }
    
    if (input?.status && input.status !== 'all') {
      users = users.filter(u => u.active === (input.status === 'active'));
    }
    
    return users;
  });

export const getUserProcedure = protectedProcedure
  .input(z.object({
    userId: z.string()
  }))
  .query(async ({ input }) => {
    const user = mockUsers.get(input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  });

export const updateUserRoleProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    role: z.enum(['admin', 'moderator', 'member', 'guest'])
  }))
  .mutation(async ({ input }) => {
    const user = mockUsers.get(input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.role = input.role;
    mockUsers.set(input.userId, user);
    
    return { success: true, user };
  });

export const deleteUserProcedure = protectedProcedure
  .input(z.object({
    userId: z.string()
  }))
  .mutation(async ({ input }) => {
    const user = mockUsers.get(input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    mockUsers.delete(input.userId);
    
    return { success: true, message: 'User deleted successfully' };
  });

export const toggleUserStatusProcedure = protectedProcedure
  .input(z.object({
    userId: z.string()
  }))
  .mutation(async ({ input }) => {
    const user = mockUsers.get(input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.active = !user.active;
    mockUsers.set(input.userId, user);
    
    return { success: true, user };
  });

export const bulkUpdateUsersProcedure = protectedProcedure
  .input(z.object({
    userIds: z.array(z.string()),
    action: z.enum(['activate', 'deactivate', 'delete', 'promote', 'demote']),
    role: z.enum(['admin', 'moderator', 'member', 'guest']).optional()
  }))
  .mutation(async ({ input }) => {
    const results = [];
    
    for (const userId of input.userIds) {
      const user = mockUsers.get(userId);
      if (!user) continue;
      
      switch (input.action) {
        case 'activate':
          user.active = true;
          break;
        case 'deactivate':
          user.active = false;
          break;
        case 'delete':
          mockUsers.delete(userId);
          results.push({ userId, success: true });
          continue;
        case 'promote':
        case 'demote':
          if (input.role) {
            user.role = input.role;
          }
          break;
      }
      
      mockUsers.set(userId, user);
      results.push({ userId, success: true });
    }
    
    return { success: true, results };
  });