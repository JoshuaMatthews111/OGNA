import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { parseYouTubeUrl } from '@/lib/youtube';

interface YouTubePlayerProps {
  url: string;
  style?: any;
}

export default function YouTubePlayer({ url, style }: YouTubePlayerProps) {
  const videoInfo = parseYouTubeUrl(url);

  if (!videoInfo) {
    return null;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          src={videoInfo.embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <iframe
        src={videoInfo.embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
});
