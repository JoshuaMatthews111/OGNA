import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Filter, Users, MessageCircle, Trash2, Shield, AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAdminStore } from '@/store/adminStore';

export default function AdminCommunityScreen() {

  const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'testimonies'>('posts');
  const [searchQuery, setSearchQuery] = useState('');

  const postsQuery = trpc.admin.content.listPosts.useQuery({});

  const testimoniesQuery = trpc.admin.content.listTestimonies.useQuery({});

  const groupsQuery = trpc.community.groups.list.useQuery();

  const deletePostMutation = trpc.admin.content.deletePost.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Post deleted successfully');
      postsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const flagPostMutation = trpc.admin.content.flagPost.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Post flagged successfully');
      postsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const approveTestimonyMutation = trpc.admin.content.approveTestimony.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Testimony approved');
      testimoniesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const deleteTestimonyMutation = trpc.admin.content.deleteTestimony.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Testimony deleted');
      testimoniesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePostMutation.mutate({ postId }),
        },
      ]
    );
  };

  const handleFlagPost = (postId: string) => {
    Alert.alert(
      'Flag Post',
      'Are you sure you want to flag this post for review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flag',
          onPress: () => flagPostMutation.mutate({ postId, reason: 'Flagged by admin' }),
        },
      ]
    );
  };

  const handleApproveTestimony = (testimonyId: string) => {
    approveTestimonyMutation.mutate({ testimonyId });
  };

  const handleDeleteTestimony = (testimonyId: string) => {
    Alert.alert(
      'Delete Testimony',
      'Are you sure you want to delete this testimony?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTestimonyMutation.mutate({ testimonyId }),
        },
      ]
    );
  };

  const renderTabButton = (tab: 'posts' | 'groups' | 'testimonies', title: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <View style={styles.tabIcon}>
        <Text>{icon}</Text>
      </View>
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = (post: any) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => router.push(`/profile/${post.userId}`)}
        >
          <Image 
            source={{ uri: post.userAvatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => handleFlagPost(post.id)}
            disabled={flagPostMutation.isPending}
          >
            <AlertTriangle size={18} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => handleDeletePost(post.id)}
            disabled={deletePostMutation.isPending}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.type === 'image' && post.mediaUrl && (
        <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
      )}
      
      <View style={styles.postStats}>
        <Text style={styles.statText}>{post.likes.length} likes</Text>
        <Text style={styles.statText}>{post.comments.length} comments</Text>
        <Text style={styles.statText}>{post.shares} shares</Text>
      </View>
    </View>
  );

  const renderTestimony = (testimony: any) => (
    <View key={testimony.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => router.push(`/profile/${testimony.userId}`)}
        >
          <Image 
            source={{ uri: testimony.userAvatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.userName}>{testimony.userName}</Text>
            <Text style={styles.timestamp}>
              {new Date(testimony.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.adminActions}>
          {!testimony.isApproved && (
            <TouchableOpacity
              style={[styles.adminButton, styles.approveButton]}
              onPress={() => handleApproveTestimony(testimony.id)}
              disabled={approveTestimonyMutation.isPending}
            >
              <Shield size={18} color="#10B981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => handleDeleteTestimony(testimony.id)}
            disabled={deleteTestimonyMutation.isPending}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      {!testimony.isApproved && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Pending Approval</Text>
        </View>
      )}
      
      <Text style={styles.testimonyTitle}>{testimony.title}</Text>
      <Text style={styles.postContent}>{testimony.content}</Text>
      
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{testimony.category}</Text>
      </View>
    </View>
  );

  const renderGroup = (group: any) => (
    <TouchableOpacity 
      key={group.id} 
      style={styles.groupCard}
      onPress={() => router.push(`/group/${group.id}`)}
    >
      <Image 
        source={{ uri: group.imageUrl || 'https://via.placeholder.com/300x150' }} 
        style={styles.groupImage} 
      />
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupDescription} numberOfLines={2}>
          {group.description}
        </Text>
        <View style={styles.groupStats}>
          <View style={styles.groupStatItem}>
            <Users size={14} color={Colors.dark.subtext} />
            <Text style={styles.groupStatText}>{group.members.length} members</Text>
          </View>
          <View style={[styles.categoryBadge, styles.groupCategoryBadge]}>
            <Text style={styles.categoryText}>{group.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const isLoading = postsQuery.isLoading || testimoniesQuery.isLoading || groupsQuery.isLoading;
  const isRefreshing = postsQuery.isFetching || testimoniesQuery.isFetching || groupsQuery.isFetching;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Monitor</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={Colors.dark.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search community..."
            placeholderTextColor={Colors.dark.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('posts', 'Posts', <MessageCircle size={18} color={activeTab === 'posts' ? Colors.dark.background : Colors.dark.subtext} />)}
        {renderTabButton('groups', 'Groups', <Users size={18} color={activeTab === 'groups' ? Colors.dark.background : Colors.dark.subtext} />)}
        {renderTabButton('testimonies', 'Testimonies', <Shield size={18} color={activeTab === 'testimonies' ? Colors.dark.background : Colors.dark.subtext} />)}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              if (activeTab === 'posts') postsQuery.refetch();
              if (activeTab === 'groups') groupsQuery.refetch();
              if (activeTab === 'testimonies') testimoniesQuery.refetch();
            }}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.accent} />
          </View>
        ) : (
          <>
            {activeTab === 'posts' && (
              <View>
                {postsQuery.data && postsQuery.data.length > 0 ? (
                  postsQuery.data.map(renderPost)
                ) : (
                  <Text style={styles.emptyText}>No posts to review</Text>
                )}
              </View>
            )}

            {activeTab === 'groups' && (
              <View>
                {groupsQuery.data && groupsQuery.data.length > 0 ? (
                  groupsQuery.data.map(renderGroup)
                ) : (
                  <Text style={styles.emptyText}>No groups found</Text>
                )}
              </View>
            )}

            {activeTab === 'testimonies' && (
              <View>
                {testimoniesQuery.data && testimoniesQuery.data.length > 0 ? (
                  testimoniesQuery.data.map(renderTestimony)
                ) : (
                  <Text style={styles.emptyText}>No testimonies to review</Text>
                )}
              </View>
            )}
          </>
        )}
        
        <View style={{ height: 40 }} />
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.dark.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
  },
  activeTabButton: {
    backgroundColor: Colors.dark.accent,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  activeTabButtonText: {
    color: Colors.dark.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.dark.subtext,
    marginTop: 40,
  },
  postCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
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
    flex: 1,
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
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  adminButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#10B98120',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  pendingBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  testimonyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.background,
    textTransform: 'capitalize',
  },
  groupCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  groupImage: {
    width: '100%',
    height: 120,
  },
  groupInfo: {
    padding: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 12,
    lineHeight: 20,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupStatText: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  groupCategoryBadge: {
    backgroundColor: Colors.dark.accent + '40',
  },
});
