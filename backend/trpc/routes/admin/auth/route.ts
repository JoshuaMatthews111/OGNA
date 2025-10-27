import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';

const CHIEF_ADMIN = {
  email: 'mr.matthews2022@gmail.com',
  password: 'JoshFlaww96!!',
  id: 'chief-admin',
  name: 'Chief Administrator',
  role: 'admin' as const
};

const ADMIN_CREDENTIALS = {
  username: 'ProphetJoshua',
  password: 'JoshFlaww96!!'
};

const accessKeys = new Map<string, { key: string; role: 'admin' | 'moderator' | 'member'; expiresAt: Date; createdBy: string; used: boolean }>();

function generateAccessKey(): string {
  return 'OGN-' + Math.random().toString(36).substring(2, 15).toUpperCase() + '-' + Math.random().toString(36).substring(2, 15).toUpperCase();
}

export const adminAuthProcedure = publicProcedure
  .input(z.object({
    username: z.string(),
    password: z.string()
  }))
  .mutation(async ({ input }) => {
    if (input.username === ADMIN_CREDENTIALS.username && input.password === ADMIN_CREDENTIALS.password) {
      return {
        success: true,
        user: {
          id: 'admin-1',
          username: 'ProphetJoshua',
          role: 'admin' as const,
          staffName: 'Prophet Joshua Matthews'
        }
      };
    }
    throw new Error('Invalid credentials');
  });

export const chiefAdminAuthProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string()
  }))
  .mutation(async ({ input }) => {
    if (input.email === CHIEF_ADMIN.email && input.password === CHIEF_ADMIN.password) {
      return {
        success: true,
        user: {
          id: CHIEF_ADMIN.id,
          email: CHIEF_ADMIN.email,
          name: CHIEF_ADMIN.name,
          role: CHIEF_ADMIN.role,
          permissions: ['all']
        }
      };
    }
    throw new Error('Invalid chief admin credentials');
  });

export const generateAccessKeyProcedure = protectedProcedure
  .input(z.object({
    role: z.enum(['admin', 'moderator', 'member']),
    expiresInDays: z.number().default(30)
  }))
  .mutation(async ({ input, ctx }) => {
    const key = generateAccessKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
    
    accessKeys.set(key, {
      key,
      role: input.role,
      expiresAt,
      createdBy: 'admin',
      used: false
    });
    
    return {
      key,
      role: input.role,
      expiresAt: expiresAt.toISOString()
    };
  });

export const validateAccessKeyProcedure = publicProcedure
  .input(z.object({
    key: z.string()
  }))
  .mutation(async ({ input }) => {
    const keyData = accessKeys.get(input.key);
    
    if (!keyData) {
      throw new Error('Invalid access key');
    }
    
    if (keyData.used) {
      throw new Error('Access key already used');
    }
    
    if (new Date() > keyData.expiresAt) {
      throw new Error('Access key expired');
    }
    
    keyData.used = true;
    
    return {
      valid: true,
      role: keyData.role
    };
  });

export const listAccessKeysProcedure = protectedProcedure
  .query(async () => {
    return Array.from(accessKeys.values()).map(key => ({
      key: key.key,
      role: key.role,
      expiresAt: key.expiresAt.toISOString(),
      used: key.used,
      createdBy: key.createdBy
    }));
  });