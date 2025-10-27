import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Info, RefreshCw, Bell, Shield, HelpCircle, User, LogOut, Settings, Moon, Sun, Smartphone, Camera } from 'lucide-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme, ThemeMode } from '@/store/themeStore';
import { router } from 'expo-router';
import { churchInfo } from '@/constants/onboarding';
import Logo from '@/components/Logo';
import { chooseImageSource, uploadImageToServer } from '@/lib/imageUpload';

export default function ProfileScreen() {
  const { resetOnboarding } = useOnboardingStore();
  const { user, logout, updateUserPhoto } = useAuthStore();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the welcome screens again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetOnboarding();
              setTimeout(() => {
                router.replace('/onboarding');
              }, 200);
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('Error', 'Failed to reset onboarding. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setTimeout(() => {
                router.replace('/welcome');
              }, 200);
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Smartphone;
    }
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    rightComponent 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
          <Icon size={20} color={colors.accent} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.subtext }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showChevron && <ChevronRight size={20} color={colors.subtext} />)}
    </TouchableOpacity>
  );

  const ThemeOption = ({ mode, label }: { mode: ThemeMode; label: string }) => {
    const Icon = getThemeIcon(mode);
    return (
      <TouchableOpacity 
        style={[styles.themeOption, 
          { 
            backgroundColor: themeMode === mode ? colors.accentLight : colors.card,
            borderColor: themeMode === mode ? colors.accent : colors.border 
          }
        ]} 
        onPress={() => handleThemeChange(mode)}
      >
        <Icon size={20} color={themeMode === mode ? colors.accent : colors.subtext} />
        <Text style={[styles.themeLabel, { color: themeMode === mode ? colors.accent : colors.text }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleChoosePhoto = async () => {
    if (isUploadingPhoto) return;
    
    try {
      setIsUploadingPhoto(true);
      const result = await chooseImageSource({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result) {
        // Upload to server (or use local URI for now)
        const photoUri = await uploadImageToServer(result.uri);
        updateUserPhoto(photoUri);
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      Alert.alert('Error', 'Failed to update profile photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.profileHeader}>
              <TouchableOpacity 
                style={[styles.avatarContainer, { backgroundColor: colors.accentLight }]}
                onPress={handleChoosePhoto}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <ActivityIndicator size="large" color={colors.accent} />
                ) : user?.photoUri ? (
                  <Image source={{ uri: user.photoUri }} style={styles.avatarImageLarge} />
                ) : (
                  <User size={32} color={colors.accent} />
                )}
                {!isUploadingPhoto && (
                  <View style={[styles.cameraButton, { backgroundColor: colors.accent }]}>
                    <Camera size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'Guest User'}</Text>
                <Text style={[styles.profileEmail, { color: colors.subtext }]}>{user?.email || 'guest@local'}</Text>
                <Text style={[styles.profileRole, { color: colors.accent }]}>{user?.role?.toUpperCase() || 'GUEST'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon={Bell}
              title="Notifications"
              subtitle="Manage your notification preferences"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                  {isDark ? <Moon size={20} color={colors.accent} /> : <Sun size={20} color={colors.accent} />}
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.subtext }]}>Choose your preferred theme</Text>
                </View>
              </View>
            </View>
            <View style={styles.themeOptions}>
              <ThemeOption mode="light" label="Light" />
              <ThemeOption mode="dark" label="Dark" />
              <ThemeOption mode="system" label="System" />
            </View>
          </View>
        </View>

        {/* Church Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <View style={[styles.churchInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Logo size="medium" showText={false} style={styles.churchLogo} />
            <Text style={[styles.churchName, { color: colors.accent }]}>{churchInfo.name}</Text>
            <Text style={[styles.pastorName, { color: colors.text }]}>Founded by {churchInfo.founder}</Text>
            <Text style={[styles.churchMission, { color: colors.subtext }]}>&quot;{churchInfo.mission}&quot;</Text>
            <View style={[styles.churchDetails, { borderTopColor: colors.border }]}>
              <Text style={[styles.churchDetail, { color: colors.subtext }]}>Location: {churchInfo.location}</Text>
              <Text style={[styles.churchDetail, { color: colors.subtext }]}>Email: {churchInfo.email}</Text>
              <Text style={[styles.churchDetail, { color: colors.subtext }]}>Website: {churchInfo.website}</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon={RefreshCw}
              title="Reset Onboarding"
              subtitle="Show welcome screens again"
              onPress={handleResetOnboarding}
            />
            <SettingItem
              icon={LogOut}
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* Administration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Administration</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon={Settings}
              title="Admin Panel"
              subtitle="Staff access to manage app content"
              onPress={() => router.push('/admin/login')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Get help with the app"
              onPress={() => {}}
            />
            <SettingItem
              icon={Shield}
              title="Privacy Policy"
              subtitle="Learn about our privacy practices"
              onPress={() => {}}
            />
            <SettingItem
              icon={Info}
              title="About App"
              subtitle="Version 1.0.0"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  churchInfoCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  churchLogo: {
    marginBottom: 16,
  },
  churchName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  pastorName: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  churchMission: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  churchDetails: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  churchDetail: {
    fontSize: 13,
    marginBottom: 4,
  },
  settingsGroup: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImageLarge: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
  },
});