import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, User, Save, Shield, Bell, Palette } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAdminStore } from '@/store/adminStore';

export default function AdminSettings() {
  const { staffName, updateStaffName, logoutAdmin } = useAdminStore();
  const [newStaffName, setNewStaffName] = useState(staffName);
  const [notifications, setNotifications] = useState(true);

  const handleSaveStaffName = () => {
    if (!newStaffName.trim()) {
      Alert.alert('Error', 'Staff name cannot be empty');
      return;
    }

    updateStaffName(newStaffName.trim());
    Alert.alert('Success', 'Staff name updated successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from staff panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logoutAdmin();
            router.replace('/');
          }
        }
      ]
    );
  };

  const settingSections = [
    {
      title: 'Profile Settings',
      icon: User,
      items: [
        {
          title: 'Staff Display Name',
          description: 'Name shown when sending messages',
          component: (
            <View style={styles.staffNameSection}>
              <TextInput
                style={styles.staffNameInput}
                value={newStaffName}
                onChangeText={setNewStaffName}
                placeholder="Enter staff name"
                placeholderTextColor={colors.dark.subtext}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveStaffName}
              >
                <Save size={16} color={colors.dark.background} />
              </TouchableOpacity>
            </View>
          )
        }
      ]
    },
    {
      title: 'App Settings',
      icon: Palette,
      items: [
        {
          title: 'Theme',
          description: 'App appearance settings',
          value: 'Dark Mode',
          onPress: () => Alert.alert('Info', 'Theme customization coming soon')
        },
        {
          title: 'Language',
          description: 'App language settings',
          value: 'English',
          onPress: () => Alert.alert('Info', 'Language settings coming soon')
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          title: 'Push Notifications',
          description: 'Receive notifications for app activity',
          component: (
            <TouchableOpacity
              style={[
                styles.toggle,
                notifications && styles.toggleActive
              ]}
              onPress={() => setNotifications(!notifications)}
            >
              <View style={[
                styles.toggleThumb,
                notifications && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          )
        }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        {
          title: 'Change Password',
          description: 'Update admin login password',
          onPress: () => Alert.alert('Info', 'Password change feature coming soon')
        },
        {
          title: 'Session Timeout',
          description: 'Auto-logout after inactivity',
          value: '30 minutes',
          onPress: () => Alert.alert('Info', 'Session settings coming soon')
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {settingSections.map((section, sectionIndex) => {
          const IconComponent = section.icon;
          return (
            <View key={sectionIndex} style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconComponent size={20} color={colors.dark.accent} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  
                  {'component' in item ? (
                    item.component
                  ) : (
                    <TouchableOpacity
                      style={styles.settingAction}
                      onPress={item.onPress}
                    >
                      {'value' in item && item.value && (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      )}
                      <Text style={styles.settingArrow}>›</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout from Staff Panel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Overcomers Staff Panel v1.0</Text>
          <Text style={styles.footerText}>Overcomers Global Network</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
  },
  settingItem: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.dark.subtext,
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: colors.dark.subtext,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.dark.subtext,
  },
  staffNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 16,
  },
  staffNameInput: {
    flex: 1,
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: colors.dark.text,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  saveButton: {
    backgroundColor: colors.dark.accent,
    padding: 8,
    borderRadius: 6,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.dark.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.dark.accent,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.dark.text,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: colors.dark.background,
  },
  dangerSection: {
    marginTop: 40,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.dark.subtext,
  },
});