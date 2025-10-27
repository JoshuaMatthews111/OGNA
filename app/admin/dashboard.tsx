import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Users, 
  MessageSquare, 
  Image, 
  Video, 
  Music, 
  Settings,
  LogOut,
  BarChart3,
  UserCog,
  MessageCircle,
  Calendar,
  ShoppingBag,
  Palette,
  Bell
} from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { useAdminStore } from '@/store/adminStore';

const menuItems = [
  {
    title: 'Master App Editor',
    description: 'Customize colors, branding & images',
    icon: Palette,
    route: '/admin/app-editor',
    color: '#F59E0B',
  },
  {
    title: 'Push Notifications',
    description: 'Send notifications to users',
    icon: Bell,
    route: '/admin/push-notifications',
    color: '#EF4444',
  },
  {
    title: 'User Management',
    description: 'Manage all app users',
    icon: Users,
    route: '/admin/users',
    color: '#4F46E5',
  },
  {
    title: 'Team Management',
    description: 'Manage admin team members',
    icon: UserCog,
    route: '/admin/team',
    color: '#8B5CF6',
  },
  {
    title: 'Community Monitor',
    description: 'Monitor groups, posts & testimonies',
    icon: MessageCircle,
    route: '/admin/community',
    color: '#10B981',
  },
  {
    title: 'Send Messages',
    description: 'Send messages to users',
    icon: MessageSquare,
    route: '/admin/messages',
    color: '#059669',
  },
  {
    title: 'Events',
    description: 'Manage upcoming events',
    icon: Calendar,
    route: '/admin/events',
    color: '#F59E0B',
  },
  {
    title: 'Content Images',
    description: 'Update app section images',
    icon: Image,
    route: '/admin/images',
    color: '#DC2626',
  },
  {
    title: 'Sermons',
    description: 'Manage sermon content',
    icon: Music,
    route: '/admin/sermons',
    color: '#7C3AED',
  },
  {
    title: 'Music Library',
    description: 'Manage music & audio',
    icon: Music,
    route: '/admin/music',
    color: '#EC4899',
  },
  {
    title: 'Live Videos',
    description: 'Manage live streams',
    icon: Video,
    route: '/admin/live-videos',
    color: '#EA580C',
  },
  {
    title: 'Store',
    description: 'Manage products & orders',
    icon: ShoppingBag,
    route: '/admin/store',
    color: '#8B5CF6',
  },
  {
    title: 'Analytics',
    description: 'View app statistics',
    icon: BarChart3,
    route: '/admin/analytics',
    color: '#0891B2',
  },
  {
    title: 'Settings',
    description: 'Admin preferences',
    icon: Settings,
    route: '/admin/settings',
    color: '#6B7280',
  },
];

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { logoutAdmin, staffName } = useAdminStore();

  const handleLogout = () => {
    logoutAdmin();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.subtext }]}>Welcome back,</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>{staffName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Staff Dashboard</Text>
        
        <View style={styles.grid}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <IconComponent size={24} color={item.color} />
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.menuDescription, { color: colors.subtext }]}>{item.description}</Text>
              </TouchableOpacity>
            );
          })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  welcomeText: {
    fontSize: 16,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 24,
  },
  grid: {
    gap: 16,
  },
  menuItem: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
  },
});