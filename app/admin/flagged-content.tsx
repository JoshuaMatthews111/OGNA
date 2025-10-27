import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, AlertTriangle, Check, X } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/store/themeStore';
import { useAdminStore } from '@/store/adminStore';

export default function FlaggedContentScreen() {
  const { colors } = useTheme();
  const { isAdminAuthenticated } = useAdminStore();

  const flaggedQuery = trpc.community.posts.flagged.useQuery(undefined, {
    enabled: isAdminAuthenticated,
    refetchOnMount: true,
  });

  const reviewMutation = trpc.community.posts.reviewFlagged.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Post reviewed successfully');
      flaggedQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleReview = (postId: string, action: 'approve' | 'remove') => {
    const actionText = action === 'approve' ? 'approve' : 'remove';
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${actionText} this post?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'remove' ? 'destructive' : 'default',
          onPress: () => reviewMutation.mutate({ postId, action }),
        },
      ]
    );
  };

  if (!isAdminAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Please login as an admin</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Flagged Content</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={flaggedQuery.isRefetching}
            onRefresh={() => flaggedQuery.refetch()}
          />
        }
      >
        {flaggedQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.subtext }]}>Loading flagged content...</Text>
          </View>
        ) : flaggedQuery.data && flaggedQuery.data.length > 0 ? (
          <View style={styles.list}>
            {flaggedQuery.data.map((item: any) => (
              <View key={item.postId} style={[styles.flaggedCard, { backgroundColor: colors.card }]}>
                <View style={styles.flaggedHeader}>
                  <View style={[styles.flagBadge, { backgroundColor: '#FF6B6B' }]}>
                    <AlertTriangle size={16} color="#FFF" />
                    <Text style={styles.flagBadgeText}>Flagged</Text>
                  </View>
                  <Text style={[styles.flagReason, { color: colors.subtext }]}>{item.reason}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
                  <Text style={[styles.timestamp, { color: colors.subtext }]}>
                    {new Date(item.flaggedAt).toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.contentBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.contentText, { color: colors.text }]}>{item.content}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleReview(item.postId, 'approve')}
                    disabled={reviewMutation.isPending}
                  >
                    <Check size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton, { backgroundColor: '#FF6B6B' }]}
                    onPress={() => handleReview(item.postId, 'remove')}
                    disabled={reviewMutation.isPending}
                  >
                    <X size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <AlertTriangle size={48} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No flagged content</Text>
            <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
              All posts are clean! No content requires review.
            </Text>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  flaggedCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flaggedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  flagBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  flagReason: {
    fontSize: 12,
    flex: 1,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  contentBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {},
  removeButton: {},
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});
