import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Event } from '@/types';
import { upcomingEvents } from '@/mocks/events';

interface EventState {
  events: Event[];
  reminders: Record<string, boolean>;
  toggleReminder: (eventId: string) => void;
  hasReminder: (eventId: string) => boolean;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: upcomingEvents,
      reminders: {},
      toggleReminder: (eventId: string) => {
        set((state) => {
          const newReminders = { ...state.reminders };
          newReminders[eventId] = !newReminders[eventId];
          return { reminders: newReminders };
        });
      },
      hasReminder: (eventId: string) => {
        return !!get().reminders[eventId];
      },
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);