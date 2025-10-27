import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'member' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  photoUri?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasSeenWelcome: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setWelcomeSeen: () => void;
  loginAsGuest: () => void;
  updateUserPhoto: (photoUri: string) => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    isAuthenticated: false,
    hasSeenWelcome: false,
    login: (user: User) => set({ user, isAuthenticated: true }),
    logout: async () => {
      set({ user: null, isAuthenticated: false, hasSeenWelcome: false });
      await AsyncStorage.removeItem('auth-storage');
    },
    setWelcomeSeen: () => set({ hasSeenWelcome: true }),
    loginAsGuest: () => set({ 
      user: { 
        id: 'guest', 
        email: 'guest@local', 
        name: 'Guest User', 
        role: 'guest' 
      }, 
      isAuthenticated: true 
    }),
    updateUserPhoto: (photoUri: string) => set((state) => ({
      user: state.user ? { ...state.user, photoUri } : null
    })),
  }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));