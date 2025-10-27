import "@rork/polyfills";
import { BundleInspector } from '@rork/inspector';
import { RorkSafeInsets } from '@rork/safe-insets';
import { RorkErrorBoundary } from '@rork/rork-error-boundary';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import MusicPlayer from '@/components/MusicPlayer';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { ThemeProvider as CustomThemeProvider } from '@/store/themeStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <BundleInspector><RorkSafeInsets><RorkErrorBoundary><RootLayoutNav /></RorkErrorBoundary></RorkSafeInsets></BundleInspector>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding } = useOnboardingStore();
  const { isAuthenticated, hasSeenWelcome } = useAuthStore();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CustomThemeProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
            {!hasSeenWelcome ? (
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
            ) : !isAuthenticated ? (
              <Stack.Screen name="login" options={{ headerShown: false }} />
            ) : !hasCompletedOnboarding ? (
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            ) : (
              <>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="live" options={{ headerShown: false }} />
                <Stack.Screen name="admin/login" options={{ headerShown: false }} />
                <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
                <Stack.Screen name="admin/users" options={{ headerShown: false }} />
                <Stack.Screen name="admin/team" options={{ headerShown: false }} />
                <Stack.Screen name="admin/community" options={{ headerShown: false }} />
                <Stack.Screen name="admin/messages" options={{ headerShown: false }} />
                <Stack.Screen name="admin/images" options={{ headerShown: false }} />
                <Stack.Screen name="admin/sermons" options={{ headerShown: false }} />
                <Stack.Screen name="admin/live-videos" options={{ headerShown: false }} />
                <Stack.Screen name="admin/analytics" options={{ headerShown: false }} />
                <Stack.Screen name="admin/settings" options={{ headerShown: false }} />
                <Stack.Screen name="admin/manage" options={{ headerShown: false }} />
                <Stack.Screen name="admin/events" options={{ headerShown: false }} />
                <Stack.Screen name="admin/music" options={{ headerShown: false }} />
                <Stack.Screen name="admin/store" options={{ headerShown: false }} />
                <Stack.Screen name="admin/app-editor" options={{ headerShown: false }} />
                <Stack.Screen name="admin/push-notifications" options={{ headerShown: false }} />
              </>
            )}
            </Stack>
            {hasCompletedOnboarding && isAuthenticated && <MusicPlayer />}
          </ThemeProvider>
        </CustomThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}