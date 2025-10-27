import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Edit, Trash2, Music as MusicIcon, Play } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { trpc } from '@/lib/trpc';
import { useAdminStore } from '@/store/adminStore';
import { useMusicPlayer } from '@/store/musicPlayerStore';

export default function MusicManagement() {
  const { colors } = useTheme();
  const { adminUser } = useAdminStore();
  const { setCurrentTrack, setPlaylist } = useMusicPlayer();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMusic, setEditingMusic] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState<'worship' | 'sermon' | 'background'>('worship');

  const { data: musicList = [], refetch } = trpc.admin.music.list.useQuery();
  
  const createMusicMutation = trpc.admin.music.create.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
      Alert.alert('Success', 'Music added successfully');
    },
    onError: (error) => Alert.alert('Error', error.message)
  });

  const updateMusicMutation = trpc.admin.music.update.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
      Alert.alert('Success', 'Music updated successfully');
    },
    onError: (error) => Alert.alert('Error', error.message)
  });

  const deleteMusicMutation = trpc.admin.music.delete.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Music deleted successfully');
    },
    onError: (error) => Alert.alert('Error', error.message)
  });

  const handleCreateMusic = () => {
    setEditingMusic(null);
    setTitle('');
    setArtist('');
    setAudioUrl('');
    setImageUrl('');
    setDuration('');
    setCategory('worship');
    setModalVisible(true);
  };

  const handleEditMusic = (music: any) => {
    setEditingMusic(music);
    setTitle(music.title);
    setArtist(music.artist);
    setAudioUrl(music.audioUrl);
    setImageUrl(music.imageUrl || '');
    setDuration(music.duration || '');
    setCategory(music.category);
    setModalVisible(true);
  };

  const handleDeleteMusic = (musicId: string) => {
    Alert.alert('Delete Music', 'Are you sure you want to delete this music?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMusicMutation.mutate({ id: musicId }) }
    ]);
  };

  const handleSaveMusic = () => {
    if (!title || !artist || !audioUrl) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingMusic) {
      updateMusicMutation.mutate({ id: editingMusic.id, title, artist, audioUrl, imageUrl: imageUrl || undefined, duration: duration || undefined, category });
    } else {
      createMusicMutation.mutate({ title, artist, audioUrl, imageUrl: imageUrl || undefined, duration: duration || undefined, category, createdBy: adminUser?.username || 'admin' });
    }
  };

  const handlePlayMusic = (music: any) => {
    setPlaylist(musicList);
    setCurrentTrack({ id: music.id, title: music.title, artist: music.artist, audioUrl: music.audioUrl, imageUrl: music.imageUrl, duration: music.duration });
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMusic(null);
    setTitle('');
    setArtist('');
    setAudioUrl('');
    setImageUrl('');
    setDuration('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Music Library</Text>
        <TouchableOpacity onPress={handleCreateMusic}><Plus size={24} color={colors.accent} /></TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {musicList.length === 0 ? (
          <View style={styles.emptyState}>
            <MusicIcon size={48} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No music yet</Text>
          </View>
        ) : (
          musicList.map((music) => (
            <View key={music.id} style={[styles.musicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={{ uri: music.imageUrl }} style={styles.musicImage} />
              <View style={styles.musicContent}>
                <Text style={[styles.musicTitle, { color: colors.text }]}>{music.title}</Text>
                <Text style={[styles.musicArtist, { color: colors.subtext }]}>{music.artist}</Text>
                <Text style={[styles.musicDuration, { color: colors.subtext }]}>{music.duration}</Text>
              </View>
              <View style={styles.musicActions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={() => handlePlayMusic(music)}>
                  <Play size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accentLight }]} onPress={() => handleEditMusic(music)}>
                  <Edit size={16} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]} onPress={() => handleDeleteMusic(music.id)}>
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingMusic ? 'Edit Music' : 'Add Music'}</Text>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Song title" placeholderTextColor={colors.subtext} value={title} onChangeText={setTitle} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Artist *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Artist name" placeholderTextColor={colors.subtext} value={artist} onChangeText={setArtist} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Audio URL *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="https://example.com/song.mp3" placeholderTextColor={colors.subtext} value={audioUrl} onChangeText={setAudioUrl} autoCapitalize="none" />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Image URL</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="https://..." placeholderTextColor={colors.subtext} value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Duration</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="3:45" placeholderTextColor={colors.subtext} value={duration} onChangeText={setDuration} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]} onPress={closeModal}><Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.accent }]} onPress={handleSaveMusic} disabled={createMusicMutation.isPending || updateMusicMutation.isPending}><Text style={styles.saveButtonText}>{createMusicMutation.isPending || updateMusicMutation.isPending ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1 }, headerTitle: { fontSize: 18, fontWeight: '600' }, content: { flex: 1, paddingHorizontal: 24 }, emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }, emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 }, musicCard: { flexDirection: 'row', borderRadius: 12, marginVertical: 8, borderWidth: 1, padding: 12, alignItems: 'center' }, musicImage: { width: 60, height: 60, borderRadius: 8 }, musicContent: { flex: 1, marginLeft: 12 }, musicTitle: { fontSize: 16, fontWeight: '600' }, musicArtist: { fontSize: 14, marginTop: 2 }, musicDuration: { fontSize: 12, marginTop: 4 }, musicActions: { flexDirection: 'row', gap: 4 }, actionButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }, modalContent: { borderRadius: 16, padding: 24, width: '95%', maxHeight: '90%' }, modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' as const }, inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 }, input: { borderRadius: 8, padding: 12, fontSize: 14, borderWidth: 1 }, modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 }, modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' }, cancelButton: { borderWidth: 1 }, cancelButtonText: { fontWeight: '500' }, saveButton: {}, saveButtonText: { color: '#FFFFFF', fontWeight: '600' } });
