import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { useAuthStore, UserRole } from '@/store/authStore';
import { churchInfo } from '@/constants/onboarding';
import Colors from '@/constants/colors';
import Logo from '@/components/Logo';

export default function LoginScreen() {
  const { role, mode } = useLocalSearchParams<{ role?: UserRole; mode?: 'register' }>();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isRegister = mode === 'register';
  const userRole = role || 'member';
  
  const handleSubmit = async () => {
    if (!email || !password || (isRegister && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login/register
      const user = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        role: userRole,
      };
      
      login(user);
      
      if (isRegister) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getTitle = () => {
    if (isRegister) return 'Create Account';
    if (userRole === 'admin') return 'Admin Login';
    return 'Member Login';
  };
  
  const getSubtitle = () => {
    if (isRegister) return `Join the ${churchInfo.name} community`;
    if (userRole === 'admin') return 'Access church administration features';
    return 'Welcome back to your spiritual home';
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color={Colors.primary} />
              </TouchableOpacity>
              
              <Logo size="medium" showText={false} style={styles.headerLogo} />
              
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
            </View>
            
            {/* Form */}
            <View style={styles.form}>
              {isRegister && (
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <User size={20} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholderTextColor="rgba(26, 26, 46, 0.5)"
                  />
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="rgba(26, 26, 46, 0.5)"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="rgba(26, 26, 46, 0.5)"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(26, 26, 46, 0.5)" />
                  ) : (
                    <Eye size={20} color="rgba(26, 26, 46, 0.5)" />
                  )}
                </TouchableOpacity>
              </View>
              
              {!isRegister && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
                </Text>
              </TouchableOpacity>
              
              {/* Switch Mode */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    if (isRegister) {
                      router.replace(`/login?role=${userRole}`);
                    } else {
                      router.replace('/login?mode=register');
                    }
                  }}
                >
                  <Text style={styles.switchLink}>
                    {isRegister ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(26, 26, 46, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: 'rgba(26, 26, 46, 0.7)',
    marginRight: 4,
  },
  switchLink: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
});