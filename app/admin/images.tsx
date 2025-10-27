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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, Edit, Save, ZoomIn, ZoomOut, Move } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

const sections = [
  { key: 'hero', title: 'Hero Section', description: 'Main banner image' },
  { key: 'events', title: 'Events Section', description: 'Events background image' },
  { key: 'sermons', title: 'Sermons Section', description: 'Sermons background image' },
  { key: 'community', title: 'Community Section', description: 'Community background image' },
];

const { width: screenWidth } = Dimensions.get('window');

export default function ImageManagement() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [showScaleControls, setShowScaleControls] = useState(false);

  const { data: content, refetch } = trpc.admin.content.get.useQuery();

  const updateImageMutation = trpc.admin.content.updateImage.useMutation({
    onSuccess: () => {
      refetch();
      setModalVisible(false);
      setEditingSection(null);
      setNewImageUrl('');
      Alert.alert('Success', 'Image updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleEditImage = (sectionKey: string, currentUrl: string) => {
    setEditingSection(sectionKey);
    setNewImageUrl(currentUrl);
    setScale(1);
    setShowScaleControls(false);
    setModalVisible(true);
  };

  const handleUpdateImage = () => {
    if (!editingSection || !newImageUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    if (!newImageUrl.startsWith('http')) {
      Alert.alert('Error', 'Please enter a valid URL starting with http or https');
      return;
    }

    updateImageMutation.mutate({
      section: editingSection as any,
      imageUrl: newImageUrl
    });
  };

  const getSectionTitle = (key: string) => {
    return sections.find(s => s.key === key)?.title || key;
  };

  const getSectionDescription = (key: string) => {
    return sections.find(s => s.key === key)?.description || '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Images</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Update images for different sections of the app. Use high-quality images from Unsplash or other sources.
        </Text>
        
        {content?.images && Object.entries(content.images).map(([key, url]) => (
          <View key={key} style={styles.imageCard}>
            <View style={styles.imageHeader}>
              <View style={styles.imageInfo}>
                <Text style={styles.imageTitle}>{getSectionTitle(key)}</Text>
                <Text style={styles.imageDescription}>{getSectionDescription(key)}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditImage(key, url)}
              >
                <Edit size={18} color={colors.dark.accent} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: url }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
            
            <Text style={styles.imageUrl} numberOfLines={2}>
              {url}
            </Text>
          </View>
        ))}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Image Tips:</Text>
          <Text style={styles.tipText}>• Use high-resolution images (at least 800px wide)</Text>
          <Text style={styles.tipText}>• Recommended aspect ratio: 16:9 for hero, 4:3 for sections</Text>
          <Text style={styles.tipText}>• Use Unsplash.com for free high-quality images</Text>
          <Text style={styles.tipText}>• Ensure images are relevant to church/spiritual themes</Text>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Update {editingSection ? getSectionTitle(editingSection) : ''} Image
            </Text>
            
            <Text style={styles.inputLabel}>Image URL:</Text>
            <TextInput
              style={styles.input}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor={colors.dark.subtext}
              value={newImageUrl}
              onChangeText={setNewImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
            />

            {newImageUrl && (
              <View style={styles.previewContainer}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <TouchableOpacity
                    style={styles.scaleToggle}
                    onPress={() => setShowScaleControls(!showScaleControls)}
                  >
                    <Move size={16} color={colors.dark.accent} />
                    <Text style={[styles.scaleToggleText, { color: colors.dark.accent }]}>Scale Image</Text>
                  </TouchableOpacity>
                </View>
                
                {showScaleControls && (
                  <View style={styles.scaleControls}>
                    <TouchableOpacity
                      style={styles.scaleButton}
                      onPress={() => setScale(Math.max(0.5, scale - 0.1))}
                    >
                      <ZoomOut size={20} color={colors.dark.text} />
                    </TouchableOpacity>
                    <Text style={[styles.scaleValue, { color: colors.dark.text }]}>
                      {Math.round(scale * 100)}%
                    </Text>
                    <TouchableOpacity
                      style={styles.scaleButton}
                      onPress={() => setScale(Math.min(2, scale + 0.1))}
                    >
                      <ZoomIn size={20} color={colors.dark.text} />
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={styles.imagePreviewWrapper}>
                  <Image
                    source={{ uri: newImageUrl }}
                    style={[
                      styles.modalPreviewImage,
                      {
                        transform: [{ scale }],
                      }
                    ]}
                    resizeMode="cover"
                    onError={() => Alert.alert('Error', 'Invalid image URL')}
                  />
                </View>
              </View>
            )}

            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>Example URLs:</Text>
              <TouchableOpacity
                onPress={() => setNewImageUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800')}
              >
                <Text style={styles.exampleUrl}>
                  https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewImageUrl('https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800')}
              >
                <Text style={styles.exampleUrl}>
                  https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateImage}
                disabled={updateImageMutation.isPending}
              >
                <Save size={16} color={colors.dark.background} />
                <Text style={styles.saveButtonText}>
                  {updateImageMutation.isPending ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 14,
    color: colors.dark.subtext,
    marginVertical: 16,
    lineHeight: 20,
  },
  imageCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  imageInfo: {
    flex: 1,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 4,
  },
  imageDescription: {
    fontSize: 14,
    color: colors.dark.subtext,
  },
  editButton: {
    padding: 8,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.dark.border,
  },
  imageUrl: {
    fontSize: 12,
    color: colors.dark.subtext,
    fontFamily: 'monospace',
  },
  tipsCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.accent,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.dark.subtext,
    marginBottom: 4,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.dark.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scaleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scaleToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scaleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: colors.dark.background,
    borderRadius: 8,
  },
  scaleButton: {
    padding: 8,
  },
  scaleValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center' as const,
  },
  imagePreviewWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.dark.border,
  },
  modalPreviewImage: {
    width: '100%',
    height: 120,
  },
  exampleContainer: {
    marginBottom: 20,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 8,
  },
  exampleUrl: {
    fontSize: 12,
    color: colors.dark.accent,
    marginBottom: 4,
    textDecorationLine: 'underline',
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
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.accent,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: colors.dark.background,
    fontWeight: '600',
  },
});