import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Play, Youtube } from 'lucide-react-native';
import { Sermon } from '@/types';
import Colors from '@/constants/colors';
import { getYouTubeThumbnail, isYouTubeUrl } from '@/lib/youtube';

interface SermonCardProps {
  sermon: Sermon;
  onPress: (sermon: Sermon) => void;
}

export default function SermonCard({ sermon, onPress }: SermonCardProps) {
  const isYouTube = sermon.videoUrl && isYouTubeUrl(sermon.videoUrl);
  const thumbnailUrl = isYouTube && sermon.videoUrl 
    ? getYouTubeThumbnail(sermon.videoUrl) 
    : sermon.imageUrl;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(sermon)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: thumbnailUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=200' }} 
          style={styles.image} 
        />
        {isYouTube && (
          <View style={styles.youtubeOverlay}>
            <Youtube size={24} color="#FFF" fill="#FFF" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{sermon.title}</Text>
        <Text style={styles.speaker}>{sermon.speaker}</Text>
        <Text style={styles.date}>{sermon.date}</Text>
        
        <View style={styles.playContainer}>
          <View style={styles.playButton}>
            <Play size={16} color={Colors.dark.text} fill={Colors.dark.text} />
          </View>
          <Text style={styles.duration}>{sermon.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageContainer: {
    width: 100,
    height: 100,
    position: 'relative' as const,
  },
  image: {
    width: 100,
    height: 100,
  },
  youtubeOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  speaker: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  playContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  duration: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
});