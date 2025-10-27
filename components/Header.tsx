import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Colors from '@/constants/colors';
import { churchInfo } from '@/constants/onboarding';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { User } from 'lucide-react-native';
import Logo from './Logo';

interface HeaderProps {
  greeting?: boolean;
}

export default function Header({ greeting = false }: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();
  const styles = createStyles(isDark);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      {greeting ? (
        <View style={styles.greetingSection}>
          <View style={styles.logoAndGreeting}>
            <View style={[styles.userAvatar, { backgroundColor: isDark ? Colors.dark.accentLight : Colors.light.accentLight }]}>
              {user?.photoUri ? (
                <Image source={{ uri: user.photoUri }} style={styles.avatarImage} />
              ) : (
                <User size={24} color={isDark ? Colors.dark.accent : Colors.light.accent} />
              )}
            </View>
            <View style={styles.greetingTextContainer}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.emoji}>👋</Text>
              </View>
              <Text style={styles.churchName}>{user?.name || 'Guest'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.titleSection}>
          <Logo size="small" showText={false} style={styles.headerLogo} />
          <Text style={styles.title}>{churchInfo.shortName}</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? Colors.dark.text : Colors.light.text,
    marginLeft: 12,
  },
  greetingSection: {
    flex: 1,
  },
  logoAndGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? Colors.dark.text : Colors.light.text,
  },
  emoji: {
    fontSize: 24,
    marginLeft: 8,
  },
  churchName: {
    fontSize: 14,
    color: isDark ? Colors.dark.accent : Colors.light.accent,
    marginTop: 4,
    fontWeight: '500',
  },
});