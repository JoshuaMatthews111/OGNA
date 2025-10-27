import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, MapPin, Clock, Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { trpc } from '@/lib/trpc';
import { useAdminStore } from '@/store/adminStore';

export default function EventsManagement() {
  const { colors } = useTheme();
  const { adminUser } = useAdminStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data: events = [], refetch } = trpc.admin.events.list.useQuery();
  
  const createEventMutation = trpc.admin.events.create.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
      Alert.alert('Success', 'Event created successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const updateEventMutation = trpc.admin.events.update.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
      Alert.alert('Success', 'Event updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const deleteEventMutation = trpc.admin.events.delete.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Event deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setImageUrl('');
    setModalVisible(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setImageUrl(event.imageUrl || '');
    setModalVisible(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteEventMutation.mutate({ id: eventId })
        }
      ]
    );
  };

  const handleSaveEvent = () => {
    if (!title || !description || !date || !time || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingEvent) {
      updateEventMutation.mutate({
        id: editingEvent.id,
        title,
        description,
        date,
        time,
        location,
        imageUrl: imageUrl || undefined,
      });
    } else {
      createEventMutation.mutate({
        title,
        description,
        date,
        time,
        location,
        imageUrl: imageUrl || undefined,
        createdBy: adminUser?.username || 'admin',
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setImageUrl('');
  };

  const isMasterAdmin = adminUser?.username === 'mr.matthews2022@gmail.com';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Events</Text>
        <TouchableOpacity onPress={handleCreateEvent}>
          <Plus size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No events yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
              Create your first event to get started
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {event.imageUrl && (
                <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
              )}
              
              <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                <Text style={[styles.eventDescription, { color: colors.subtext }]}>{event.description}</Text>
                
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailRow}>
                    <Calendar size={16} color={colors.accent} />
                    <Text style={[styles.eventDetailText, { color: colors.subtext }]}>{event.date}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Clock size={16} color={colors.accent} />
                    <Text style={[styles.eventDetailText, { color: colors.subtext }]}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MapPin size={16} color={colors.accent} />
                    <Text style={[styles.eventDetailText, { color: colors.subtext }]}>{event.location}</Text>
                  </View>
                </View>

                <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.accentLight }]}
                    onPress={() => handleEditEvent(event)}
                  >
                    <Edit size={16} color={colors.accent} />
                    <Text style={[styles.actionButtonText, { color: colors.accent }]}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 size={16} color="#DC2626" />
                    <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Event title"
                placeholderTextColor={colors.subtext}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Event description"
                placeholderTextColor={colors.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="2025-12-31"
                placeholderTextColor={colors.subtext}
                value={date}
                onChangeText={setDate}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Time *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="06:00pm"
                placeholderTextColor={colors.subtext}
                value={time}
                onChangeText={setTime}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Location *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Main Complex"
                placeholderTextColor={colors.subtext}
                value={location}
                onChangeText={setLocation}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Image URL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor={colors.subtext}
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />

              {imageUrl && (
                <View style={styles.previewContainer}>
                  <Text style={[styles.previewLabel, { color: colors.text }]}>Preview:</Text>
                  <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={closeModal}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.accent }]}
                  onPress={handleSaveEvent}
                  disabled={createEventMutation.isPending || updateEventMutation.isPending}
                >
                  <Text style={styles.saveButtonText}>
                    {createEventMutation.isPending || updateEventMutation.isPending ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  eventCard: {
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  previewContainer: {
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  saveButton: {},
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
