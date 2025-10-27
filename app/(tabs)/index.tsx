import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import CircleIcon from '@/components/CircleIcon';
import LiveStreamCard from '@/components/LiveStreamCard';
import EventCard from '@/components/EventCard';
import Header from '@/components/Header';
import { upcomingEvents, liveStreams } from '@/mocks/events';

export default function HomeScreen() {
  const [activeIcon, setActiveIcon] = useState<string>('updates');
  const [contentFilter, setContentFilter] = useState<'events' | 'updates' | 'dailyDose'>('updates');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Header greeting />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Church Stories</Text>
          <View style={styles.iconsContainer}>
            <CircleIcon 
              title="Events" 
              icon="calendar" 
              colors={Colors.gradients.events}
              imageUrl="https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop"
              isActive={activeIcon === 'events'}
              onPress={() => {
                setActiveIcon('events');
                setContentFilter('events');
              }}
            />
            <CircleIcon 
              title="Updates" 
              icon="bell" 
              colors={Colors.gradients.updates}
              imageUrl="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&h=400&fit=crop"
              isActive={activeIcon === 'updates'}
              onPress={() => {
                setActiveIcon('updates');
                setContentFilter('updates');
              }}
            />
            <CircleIcon 
              title="Daily Dose" 
              icon="tv" 
              colors={Colors.gradients.dailyDose}
              imageUrl="https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop"
              isActive={activeIcon === 'dailyDose'}
              onPress={() => {
                setActiveIcon('dailyDose');
                setContentFilter('dailyDose');
                router.push('/sermons');
              }}
            />
          </View>
        </View>

        {contentFilter !== 'dailyDose' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Streaming</Text>
            {liveStreams.map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {contentFilter === 'events' ? 'All Church Events' : 'Upcoming Events'}
          </Text>
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>

        {contentFilter === 'updates' && (
          <View style={styles.section}>
            <View style={styles.updateCard}>
              <Text style={styles.updateTitle}>Latest Announcement</Text>
              <Text style={styles.updateText}>
                Join us this Sunday for a special worship service at Overcomers Global Network. 
                Prophet Joshua Matthews will be ministering on breakthrough and restoration.
              </Text>
              <Text style={styles.updateDate}>Posted 2 hours ago</Text>
            </View>
            <View style={styles.updateCard}>
              <Text style={styles.updateTitle}>Prayer Meeting</Text>
              <Text style={styles.updateText}>
                Weekly prayer meetings every Wednesday at 7 PM. Come and experience the power of corporate prayer.
              </Text>
              <Text style={styles.updateDate}>Posted yesterday</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
  },
  scrollContent: {
    paddingTop: 10,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? Colors.dark.text : Colors.light.text,
    marginBottom: 16,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  updateCard: {
    backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: isDark ? Colors.dark.text : Colors.light.text,
    marginBottom: 8,
  },
  updateText: {
    fontSize: 14,
    color: isDark ? Colors.dark.subtext : Colors.light.subtext,
    lineHeight: 20,
    marginBottom: 8,
  },
  updateDate: {
    fontSize: 12,
    color: isDark ? Colors.dark.subtext : Colors.light.subtext,
    fontStyle: 'italic' as const,
  },
});