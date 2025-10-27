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
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Music, Trash2, Calendar, Clock, User } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function SermonManagement() {
  const [modalVisible, setModalVisible] = useState(false);
  const [sermonForm, setSermonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    audioUrl: '',
    speaker: 'Prophet Joshua',
    duration: ''
  });

  const { data: content, refetch } = trpc.admin.content.get.useQuery();
  const sermons = content?.sermons || [];

  const addSermonMutation = trpc.admin.content.addSermon.useMutation({
    onSuccess: () => {
      refetch();
      setModalVisible(false);
      setSermonForm({
        title: '',
        description: '',
        videoUrl: '',
        audioUrl: '',
        speaker: 'Prophet Joshua',
        duration: ''
      });
      Alert.alert('Success', 'Sermon added successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const deleteSermonMutation = trpc.admin.content.deleteSermon.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Sermon deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleAddSermon = () => {
    if (!sermonForm.title.trim() || !sermonForm.description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    if (!sermonForm.videoUrl.trim() && !sermonForm.audioUrl.trim()) {
      Alert.alert('Error', 'Please provide at least a video or audio URL');
      return;
    }

    if (!sermonForm.duration.trim()) {
      Alert.alert('Error', 'Please provide the sermon duration');
      return;
    }

    const payload: any = {
      title: sermonForm.title,
      description: sermonForm.description,
      speaker: sermonForm.speaker,
      duration: sermonForm.duration
    };

    if (sermonForm.videoUrl.trim()) {
      payload.videoUrl = sermonForm.videoUrl;
    }

    if (sermonForm.audioUrl.trim()) {
      payload.audioUrl = sermonForm.audioUrl;
    }

    addSermonMutation.mutate(payload);
  };

  const handleDeleteSermon = (sermonId: string, title: string) => {
    Alert.alert(
      'Delete Sermon',
      `Are you sure you want to delete \"${title}\"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSermonMutation.mutate({ id: sermonId })
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sermons</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color={colors.dark.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.statsText}>{sermons.length} Sermons Available</Text>
        
        {sermons.map((sermon) => (
          <View key={sermon.id} style={styles.sermonCard}>
            <View style={styles.sermonHeader}>
              <View style={styles.sermonInfo}>
                <Text style={styles.sermonTitle}>{sermon.title}</Text>
                <Text style={styles.sermonDescription} numberOfLines={2}>
                  {sermon.description}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSermon(sermon.id, sermon.title)}
              >
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sermonMeta}>
              <View style={styles.metaItem}>
                <User size={14} color={colors.dark.subtext} />
                <Text style={styles.metaText}>{sermon.speaker}</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.dark.subtext} />
                <Text style={styles.metaText}>{sermon.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={14} color={colors.dark.subtext} />
                <Text style={styles.metaText}>{sermon.duration}</Text>
              </View>
            </View>

            <View style={styles.mediaLinks}>
              {sermon.videoUrl && (
                <View style={styles.mediaItem}>
                  <Text style={styles.mediaLabel}>Video:</Text>
                  <Text style={styles.mediaUrl} numberOfLines={1}>
                    {sermon.videoUrl}
                  </Text>
                </View>
              )}
              {sermon.audioUrl && (
                <View style={styles.mediaItem}>
                  <Text style={styles.mediaLabel}>Audio:</Text>
                  <Text style={styles.mediaUrl} numberOfLines={1}>
                    {sermon.audioUrl}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {sermons.length === 0 && (
          <View style={styles.emptyState}>
            <Music size={48} color={colors.dark.subtext} />
            <Text style={styles.emptyText}>No sermons added yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first sermon</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Sermon</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Sermon Title"
                placeholderTextColor={colors.dark.subtext}
                value={sermonForm.title}
                onChangeText={(text) => setSermonForm({ ...sermonForm, title: text })}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Sermon Description"
                placeholderTextColor={colors.dark.subtext}
                value={sermonForm.description}
                onChangeText={(text) => setSermonForm({ ...sermonForm, description: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TextInput
                style={styles.input}
                placeholder="Speaker Name"
                placeholderTextColor={colors.dark.subtext}
                value={sermonForm.speaker}
                onChangeText={(text) => setSermonForm({ ...sermonForm, speaker: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Duration (e.g., 45:30)"
                placeholderTextColor={colors.dark.subtext}
                value={sermonForm.duration}
                onChangeText={(text) => setSermonForm({ ...sermonForm, duration: text })}
              />

              <Text style={styles.labelText}>YouTube Video URL (recommended)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor={colors.dark.subtext}
                value={sermonForm.videoUrl}
                onChangeText={(text) => setSermonForm({ ...sermonForm, videoUrl: text })}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <TextInput
                style={styles.input}
                placeholder="Audio URL (optional)"
                placeholderTextColor={colors.dark.subtext}
                value={sermonForm.audioUrl}
                onChangeText={(text) => setSermonForm({ ...sermonForm, audioUrl: text })}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>📹 YouTube Video Hosting (Recommended):</Text>
                <Text style={styles.tipText}>1. Upload your sermon to YouTube</Text>
                <Text style={styles.tipText}>2. Set visibility to Public, Unlisted, or Private</Text>
                <Text style={styles.tipText}>3. Copy the video URL and paste above</Text>
                <Text style={styles.tipText}>4. Works with any YouTube URL format</Text>
                <Text style={styles.tipText}>• Free unlimited storage and streaming</Text>
                <Text style={styles.tipText}>• Automatic quality adjustment</Text>
                <Text style={styles.tipText}>• Mobile-friendly playback</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addSermonButton}
                  onPress={handleAddSermon}
                  disabled={addSermonMutation.isPending}
                >
                  <Text style={styles.addSermonButtonText}>
                    {addSermonMutation.isPending ? 'Adding...' : 'Add Sermon'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
  },
  addButton: {
    backgroundColor: colors.dark.accent,
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsText: {
    fontSize: 16,
    color: colors.dark.subtext,
    marginVertical: 16,
  },
  sermonCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  sermonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sermonInfo: {
    flex: 1,
  },
  sermonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 4,
  },
  sermonDescription: {
    fontSize: 14,
    color: colors.dark.subtext,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  sermonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.dark.subtext,
  },
  mediaLinks: {
    gap: 8,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark.accent,
    minWidth: 40,
  },
  mediaUrl: {
    fontSize: 12,
    color: colors.dark.subtext,
    flex: 1,
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.dark.subtext,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.dark.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tipsContainer: {
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.accent,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: colors.dark.subtext,
    marginBottom: 4,
    lineHeight: 16,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.dark.text,
    fontWeight: '500',
  },
  addSermonButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.accent,
    alignItems: 'center',
  },
  addSermonButtonText: {
    color: colors.dark.background,
    fontWeight: '600',
  },
});