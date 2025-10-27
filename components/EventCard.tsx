import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Clock } from 'lucide-react-native';
import { Event } from '@/types';
import Colors from '@/constants/colors';
import { useEventStore } from '@/store/eventStore';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const { toggleReminder, hasReminder } = useEventStore();
  const hasReminderSet = hasReminder(event.id);

  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  const handleToggleReminder = () => {
    toggleReminder(event.id);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>
        
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderText}>Set Reminder</Text>
          <Switch
            value={hasReminderSet}
            onValueChange={handleToggleReminder}
            trackColor={{ false: '#333', true: Colors.dark.accentLight }}
            thumbColor={hasReminderSet ? Colors.dark.accent : '#f4f3f4'}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MapPin size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.dark.subtext} />
              <Text style={styles.detailText}>{event.date}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={Colors.dark.subtext} />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
          </View>
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
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 16,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reminderText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginLeft: 6,
  },
});