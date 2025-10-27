import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, Download, MessageCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import YouTubePlayer from '@/components/YouTubePlayer';
import { isYouTubeUrl } from '@/lib/youtube';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/store/themeStore';
import type { Sermon } from '@/types';

interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

const mockComments: Comment[] = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    content: 'This sermon truly blessed me! The message about faith was exactly what I needed to hear.',
    createdAt: '2 days ago',
    likes: 12,
  },
  {
    id: '2',
    userName: 'Michael Brown',
    content: 'Powerful word from God. Thank you Pastor for your obedience to deliver this message.',
    createdAt: '3 days ago',
    likes: 8,
  },
  {
    id: '3',
    userName: 'Emily Davis',
    content: 'Amen! This is a message the church needs to hear.',
    createdAt: '4 days ago',
    likes: 5,
  },
];

export default function SermonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { data: content } = trpc.admin.content.get.useQuery();
  const sermon = content?.sermons.find((s: Sermon) => s.id === id);

  if (!sermon) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Sermon not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasYouTube = sermon.videoUrl && isYouTubeUrl(sermon.videoUrl);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this sermon: ${sermon.title} by ${sermon.speaker}`,
        url: sermon.videoUrl,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hasYouTube && sermon.videoUrl && (
          <YouTubePlayer url={sermon.videoUrl} style={styles.videoPlayer} />
        )}

        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{sermon.title}</Text>
          <Text style={[styles.speaker, { color: colors.accent }]}>{sermon.speaker}</Text>
          
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.subtext }]}>{sermon.date}</Text>
            <View style={styles.dot} />
            <Text style={[styles.metaText, { color: colors.subtext }]}>{sermon.duration}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => setLiked(!liked)}
            >
              <Heart 
                size={20} 
                color={liked ? colors.accent : colors.text} 
                fill={liked ? colors.accent : 'transparent'} 
              />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {liked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => setShowComments(!showComments)}
            >
              <MessageCircle size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {mockComments.length} Comments
              </Text>
            </TouchableOpacity>

            {sermon.audioUrl && (
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
                <Download size={20} color={colors.text} />
                <Text style={[styles.actionText, { color: colors.text }]}>Download</Text>
              </TouchableOpacity>
            )}
          </View>

          {sermon.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Sermon</Text>
              <Text style={[styles.description, { color: colors.subtext }]}>
                {sermon.description}
              </Text>
            </View>
          )}

          {showComments && (
            <View style={styles.commentsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Comments ({mockComments.length})
              </Text>
              
              {mockComments.map((comment) => (
                <View key={comment.id} style={[styles.commentItem, { backgroundColor: colors.card }]}>
                  <View style={styles.commentHeader}>
                    <View style={[styles.commentAvatar, { backgroundColor: colors.accent }]}>
                      <Text style={styles.commentAvatarText}>
                        {comment.userName.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.commentInfo}>
                      <Text style={[styles.commentName, { color: colors.text }]}>
                        {comment.userName}
                      </Text>
                      <Text style={[styles.commentTime, { color: colors.subtext }]}>
                        {comment.createdAt}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.commentContent, { color: colors.text }]}>
                    {comment.content}
                  </Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.commentAction}>
                      <Heart size={14} color={colors.subtext} />
                      <Text style={[styles.commentActionText, { color: colors.subtext }]}>
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentAction}>
                      <MessageCircle size={14} color={colors.subtext} />
                      <Text style={[styles.commentActionText, { color: colors.subtext }]}>
                        Reply
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  speaker: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  commentsContainer: {
    marginBottom: 24,
  },
  commentItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentInfo: {
    flex: 1,
  },
  commentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
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
