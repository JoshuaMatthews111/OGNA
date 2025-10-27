import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Calendar, MapPin, Settings, UserPlus, MessageCircle, Share2, Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { CommunityGroup, Post } from '@/types';

const mockGroup: CommunityGroup = {
  id: '1',
  name: 'Young Adults Fellowship',
  description: 'A vibrant community for young adults (ages 18-30) to grow in faith, build meaningful relationships, and serve together. We meet weekly for Bible study, fellowship, and prayer.',
  category: 'fellowship',
  members: ['1', '2', '3', '4', '5', '6', '7', '8'],
  admins: ['1', '2'],
  isPrivate: false,
  imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
  nextMeeting: 'Friday 7:00 PM',
  meetingLocation: 'Fellowship Hall - Room 201',
  createdAt: '2024-01-15T10:00:00Z',
  createdBy: '1',
};

const mockGroupPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sarah Matthews',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    content: 'Looking forward to our Bible study this Friday! We\'ll be diving into Romans 8. Come prepared with questions and an open heart! 📖✨',
    type: 'text',
    groupId: '1',
    category: 'announcement',
    likes: ['2', '3', '4'],
    comments: [],
    shares: 1,
    isEdited: false,
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
  {
    id: '2',
    userId: '2',
    userName: 'John Davis',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    content: 'Great fellowship time last week! Thank you everyone for the prayers and encouragement. This group is such a blessing! 🙏',
    type: 'text',
    groupId: '1',
    category: 'general',
    likes: ['1', '3', '5'],
    comments: [],
    shares: 0,
    isEdited: false,
    createdAt: '2024-01-19T16:00:00Z',
    updatedAt: '2024-01-19T16:00:00Z',
  },
];

const mockMembers = [
  { id: '1', name: 'Sarah Matthews', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100', role: 'admin' },
  { id: '2', name: 'John Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', role: 'admin' },
  { id: '3', name: 'Emily Johnson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', role: 'member' },
  { id: '4', name: 'Michael Brown', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', role: 'member' },
  { id: '5', name: 'Jessica Wilson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100', role: 'member' },
];

export default function GroupScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'about'>('posts');
  const [isMember, setIsMember] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  const handleJoinGroup = () => {
    setIsMember(!isMember);
    Alert.alert(
      isMember ? 'Left Group' : 'Joined Group',
      isMember ? 'You have left this group.' : 'Welcome to the group! You\'ll now receive updates and can participate in discussions.'
    );
  };

  const handleToggleNotifications = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
    Alert.alert(
      'Notifications',
      isNotificationEnabled ? 'Notifications disabled for this group.' : 'Notifications enabled for this group.'
    );
  };

  const renderTabButton = (tab: 'posts' | 'members' | 'about', title: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => router.push(`/profile/${post.userId}`)}
        >
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{new Date(post.createdAt).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
        {post.category === 'announcement' && (
          <View style={styles.announcementBadge}>
            <Text style={styles.announcementText}>Announcement</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>{post.likes.length} likes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={16} color={Colors.dark.subtext} />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={16} color={Colors.dark.subtext} />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMember = (member: any) => (
    <TouchableOpacity 
      key={member.id} 
      style={styles.memberCard}
      onPress={() => router.push(`/profile/${member.id}`)}
    >
      <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
      </View>
      {member.role === 'admin' && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.groupHeader}>
          <Image source={{ uri: mockGroup.imageUrl }} style={styles.groupImage} />
          <View style={styles.groupOverlay}>
            <Text style={styles.groupName}>{mockGroup.name}</Text>
            <View style={styles.groupStats}>
              <View style={styles.statItem}>
                <Users size={16} color={Colors.dark.text} />
                <Text style={styles.statText}>{mockGroup.members.length} members</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{mockGroup.category}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.groupActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.joinButton, isMember && styles.joinedButton]}
            onPress={handleJoinGroup}
          >
            <UserPlus size={18} color={isMember ? Colors.dark.text : Colors.dark.background} />
            <Text style={[styles.actionButtonText, isMember && styles.joinedButtonText]}>
              {isMember ? 'Joined' : 'Join Group'}
            </Text>
          </TouchableOpacity>
          
          {isMember && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.notificationButton, isNotificationEnabled && styles.notificationActiveButton]}
              onPress={handleToggleNotifications}
            >
              <Bell size={18} color={isNotificationEnabled ? Colors.dark.background : Colors.dark.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabsContainer}>
          {renderTabButton('posts', 'Posts')}
          {renderTabButton('members', 'Members')}
          {renderTabButton('about', 'About')}
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            <View>
              {mockGroupPosts.map(renderPost)}
            </View>
          )}

          {activeTab === 'members' && (
            <View>
              <Text style={styles.sectionTitle}>Admins</Text>
              {mockMembers.filter(m => m.role === 'admin').map(renderMember)}
              
              <Text style={styles.sectionTitle}>Members</Text>
              {mockMembers.filter(m => m.role === 'member').map(renderMember)}
            </View>
          )}

          {activeTab === 'about' && (
            <View>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{mockGroup.description}</Text>
              
              <Text style={styles.sectionTitle}>Meeting Details</Text>
              <View style={styles.meetingInfo}>
                <View style={styles.meetingItem}>
                  <Calendar size={20} color={Colors.dark.accent} />
                  <Text style={styles.meetingText}>{mockGroup.nextMeeting}</Text>
                </View>
                <View style={styles.meetingItem}>
                  <MapPin size={20} color={Colors.dark.accent} />
                  <Text style={styles.meetingText}>{mockGroup.meetingLocation}</Text>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Group Info</Text>
              <View style={styles.groupInfo}>
                <Text style={styles.infoText}>Created: {new Date(mockGroup.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.infoText}>Category: {mockGroup.category}</Text>
                <Text style={styles.infoText}>Privacy: {mockGroup.isPrivate ? 'Private' : 'Public'}</Text>
              </View>
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
  settingsButton: {
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
  groupHeader: {
    position: 'relative',
    height: 200,
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  groupOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  categoryBadge: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.background,
    textTransform: 'capitalize',
  },
  groupActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    gap: 8,
  },
  joinButton: {
    flex: 1,
    backgroundColor: Colors.dark.accent,
  },
  joinedButton: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  joinedButtonText: {
    color: Colors.dark.accent,
  },
  notificationButton: {
    width: 48,
  },
  notificationActiveButton: {
    backgroundColor: Colors.dark.accent,
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
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.subtext,
  },
  activeTabButtonText: {
    color: Colors.dark.accent,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 2,
  },
  announcementBadge: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.background,
    textTransform: 'uppercase',
  },
  postContent: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionText: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginLeft: 4,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.dark.subtext,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.background,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  meetingInfo: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  meetingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  meetingText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  groupInfo: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
  },
});