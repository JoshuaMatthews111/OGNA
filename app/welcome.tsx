import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Users, UserPlus } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { churchInfo } from '@/constants/onboarding';
import Colors from '@/constants/colors';
import Logo from '@/components/Logo';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { setWelcomeSeen, loginAsGuest } = useAuthStore();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleAdminLogin = () => {
    setWelcomeSeen();
    router.push('/login?role=admin');
  };

  const handleMemberLogin = () => {
    setWelcomeSeen();
    router.push('/login?role=member');
  };

  const handleNewUser = () => {
    setWelcomeSeen();
    router.push('/login?mode=register');
  };

  const handleGuestAccess = () => {
    setWelcomeSeen();
    loginAsGuest();
    router.replace('/onboarding');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.primary} />
      
      {/* Background Image */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=1200&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      
      <SafeAreaView style={styles.content}>
        {/* Logo/Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Logo size="large" showText={false} style={styles.headerLogo} />
          <Text style={styles.title}>{churchInfo.name}</Text>
          <Text style={styles.subtitle}>Welcome to our community</Text>
          <Text style={styles.founderText}>Founded by {churchInfo.founder}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={handleAdminLogin}>
            <View style={styles.optionIcon}>
              <Shield size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Admin Login</Text>
              <Text style={styles.optionSubtitle}>Church administration access</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleMemberLogin}>
            <View style={styles.optionIcon}>
              <Users size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Member Login</Text>
              <Text style={styles.optionSubtitle}>Existing member sign in</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleNewUser}>
            <View style={styles.optionIcon}>
              <UserPlus size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>New User</Text>
              <Text style={styles.optionSubtitle}>Create your account</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestButton} onPress={handleGuestAccess}>
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>&ldquo;{churchInfo.mission}&rdquo;</Text>
          <Text style={styles.contactText}>{churchInfo.email}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 60,
  },
  headerLogo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  founderText: {
    fontSize: 14,
    color: Colors.dark.accent,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: 'rgba(26, 26, 46, 0.7)',
  },
  guestButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});