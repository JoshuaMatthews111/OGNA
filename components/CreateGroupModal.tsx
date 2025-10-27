import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { trpc } from '@/lib/trpc';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'bible-study' as const, label: 'Bible Study' },
  { value: 'fellowship' as const, label: 'Fellowship' },
  { value: 'ministry' as const, label: 'Ministry' },
  { value: 'support' as const, label: 'Support' },
  { value: 'youth' as const, label: 'Youth' },
  { value: 'other' as const, label: 'Other' },
];

export default function CreateGroupModal({ visible, onClose, onSuccess }: CreateGroupModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bible-study' | 'fellowship' | 'ministry' | 'support' | 'youth' | 'other'>('fellowship');
  const [isPrivate, setIsPrivate] = useState(false);
  const [meetingLocation, setMeetingLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const createGroup = trpc.community.groups.create.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Group created successfully!');
      onSuccess();
      resetForm();
      onClose();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('fellowship');
    setIsPrivate(false);
    setMeetingLocation('');
    setImageUrl('');
  };

  const handleCreate = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    createGroup.mutate({
      name: name.trim(),
      description: description.trim(),
      category,
      isPrivate,
      meetingLocation: meetingLocation.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Create Group</Text>
          <TouchableOpacity onPress={handleCreate} disabled={createGroup.isPending}>
            {createGroup.isPending ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={[styles.createButton, { color: colors.accent }]}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Group Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter group name"
              placeholderTextColor={colors.subtext}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Describe your group's purpose and activities"
              placeholderTextColor={colors.subtext}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.card },
                    category === cat.value && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: category === cat.value ? colors.background : colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Meeting Location (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Where does your group meet?"
              placeholderTextColor={colors.subtext}
              value={meetingLocation}
              onChangeText={setMeetingLocation}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Image URL (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={colors.subtext}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => setIsPrivate(!isPrivate)}
          >
            <Text style={[styles.label, { color: colors.text }]}>Private Group</Text>
            <View style={[styles.switch, { backgroundColor: isPrivate ? colors.accent : colors.border }]}>
              <View style={[styles.switchThumb, { backgroundColor: colors.background }]} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  field: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
});
