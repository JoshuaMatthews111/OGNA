import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, Clock, ChevronLeft, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { upcomingEvents } from '@/mocks/events';
import { useEventStore } from '@/store/eventStore';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleReminder, hasReminder } = useEventStore();
  
  const event = upcomingEvents.find(e => e.id === id);
  
  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Event not found</Text>
      </SafeAreaView>
    );
  }

  const hasReminderSet = hasReminder(event.id);

  const handleToggleReminder = () => {
    toggleReminder(event.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color={Colors.dark.text} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{event.date}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <Clock size={20} color={Colors.dark.text} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <MapPin size={20} color={Colors.dark.text} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.reminderButton, 
              hasReminderSet ? styles.reminderButtonActive : {}
            ]}
            onPress={handleToggleReminder}
          >
            <Text style={[
              styles.reminderButtonText,
              hasReminderSet ? styles.reminderButtonTextActive : {}
            ]}>
              {hasReminderSet ? 'Reminder Set' : 'Set Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  shareButton: {
    padding: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.dark.subtext,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  reminderButton: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderButtonActive: {
    backgroundColor: Colors.dark.accentLight,
  },
  reminderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.accent,
  },
  reminderButtonTextActive: {
    color: Colors.dark.accent,
  },
  errorText: {
    fontSize: 18,
    color: Colors.dark.text,
    textAlign: 'center',
    marginTop: 20,
  },
});