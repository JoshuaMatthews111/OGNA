import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  accentLight: string;
}

export interface AppBranding {
  appName: string;
  churchName: string;
  founder: string;
  mission: string;
  location: string;
  email: string;
  website: string;
  phone: string;
  logoUrl?: string;
  splashUrl?: string;
  iconUrl?: string;
}

export interface AppImages {
  welcomeBackground?: string;
  onboardingScreens: string[];
  homeHeroImage?: string;
  exploreHeroImage?: string;
  communityHeroImage?: string;
  givingImage?: string;
  discipleshipImage?: string;
}

export interface AppFeatures {
  enableLiveStream: boolean;
  enableSermons: boolean;
  enableEvents: boolean;
  enableCommunity: boolean;
  enableGiving: boolean;
  enableDiscipleship: boolean;
  enableShop: boolean;
  enableMusic: boolean;
  enableNotifications: boolean;
}

export interface AppConfig {
  lightColors: AppColors;
  darkColors: AppColors;
  branding: AppBranding;
  images: AppImages;
  features: AppFeatures;
  lastUpdated: string;
}

const defaultLightColors: AppColors = {
  primary: '#4F46E5',
  secondary: '#8B5CF6',
  accent: '#10B981',
  background: '#FFFFFF',
  card: '#F9FAFB',
  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  accentLight: '#D1FAE5',
};

const defaultDarkColors: AppColors = {
  primary: '#6366F1',
  secondary: '#A78BFA',
  accent: '#34D399',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  subtext: '#9CA3AF',
  border: '#374151',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
  accentLight: '#065F46',
};

const defaultBranding: AppBranding = {
  appName: 'Overcomers App',
  churchName: 'Overcomers Church',
  founder: 'Prophet Joshua',
  mission: 'Empowering believers to overcome through faith',
  location: 'Global',
  email: 'info@overcomerchurch.org',
  website: 'www.overcomerchurch.org',
  phone: '+1 (555) 123-4567',
};

const defaultImages: AppImages = {
  onboardingScreens: [],
};

const defaultFeatures: AppFeatures = {
  enableLiveStream: true,
  enableSermons: true,
  enableEvents: true,
  enableCommunity: true,
  enableGiving: true,
  enableDiscipleship: true,
  enableShop: true,
  enableMusic: true,
  enableNotifications: true,
};

interface AppConfigState {
  config: AppConfig;
  updateLightColors: (colors: Partial<AppColors>) => Promise<void>;
  updateDarkColors: (colors: Partial<AppColors>) => Promise<void>;
  updateBranding: (branding: Partial<AppBranding>) => Promise<void>;
  updateImages: (images: Partial<AppImages>) => Promise<void>;
  updateFeatures: (features: Partial<AppFeatures>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  exportConfig: () => AppConfig;
  importConfig: (config: AppConfig) => Promise<void>;
}

export const useAppConfigStore = create<AppConfigState>()(persist(
  (set, get) => ({
    config: {
      lightColors: defaultLightColors,
      darkColors: defaultDarkColors,
      branding: defaultBranding,
      images: defaultImages,
      features: defaultFeatures,
      lastUpdated: new Date().toISOString(),
    },
    updateLightColors: async (colors: Partial<AppColors>) => {
      set((state) => ({
        config: {
          ...state.config,
          lightColors: { ...state.config.lightColors, ...colors },
          lastUpdated: new Date().toISOString(),
        },
      }));
    },
    updateDarkColors: async (colors: Partial<AppColors>) => {
      set((state) => ({
        config: {
          ...state.config,
          darkColors: { ...state.config.darkColors, ...colors },
          lastUpdated: new Date().toISOString(),
        },
      }));
    },
    updateBranding: async (branding: Partial<AppBranding>) => {
      set((state) => ({
        config: {
          ...state.config,
          branding: { ...state.config.branding, ...branding },
          lastUpdated: new Date().toISOString(),
        },
      }));
    },
    updateImages: async (images: Partial<AppImages>) => {
      set((state) => ({
        config: {
          ...state.config,
          images: { ...state.config.images, ...images },
          lastUpdated: new Date().toISOString(),
        },
      }));
    },
    updateFeatures: async (features: Partial<AppFeatures>) => {
      set((state) => ({
        config: {
          ...state.config,
          features: { ...state.config.features, ...features },
          lastUpdated: new Date().toISOString(),
        },
      }));
    },
    resetToDefaults: async () => {
      set({
        config: {
          lightColors: defaultLightColors,
          darkColors: defaultDarkColors,
          branding: defaultBranding,
          images: defaultImages,
          features: defaultFeatures,
          lastUpdated: new Date().toISOString(),
        },
      });
      await AsyncStorage.removeItem('app-config-storage');
    },
    exportConfig: () => get().config,
    importConfig: async (config: AppConfig) => {
      set({ config: { ...config, lastUpdated: new Date().toISOString() } });
    },
  }),
  {
    name: 'app-config-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));
