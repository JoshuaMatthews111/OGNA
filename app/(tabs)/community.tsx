import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Users, Calendar, Plus, Send, Share2, MoreHorizontal, MessageSquare, Search, Filter, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/authStore';
import CreateGroupModal from '@/components/CreateGroupModal';

const getRoleDisplayName = (role: string, isViewer: boolean): string => {
  if (role === 'admin') {
    return isViewer ? 'Faith Leader' : 'Admin';
  }
  return role;
};

export default function CommunityScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'updates' | 'daily' | 'groups' | 'prayers' | 'testimonies'>('updates');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'general' | 'prayer' | 'testimony' | 'announcement' | 'question'>('general');
  const newPostType: 'text' | 'image' | 'video' | 'link' = 'text';
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const groupsQuery = trpc.community.groups.list.useQuery(undefined, {
    refetchOnMount: true,
  });

  const postsQuery = trpc.community.posts.list.useQuery({
    category: activeTab === 'prayers' ? 'prayer' : undefined,
    limit: 20,
  }, {
    enabled: activeTab === 'prayers' || activeTab === 'updates',
  });

  const dailyDoseQuery = trpc.community.posts.list.useQuery({
    category: 'announcement',
    limit: 20,
  }, {
    enabled: activeTab === 'daily',
  });

  const testimoniesQuery = trpc.community.testimonies.list.useQuery({
    limit: 20,
  }, {
    enabled: activeTab === 'testimonies',
  });

  const joinGroupMutation = trpc.community.groups.join.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'You have joined the group!');
      groupsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const likePostMutation = trpc.community.posts.like.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
    },
  });

  const likeTestimonyMutation = trpc.community.testimonies.like.useMutation({
    onSuccess: () => {
      testimoniesQuery.refetch();
    },
  });

  const addCommentMutation = trpc.community.posts.addComment.useMutation({
    onSuccess: () => {
      setNewComment('');
      setShowComments(null);
      postsQuery.refetch();
      dailyDoseQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const createPostMutation = trpc.community.posts.create.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Post created successfully!');
      setShowCreatePost(false);
      setNewPostContent('');
      postsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleJoinGroup = (groupId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join groups');
      return;
    }
    joinGroupMutation.mutate({ groupId });
  };

  const handleLikePost = (postId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like posts');
      return;
    }
    likePostMutation.mutate({ postId });
  };

  const handleLikeTestimony = (testimonyId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like testimonies');
      return;
    }
    likeTestimonyMutation.mutate({ testimonyId });
  };

  const handleCommentSubmit = (postId: string) => {
    if (!newComment.trim()) return;
    if (!user) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }
    addCommentMutation.mutate({
      postId,
      content: newComment.trim(),
    });
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleDirectMessage = (userId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to send messages');
      return;
    }
    router.push(`/messages/${userId}`);
  };

  const handleCreatePost = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to create posts');
      return;
    }
    setShowCreatePost(true);
  };

  const handleSubmitPost = () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }
    createPostMutation.mutate({
      content: newPostContent.trim(),
      type: newPostType,
      category: newPostCategory,
    });
  };

  const renderTabButton = (tab: 'updates' | 'daily' | 'groups' | 'prayers' | 'testimonies', title: string, icon: React.ReactNode) => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.tabButton, 
        { backgroundColor: activeTab === tab ? colors.accent : 'transparent' }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <View style={styles.tabIcon}>
        {icon}
      </View>
      <Text style={[
        styles.tabButtonText, 
        { color: activeTab === tab ? colors.background : colors.subtext }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = (post: any) => (
    <View key={post.id} style={[styles.postCard, { backgroundColor: colors.card }]}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => handleViewProfile(post.userId)}
        >
          <Image 
            source={{ uri: post.userAvatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{post.userName}</Text>
            <Text style={[styles.timestamp, { color: colors.subtext }]}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
      
      {post.type === 'image' && post.mediaUrl && (
        <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLikePost(post.id)}
          disabled={likePostMutation.isPending}
        >
          <Heart 
            size={18} 
            color={user && post.likes.includes(user.id) ? colors.accent : colors.subtext}
            fill={user && post.likes.includes(user.id) ? colors.accent : 'transparent'}
          />
          <Text style={[styles.actionText, { color: colors.subtext }]}>{post.likes.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowComments(showComments === post.id ? null : post.id)}
        >
          <MessageCircle size={18} color={colors.subtext} />
          <Text style={[styles.actionText, { color: colors.subtext }]}>{post.comments.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Shared', 'Post has been shared')}
        >
          <Share2 size={18} color={colors.subtext} />
          <Text style={[styles.actionText, { color: colors.subtext }]}>{post.shares}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDirectMessage(post.userId)}
        >
          <MessageSquare size={18} color={colors.subtext} />
        </TouchableOpacity>
      </View>
      
      {showComments === post.id && (
        <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
          {post.comments.map((comment: any) => (
            <View key={comment.id} style={styles.comment}>
              <Image 
                source={{ uri: comment.userAvatar || 'https://via.placeholder.com/30' }} 
                style={styles.commentAvatar} 
              />
              <View style={styles.commentContent}>
                <Text style={[styles.commentUserName, { color: colors.text }]}>{comment.userName}</Text>
                <Text style={[styles.commentText, { color: colors.text }]}>{comment.content}</Text>
              </View>
            </View>
          ))}
          
          <View style={styles.commentInput}>
            <TextInput
              style={[styles.commentTextInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.subtext}
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity 
              style={[styles.commentSubmit, { backgroundColor: colors.accent }]}
              onPress={() => handleCommentSubmit(post.id)}
              disabled={addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Send size={16} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderTestimony = (testimony: any) => (
    <View key={testimony.id} style={[styles.postCard, { backgroundColor: colors.card }]}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => handleViewProfile(testimony.userId)}
        >
          <Image 
            source={{ uri: testimony.userAvatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{testimony.userName}</Text>
            <Text style={[styles.timestamp, { color: colors.subtext }]}>
              {new Date(testimony.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.categoryBadge, { backgroundColor: '#4CAF50' }]}>
          <Text style={[styles.categoryText, { color: colors.background }]}>{testimony.category}</Text>
        </View>
      </View>
      
      <Text style={[styles.testimonyTitle, { color: colors.text }]}>{testimony.title}</Text>
      <Text style={[styles.postContent, { color: colors.text }]}>{testimony.content}</Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLikeTestimony(testimony.id)}
          disabled={likeTestimonyMutation.isPending}
        >
          <Heart 
            size={18} 
            color={user && testimony.likes.includes(user.id) ? colors.accent : colors.subtext}
            fill={user && testimony.likes.includes(user.id) ? colors.accent : 'transparent'}
          />
          <Text style={[styles.actionText, { color: colors.subtext }]}>{testimony.likes.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={18} color={colors.subtext} />
          <Text style={[styles.actionText, { color: colors.subtext }]}>{testimony.comments.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={18} color={colors.subtext} />
          <Text style={[styles.actionText, { color: colors.subtext }]}>{testimony.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommunityGroup = (group: any) => {
    const isMember = user && group.members.includes(user.id);
    
    return (
      <TouchableOpacity 
        key={group.id} 
        style={[styles.groupCard, { backgroundColor: colors.card }]} 
        onPress={() => router.push(`/group/${group.id}`)}
      >
        <Image 
          source={{ uri: group.imageUrl || 'https://via.placeholder.com/300x150' }} 
          style={styles.groupImage} 
        />
        <View style={styles.groupContent}>
          <View style={styles.groupHeader}>
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.categoryText, { color: colors.background }]}>{group.category}</Text>
            </View>
          </View>
          <Text style={[styles.groupDescription, { color: colors.subtext }]} numberOfLines={2}>
            {group.description}
          </Text>
          <View style={styles.groupInfo}>
            <View style={styles.groupInfoItem}>
              <Users size={14} color={colors.subtext} />
              <Text style={[styles.groupInfoText, { color: colors.subtext }]}>
                {group.members.length} members
              </Text>
            </View>
            {group.nextMeeting && (
              <View style={styles.groupInfoItem}>
                <Calendar size={14} color={colors.subtext} />
                <Text style={[styles.groupInfoText, { color: colors.subtext }]} numberOfLines={1}>
                  {new Date(group.nextMeeting).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              { backgroundColor: isMember ? colors.background : colors.accent }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              if (!isMember) {
                handleJoinGroup(group.id);
              }
            }}
            disabled={joinGroupMutation.isPending || isMember}
          >
            {joinGroupMutation.isPending ? (
              <ActivityIndicator size="small" color={isMember ? colors.text : colors.background} />
            ) : (
              <>
                {!isMember && <UserPlus size={16} color={colors.background} />}
                <Text 
                  style={[
                    styles.joinButtonText, 
                    { color: isMember ? colors.text : colors.background }
                  ]}
                >
                  {isMember ? 'Joined' : 'Join Group'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const isLoading = groupsQuery.isLoading || postsQuery.isLoading || testimoniesQuery.isLoading;
  const isRefreshing = groupsQuery.isFetching || postsQuery.isFetching || testimoniesQuery.isFetching;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => activeTab === 'groups' ? setShowCreateGroup(true) : handleCreatePost()}
          >
            <Plus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Search community..."
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
            <Filter size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {renderTabButton('updates', 'Updates', <MessageSquare size={18} color={activeTab === 'updates' ? colors.background : colors.subtext} />)}
          {renderTabButton('daily', 'Daily Dose', <Calendar size={18} color={activeTab === 'daily' ? colors.background : colors.subtext} />)}
          {renderTabButton('groups', 'Groups', <Users size={18} color={activeTab === 'groups' ? colors.background : colors.subtext} />)}
          {renderTabButton('prayers', 'Prayer', <Heart size={18} color={activeTab === 'prayers' ? colors.background : colors.subtext} />)}
          {renderTabButton('testimonies', 'Testimonies', <MessageCircle size={18} color={activeTab === 'testimonies' ? colors.background : colors.subtext} />)}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              if (activeTab === 'groups') groupsQuery.refetch();
              if (activeTab === 'prayers') postsQuery.refetch();
              if (activeTab === 'testimonies') testimoniesQuery.refetch();
            }}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {activeTab === 'updates' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Updates</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
                    Share posts, photos, scriptures, and more with the community
                  </Text>
                </View>
                {postsQuery.data && postsQuery.data.posts.length > 0 ? (
                  postsQuery.data.posts.map(renderPost)
                ) : (
                  <Text style={[styles.emptyText, { color: colors.subtext }]}>
                    No updates yet. Be the first to share!
                  </Text>
                )}
              </View>
            )}

            {activeTab === 'daily' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Dose</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
                    Sermons, devotionals, and short videos to inspire your day
                  </Text>
                </View>
                {dailyDoseQuery.data && dailyDoseQuery.data.posts.length > 0 ? (
                  dailyDoseQuery.data.posts.map(renderPost)
                ) : (
                  <Text style={[styles.emptyText, { color: colors.subtext }]}>
                    No content available yet. Check back soon!
                  </Text>
                )}
              </View>
            )}

            {activeTab === 'groups' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Groups</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
                    Join a group to connect with others and grow in faith together
                  </Text>
                </View>
                {groupsQuery.data && groupsQuery.data.length > 0 ? (
                  groupsQuery.data.map(renderCommunityGroup)
                ) : (
                  <Text style={[styles.emptyText, { color: colors.subtext }]}>
                    No groups yet. Create one to get started!
                  </Text>
                )}
              </View>
            )}

            {activeTab === 'prayers' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Prayer Wall</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
                    Share your prayer requests and pray for others
                  </Text>
                </View>
                {postsQuery.data && postsQuery.data.posts.length > 0 ? (
                  postsQuery.data.posts.map(renderPost)
                ) : (
                  <Text style={[styles.emptyText, { color: colors.subtext }]}>
                    No prayer requests yet. Be the first to share!
                  </Text>
                )}
              </View>
            )}

            {activeTab === 'testimonies' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Testimonies</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
                    Share how God is working in your life
                  </Text>
                </View>
                {testimoniesQuery.data && testimoniesQuery.data.testimonies.length > 0 ? (
                  testimoniesQuery.data.testimonies.map(renderTestimony)
                ) : (
                  <Text style={[styles.emptyText, { color: colors.subtext }]}>
                    No testimonies yet. Share your story!
                  </Text>
                )}
              </View>
            )}
          </>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
      
      <CreateGroupModal
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={() => groupsQuery.refetch()}
      />

      {showCreatePost && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.createPostModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Post</Text>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <Text style={[styles.modalClose, { color: colors.subtext }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.categorySelector}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <View style={styles.categoryButtons}>
                  {(['general', 'prayer', 'testimony', 'announcement', 'question'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        { backgroundColor: newPostCategory === cat ? colors.accent : colors.background }
                      ]}
                      onPress={() => setNewPostCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        { color: newPostCategory === cat ? colors.background : colors.text }
                      ]}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Content</Text>
                <TextInput
                  style={[styles.postInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Share your thoughts, scriptures, or photos..."
                  placeholderTextColor={colors.subtext}
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.helperText}>
                <Text style={[styles.helperTextContent, { color: colors.subtext }]}>
                  📖 Tip: Mention scriptures by typing the reference (e.g., &quot;John 3:16&quot;)
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowCreatePost(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={handleSubmitPost}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={[styles.submitButtonText, { color: colors.background }]}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  postCard: {
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
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  testimonyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  commentTextInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  commentSubmit: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  groupImage: {
    width: '100%',
    height: 120,
  },
  groupContent: {
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  groupInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  groupInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupInfoText: {
    fontSize: 12,
  },
  joinButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabScroll: {
    paddingRight: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createPostModal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
  },
  modalContent: {
    padding: 16,
  },
  categorySelector: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  postInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
  },
  helperText: {
    marginBottom: 12,
  },
  helperTextContent: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
