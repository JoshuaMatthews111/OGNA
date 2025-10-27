import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'moderator' | 'editor';
  staffName: string;
  permissions: AdminPermission[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'users' | 'analytics' | 'settings' | 'messaging' | 'notifications';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'editor';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  createdBy: string;
}

interface AdminState {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  staffName: string;
  teamMembers: TeamMember[];
  permissions: AdminPermission[];
  loginAdmin: (user: AdminUser) => void;
  logoutAdmin: () => void;
  updateStaffName: (name: string) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  setPermissions: (permissions: AdminPermission[]) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAdminStore = create<AdminState>()(persist(
  (set, get) => ({
    adminUser: null,
    isAdminAuthenticated: false,
    staffName: 'Prophet Joshua',
    teamMembers: [],
    permissions: [
      { id: 'content.create', name: 'Create Content', description: 'Create sermons, events, and courses', category: 'content' },
      { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content' },
      { id: 'content.delete', name: 'Delete Content', description: 'Delete content', category: 'content' },
      { id: 'users.view', name: 'View Users', description: 'View user profiles and data', category: 'users' },
      { id: 'users.edit', name: 'Edit Users', description: 'Edit user profiles and roles', category: 'users' },
      { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users' },
      { id: 'messaging.send', name: 'Send Messages', description: 'Send messages to users', category: 'messaging' },
      { id: 'messaging.broadcast', name: 'Broadcast Messages', description: 'Send messages to all users', category: 'messaging' },
      { id: 'notifications.send', name: 'Send Notifications', description: 'Send push notifications to users', category: 'notifications' },
      { id: 'notifications.broadcast', name: 'Broadcast Notifications', description: 'Send notifications to all users', category: 'notifications' },
      { id: 'discipleship.create', name: 'Create Assignments', description: 'Create discipleship assignments', category: 'content' },
      { id: 'discipleship.manage', name: 'Manage Assignments', description: 'Edit and delete assignments', category: 'content' },
      { id: 'analytics.view', name: 'View Analytics', description: 'View app analytics and reports', category: 'analytics' },
      { id: 'settings.edit', name: 'Edit Settings', description: 'Modify app settings', category: 'settings' },
      { id: 'team.manage', name: 'Manage Team', description: 'Add, edit, and remove team members', category: 'settings' },
    ],
    loginAdmin: (user: AdminUser) => set({ 
      adminUser: user, 
      isAdminAuthenticated: true,
      staffName: user.staffName 
    }),
    logoutAdmin: () => set({ 
      adminUser: null, 
      isAdminAuthenticated: false 
    }),
    updateStaffName: (name: string) => set((state) => ({
      staffName: name,
      adminUser: state.adminUser ? { ...state.adminUser, staffName: name } : null
    })),
    addTeamMember: (member: TeamMember) => set((state) => ({
      teamMembers: [...state.teamMembers, member]
    })),
    updateTeamMember: (id: string, updates: Partial<TeamMember>) => set((state) => ({
      teamMembers: state.teamMembers.map(member => 
        member.id === id ? { ...member, ...updates } : member
      )
    })),
    removeTeamMember: (id: string) => set((state) => ({
      teamMembers: state.teamMembers.filter(member => member.id !== id)
    })),
    setPermissions: (permissions: AdminPermission[]) => set({ permissions }),
    hasPermission: (permission: string) => {
      const state = get();
      if (!state.adminUser) return false;
      return state.adminUser.permissions.some(p => p.id === permission);
    },
  }),
  {
    name: 'admin-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));