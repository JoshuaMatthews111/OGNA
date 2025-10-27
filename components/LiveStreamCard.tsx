import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LiveStream } from '@/types';
import Colors from '@/constants/colors';

interface LiveStreamCardProps {
  stream: LiveStream;
}

export default function LiveStreamCard({ stream }: LiveStreamCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/live');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <ImageBackground
        source={{ uri: stream.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <View style={styles.overlay}>
          {stream.isLive && (
            <View style={styles.liveContainer}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <Text style={styles.title}>{stream.title}</Text>
          {!stream.isLive && stream.startTime && (
            <Text style={styles.startTime}>Starting: {stream.startTime}</Text>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 12,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 6,
  },
  liveText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  startTime: {
    color: Colors.dark.text,
    fontSize: 14,
    marginTop: 4,
  },
});