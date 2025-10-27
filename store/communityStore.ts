import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CommunityGroup, Post, Conversation, DirectMessage } from '@/types';

interface CommunityState {
  selectedGroup: CommunityGroup | null;
  selectedConversation: Conversation | null;
  unreadMessages: number;
  drafts: Record<string, string>;
  setSelectedGroup: (group: CommunityGroup | null) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setUnreadMessages: (count: number) => void;
  saveDraft: (key: string, content: string) => void;
  getDraft: (key: string) => string;
  clearDraft: (key: string) => void;
}

export const useCommunityStore = create<CommunityState>()(persist(
  (set, get) => ({
    selectedGroup: null,
    selectedConversation: null,
    unreadMessages: 0,
    drafts: {},
    setSelectedGroup: (group) => set({ selectedGroup: group }),
    setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
    setUnreadMessages: (count) => set({ unreadMessages: count }),
    saveDraft: (key, content) => set((state) => ({
      drafts: { ...state.drafts, [key]: content }
    })),
    getDraft: (key) => get().drafts[key] || '',
    clearDraft: (key) => set((state) => {
      const { [key]: _, ...rest } = state.drafts;
      return { drafts: rest };
    }),
  }),
  {
    name: 'community-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));
