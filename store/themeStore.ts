import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_mode');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference to storage
  const saveTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme_mode', mode);
      setThemeMode(mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  // Get current theme colors based on mode
  const getCurrentTheme = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? Colors.dark : Colors.light;
    }
    return themeMode === 'dark' ? Colors.dark : Colors.light;
  };

  const isDark = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  };

  return {
    themeMode,
    setThemeMode: saveTheme,
    colors: getCurrentTheme(),
    isDark: isDark(),
    isLoading,
    gradients: Colors.gradients,
  };
});