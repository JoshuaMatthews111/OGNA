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
import { ArrowLeft, Send, MessageSquare, Trash2, Users } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAdminStore } from '@/store/adminStore';

export default function MessageManagement() {
  const [modalVisible, setModalVisible] = useState(false);
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { staffName } = useAdminStore();

  const { data: users = [] } = trpc.admin.users.getAll.useQuery();
  const { data: messages = [], refetch: refetchMessages } = trpc.admin.messages.getAll.useQuery();

  const sendMessageMutation = trpc.admin.messages.send.useMutation({
    onSuccess: () => {
      refetchMessages();
      setModalVisible(false);
      setMessageForm({ title: '', content: '', priority: 'medium' });
      setSelectedUsers([]);
      Alert.alert('Success', 'Message sent successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const deleteMessageMutation = trpc.admin.messages.delete.useMutation({
    onSuccess: () => {
      refetchMessages();
      Alert.alert('Success', 'Message deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleSendMessage = () => {
    if (!messageForm.title.trim() || !messageForm.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one recipient');
      return;
    }

    sendMessageMutation.mutate({
      ...messageForm,
      recipients: selectedUsers,
      staffName
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMessageMutation.mutate({ id: messageId })
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#DC2626';
      case 'medium': return '#D97706';
      case 'low': return '#059669';
      default: return colors.dark.subtext;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => setModalVisible(true)}
        >
          <Send size={20} color={colors.dark.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.statsText}>{messages.length} Messages Sent</Text>
        
        {messages.map((message) => (
          <View key={message.id} style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={styles.messageInfo}>
                <Text style={styles.messageTitle}>{message.title}</Text>
                <View style={styles.messageMeta}>
                  <View style={[
                    styles.priorityBadge, 
                    { backgroundColor: getPriorityColor(message.priority) + '20' }
                  ]}>
                    <Text style={[
                      styles.priorityText, 
                      { color: getPriorityColor(message.priority) }
                    ]}>
                      {message.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.messageDate}>
                    {new Date(message.sentAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMessage(message.id)}
              >
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.messageContent} numberOfLines={3}>
              {message.content}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={styles.staffName}>From: {message.staffName}</Text>
              <Text style={styles.recipientCount}>
                {message.recipients.length} recipients
              </Text>
            </View>
          </View>
        ))}

        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={colors.dark.subtext} />
            <Text style={styles.emptyText}>No messages sent yet</Text>
            <Text style={styles.emptySubtext}>Tap the send button to compose your first message</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Message</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Message Title"
              placeholderTextColor={colors.dark.subtext}
              value={messageForm.title}
              onChangeText={(text) => setMessageForm({ ...messageForm, title: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Message Content"
              placeholderTextColor={colors.dark.subtext}
              value={messageForm.content}
              onChangeText={(text) => setMessageForm({ ...messageForm, content: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.prioritySelector}>
              <Text style={styles.selectorLabel}>Priority:</Text>
              <View style={styles.priorityOptions}>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      messageForm.priority === priority && styles.priorityOptionSelected,
                      { borderColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setMessageForm({ ...messageForm, priority })}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      messageForm.priority === priority && { color: getPriorityColor(priority) }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.recipientSection}>
              <View style={styles.recipientHeader}>
                <Text style={styles.selectorLabel}>Recipients ({selectedUsers.length}):</Text>
                <View style={styles.recipientActions}>
                  <TouchableOpacity onPress={selectAllUsers}>
                    <Text style={styles.actionText}>Select All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={clearSelection}>
                    <Text style={styles.actionText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView style={styles.userList} nestedScrollEnabled>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userOption,
                      selectedUsers.includes(user.id) && styles.userOptionSelected
                    ]}
                    onPress={() => toggleUserSelection(user.id)}
                  >
                    <View style={styles.userInfo}>
                      <Text style={styles.userOptionName}>{user.name}</Text>
                      <Text style={styles.userOptionEmail}>{user.email}</Text>
                    </View>
                    {selectedUsers.includes(user.id) && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={sendMessageMutation.isPending}
              >
                <Text style={styles.sendButtonText}>
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
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
  composeButton: {
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
  messageCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 4,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  messageDate: {
    fontSize: 12,
    color: colors.dark.subtext,
  },
  deleteButton: {
    padding: 4,
  },
  messageContent: {
    fontSize: 14,
    color: colors.dark.subtext,
    marginBottom: 8,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffName: {
    fontSize: 12,
    color: colors.dark.accent,
    fontWeight: '500',
  },
  recipientCount: {
    fontSize: 12,
    color: colors.dark.subtext,
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
  },
  prioritySelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  priorityOptionText: {
    color: colors.dark.text,
    fontSize: 12,
    fontWeight: '500',
  },
  recipientSection: {
    marginBottom: 20,
  },
  recipientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipientActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionText: {
    color: colors.dark.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  userList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: 8,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  userOptionSelected: {
    backgroundColor: colors.dark.accentLight,
  },
  userInfo: {
    flex: 1,
  },
  userOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark.text,
  },
  userOptionEmail: {
    fontSize: 12,
    color: colors.dark.subtext,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.dark.background,
    fontSize: 12,
    fontWeight: 'bold',
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
  sendButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.accent,
    alignItems: 'center',
  },
  sendButtonText: {
    color: colors.dark.background,
    fontWeight: '600',
  },
});