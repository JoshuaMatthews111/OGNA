import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: string;
}

interface MusicPlayerState {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  sound: Sound | null;
  position: number;
  duration: number;
  isLoading: boolean;
  
  setCurrentTrack: (track: Track) => Promise<void>;
  setPlaylist: (tracks: Track[]) => void;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

export const useMusicPlayer = create<MusicPlayerState>()(persist(
  (set, get) => ({
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    sound: null,
    position: 0,
    duration: 0,
    isLoading: false,

    setCurrentTrack: async (track: Track) => {
      const state = get();
      
      if (state.sound) {
        await state.sound.unloadAsync();
      }

      set({ isLoading: true, currentTrack: track });

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              set({
                position: status.positionMillis,
                duration: status.durationMillis || 0,
                isPlaying: status.isPlaying,
              });
            }
          }
        );

        set({ sound, isPlaying: true, isLoading: false });
      } catch (error) {
        console.error('Error loading track:', error);
        set({ isLoading: false });
      }
    },

    setPlaylist: (tracks: Track[]) => set({ playlist: tracks }),

    play: async () => {
      const state = get();
      if (state.sound) {
        await state.sound.playAsync();
        set({ isPlaying: true });
      } else if (state.currentTrack) {
        await state.setCurrentTrack(state.currentTrack);
      }
    },

    pause: async () => {
      const state = get();
      if (state.sound) {
        await state.sound.pauseAsync();
        set({ isPlaying: false });
      }
    },

    stop: async () => {
      const state = get();
      if (state.sound) {
        await state.sound.stopAsync();
        await state.sound.unloadAsync();
        set({ sound: null, isPlaying: false, position: 0 });
      }
    },

    next: async () => {
      const state = get();
      if (state.playlist.length === 0) return;

      const currentIndex = state.playlist.findIndex(t => t.id === state.currentTrack?.id);
      const nextIndex = (currentIndex + 1) % state.playlist.length;
      await state.setCurrentTrack(state.playlist[nextIndex]);
    },

    previous: async () => {
      const state = get();
      if (state.playlist.length === 0) return;

      const currentIndex = state.playlist.findIndex(t => t.id === state.currentTrack?.id);
      const prevIndex = currentIndex === 0 ? state.playlist.length - 1 : currentIndex - 1;
      await state.setCurrentTrack(state.playlist[prevIndex]);
    },

    seekTo: async (position: number) => {
      const state = get();
      if (state.sound) {
        await state.sound.setPositionAsync(position);
      }
    },

    setVolume: async (volume: number) => {
      const state = get();
      if (state.sound) {
        await state.sound.setVolumeAsync(volume);
      }
    },
  }),
  {
    name: 'music-player-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      currentTrack: state.currentTrack,
      playlist: state.playlist,
    }),
  }
));
