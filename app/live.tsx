import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle, Heart, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import YouTubePlayer from '@/components/YouTubePlayer';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/store/themeStore';

interface Comment {
  id: string;
  name: string;
  text: string;
  time: string;
}

const mockComments: Comment[] = [
  { id: '1', name: 'John Smith', text: 'Amen! This message is exactly what I needed today.', time: '2m ago' },
  { id: '2', name: 'Sarah Johnson', text: 'Praise God for this powerful word!', time: '5m ago' },
  { id: '3', name: 'Michael Brown', text: 'Thank you Pastor for this inspiring message.', time: '8m ago' },
  { id: '4', name: 'Emily Davis', text: 'This is touching my heart deeply.', time: '12m ago' },
  { id: '5', name: 'David Wilson', text: 'God is good all the time!', time: '15m ago' },
];

export default function LiveScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const [liked, setLiked] = useState(false);

  const { data: content } = trpc.admin.content.get.useQuery();
  const liveVideo = content?.liveVideos && content.liveVideos.length > 0 ? content.liveVideos[0] : null;

  if (!liveVideo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>No live stream available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        {liveVideo.status === 'live' && (
          <View style={styles.liveContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <YouTubePlayer url={liveVideo.streamUrl} style={styles.videoPlayer} />

      <View style={styles.infoContainer}>
        <Text style={[styles.streamTitle, { color: colors.text }]}>{liveVideo.title}</Text>
        {liveVideo.scheduledTime && (
          <Text style={[styles.scheduledTime, { color: colors.subtext }]}>
            Scheduled: {new Date(liveVideo.scheduledTime).toLocaleString()}
          </Text>
        )}
      </View>

      <View style={[styles.statsContainer, { borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>1,245</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Watching</Text>
        </View>
        <TouchableOpacity 
          style={[styles.likeButton, { backgroundColor: colors.card }, liked && { backgroundColor: colors.accentLight }]}
          onPress={() => setLiked(!liked)}
        >
          <Heart 
            size={20} 
            color={liked ? colors.accent : colors.text} 
            fill={liked ? colors.accent : 'transparent'} 
          />
          <Text style={[styles.likeText, { color: colors.text }, liked && { color: colors.accent }]}>
            {liked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentsContainer}>
        <Text style={[styles.commentsTitle, { color: colors.text }]}>Live Chat</Text>
        
        <ScrollView style={styles.commentsList}>
          {mockComments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentName, { color: colors.text }]}>{comment.name}</Text>
                <Text style={[styles.commentTime, { color: colors.subtext }]}>{comment.time}</Text>
              </View>
              <Text style={[styles.commentText, { color: colors.text }]}>{comment.text}</Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.commentInputContainer}>
          <View style={[styles.commentInput, { backgroundColor: colors.card }]}>
            <MessageCircle size={20} color={colors.subtext} />
            <Text style={[styles.commentInputPlaceholder, { color: colors.subtext }]}>Type a message...</Text>
          </View>
        </View>
      </View>
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
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 6,
  },
  liveText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 4,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  streamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  likeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  commentsContainer: {
    flex: 1,
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    marginTop: 12,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentInputPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
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