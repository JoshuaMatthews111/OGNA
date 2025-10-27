import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  setOnboardingCompleted: () => void;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>()(persist(
  (set) => ({
    hasCompletedOnboarding: false,
    setOnboardingCompleted: () => set({ hasCompletedOnboarding: true }),
    resetOnboarding: async () => {
      set({ hasCompletedOnboarding: false });
      await AsyncStorage.removeItem('onboarding-storage');
    },
  }),
  {
    name: 'onboarding-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));