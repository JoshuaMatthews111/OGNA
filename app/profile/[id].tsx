import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, UserPlus, MapPin, Calendar, Heart, Users, Settings, Share } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { UserProfile } from '@/types';

const mockUser: UserProfile = {
  id: '1',
  name: 'Sarah Matthews',
  email: 'sarah@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
  bio: 'Follower of Christ, mother of two, worship leader at Overcomers Global Network. Passionate about serving God and building community.',
  location: 'Mentor, OH',
  joinDate: '2023-06-15T10:00:00Z',
  role: 'member',
  isOnline: true,
  lastSeen: '2024-01-20T16:00:00Z',
  groups: ['1', '2'],
  followers: ['2', '3', '4', '5'],
  following: ['2', '4', '6', '7'],
  postsCount: 15,
  testimoniesCount: 3,
  prayerRequestsCount: 2,
  privacy: {
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    showOnlineStatus: true,
  },
};

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'testimonies' | 'prayers'>('posts');

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Alert.alert(
      isFollowing ? 'Unfollowed' : 'Following',
      isFollowing ? 'You are no longer following this user.' : 'You are now following this user.'
    );
  };

  const handleMessage = () => {
    router.push(`/messages/${id}`);
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Profile link copied to clipboard.');
  };

  const renderTabButton = (tab: 'posts' | 'testimonies' | 'prayers', title: string, count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabCount, activeTab === tab && styles.activeTabCount]}>{count}</Text>
      <Text style={[styles.tabTitle, activeTab === tab && styles.activeTabTitle]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share size={20} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
            {mockUser.privacy.showOnlineStatus && mockUser.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          
          <Text style={styles.name}>{mockUser.name}</Text>
          
          {mockUser.bio && (
            <Text style={styles.bio}>{mockUser.bio}</Text>
          )}
          
          <View style={styles.locationContainer}>
            {mockUser.privacy.showLocation && mockUser.location && (
              <View style={styles.locationItem}>
                <MapPin size={16} color={Colors.dark.subtext} />
                <Text style={styles.locationText}>{mockUser.location}</Text>
              </View>
            )}
            <View style={styles.locationItem}>
              <Calendar size={16} color={Colors.dark.subtext} />
              <Text style={styles.locationText}>
                Joined {new Date(mockUser.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockUser.followers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockUser.following.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockUser.groups.length}</Text>
              <Text style={styles.statLabel}>Groups</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollow}
            >
              <UserPlus size={18} color={isFollowing ? Colors.dark.text : Colors.dark.background} />
              <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            {mockUser.privacy.allowDirectMessages && (
              <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
                <MessageCircle size={18} color={Colors.dark.text} />
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.tabsContainer}>
          {renderTabButton('posts', 'Posts', mockUser.postsCount)}
          {renderTabButton('testimonies', 'Testimonies', mockUser.testimoniesCount)}
          {renderTabButton('prayers', 'Prayers', mockUser.prayerRequestsCount)}
        </View>
        
        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            <View style={styles.emptyState}>
              <Heart size={48} color={Colors.dark.subtext} />
              <Text style={styles.emptyStateTitle}>No posts yet</Text>
              <Text style={styles.emptyStateText}>When {mockUser.name.split(' ')[0]} shares posts, they'll appear here.</Text>
            </View>
          )}
          
          {activeTab === 'testimonies' && (
            <View style={styles.emptyState}>
              <MessageCircle size={48} color={Colors.dark.subtext} />
              <Text style={styles.emptyStateTitle}>No testimonies yet</Text>
              <Text style={styles.emptyStateText}>When {mockUser.name.split(' ')[0]} shares testimonies, they'll appear here.</Text>
            </View>
          )}
          
          {activeTab === 'prayers' && (
            <View style={styles.emptyState}>
              <Heart size={48} color={Colors.dark.subtext} />
              <Text style={styles.emptyStateTitle}>No prayer requests yet</Text>
              <Text style={styles.emptyStateText}>When {mockUser.name.split(' ')[0]} shares prayer requests, they'll appear here.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.dark.accent,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  bio: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    gap: 8,
  },
  followButton: {
    backgroundColor: Colors.dark.accent,
  },
  followingButton: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  followingButtonText: {
    color: Colors.dark.accent,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: Colors.dark.accent,
  },
  tabCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.subtext,
  },
  activeTabCount: {
    color: Colors.dark.text,
  },
  tabTitle: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  activeTabTitle: {
    color: Colors.dark.accent,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});