import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Play, Pause, SkipForward, SkipBack, X } from 'lucide-react-native';
import { useMusicPlayer } from '@/store/musicPlayerStore';
import { useTheme } from '@/store/themeStore';

export default function MusicPlayer() {
  const { colors } = useTheme();
  const { currentTrack, isPlaying, position, duration, play, pause, next, previous, stop } = useMusicPlayer();
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (currentTrack) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }).start();
    } else {
      Animated.spring(slideAnim, { toValue: 100, useNativeDriver: true, tension: 50, friction: 7 }).start();
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progress, { width: `${progress}%`, backgroundColor: colors.accent }]} />
      </View>
      
      <View style={styles.content}>
        <Image source={{ uri: currentTrack.imageUrl || 'https://via.placeholder.com/50' }} style={styles.albumArt} />
        
        <View style={styles.trackInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={[styles.artist, { color: colors.subtext }]} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={previous} style={styles.controlButton}>
            <SkipBack size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={isPlaying ? pause : play} style={[styles.playButton, { backgroundColor: colors.accent }]}>
            {isPlaying ? <Pause size={24} color="#FFF" /> : <Play size={24} color="#FFF" />}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={next} style={styles.controlButton}>
            <SkipForward size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={stop} style={styles.closeButton}>
          <X size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  progressBar: { height: 3 },
  progress: { height: 3 },
  content: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  albumArt: { width: 50, height: 50, borderRadius: 8 },
  trackInfo: { flex: 1, marginLeft: 12, marginRight: 12 },
  title: { fontSize: 14, fontWeight: '600' },
  artist: { fontSize: 12, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlButton: { padding: 8 },
  playButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  closeButton: { padding: 8, marginLeft: 8 },
});
