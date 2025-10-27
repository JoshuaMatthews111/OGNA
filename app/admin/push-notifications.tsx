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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Bell,
  Users,
  Send,
  Clock,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { useAdminStore } from '@/store/adminStore';

type NotificationTarget = 'all' | 'members' | 'guests' | 'specific';
type NotificationPriority = 'normal' | 'high';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  target: NotificationTarget;
  sentAt: string;
  recipientCount: number;
  status: 'sent' | 'pending' | 'failed';
}

export default function PushNotifications() {
  const { colors } = useTheme();
  const { adminUser, hasPermission } = useAdminStore();
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [target, setTarget] = useState<NotificationTarget>('all');
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [notificationLog, setNotificationLog] = useState<NotificationLog[]>([
    {
      id: '1',
      title: 'Welcome Message',
      message: 'Welcome to Overcomers Church App!',
      target: 'all',
      sentAt: new Date(Date.now() - 3600000).toISOString(),
      recipientCount: 1234,
      status: 'sent',
    },
    {
      id: '2',
      title: 'Sunday Service Reminder',
      message: 'Join us for Sunday Service at 10 AM',
      target: 'members',
      sentAt: new Date(Date.now() - 7200000).toISOString(),
      recipientCount: 856,
      status: 'sent',
    },
  ]);

  const canSendNotifications = hasPermission('notifications.send') || hasPermission('notifications.broadcast');

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }

    if (!canSendNotifications) {
      Alert.alert('Permission Denied', 'You do not have permission to send notifications');
      return;
    }

    Alert.alert(
      'Send Notification',
      `Send "${title}" to ${target === 'all' ? 'all users' : target}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setIsSending(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              
              const newNotification: NotificationLog = {
                id: Date.now().toString(),
                title,
                message,
                target,
                sentAt: new Date().toISOString(),
                recipientCount: target === 'all' ? 1500 : target === 'members' ? 1200 : 300,
                status: 'sent',
              };

              setNotificationLog([newNotification, ...notificationLog]);
              setTitle('');
              setMessage('');
              Alert.alert('Success', 'Notification sent successfully!');
            } catch (error) {
              console.error('Error sending notification:', error);
              Alert.alert('Error', 'Failed to send notification. Please try again.');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  const TargetButton = ({ value, label, icon: Icon }: { value: NotificationTarget; label: string; icon: any }) => (
    <TouchableOpacity
      style={[
        styles.targetButton,
        target === value && [styles.activeTarget, { backgroundColor: colors.accent }],
        { borderColor: colors.border },
      ]}
      onPress={() => setTarget(value)}
    >
      <Icon size={20} color={target === value ? '#FFF' : colors.text} />
      <Text style={[styles.targetLabel, { color: target === value ? '#FFF' : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PriorityButton = ({ value, label }: { value: NotificationPriority; label: string }) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === value && [styles.activePriority, { backgroundColor: colors.accent }],
        { borderColor: colors.border },
      ]}
      onPress={() => setPriority(value)}
    >
      <Text style={[styles.priorityLabel, { color: priority === value ? '#FFF' : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const NotificationLogItem = ({ item }: { item: NotificationLog }) => {
    const targetLabel = {
      all: 'All Users',
      members: 'Members',
      guests: 'Guests',
      specific: 'Specific Users',
    }[item.target];

    return (
      <View style={[styles.logItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.logHeader}>
          <View style={styles.logTitleRow}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={[styles.logTitle, { color: colors.text }]}>{item.title}</Text>
          </View>
          <Text style={[styles.logTime, { color: colors.subtext }]}>
            {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.logMessage, { color: colors.subtext }]} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.logFooter}>
          <Text style={[styles.logTarget, { color: colors.accent }]}>{targetLabel}</Text>
          <Text style={[styles.logRecipients, { color: colors.subtext }]}>
            {item.recipientCount} recipients
          </Text>
        </View>
      </View>
    );
  };

  if (!adminUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Please log in as admin to access this feature
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Push Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!canSendNotifications && (
          <View style={[styles.permissionBanner, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <Text style={[styles.permissionText, { color: colors.warning }]}>
              You do not have permission to send notifications. Contact an administrator.
            </Text>
          </View>
        )}

        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>New Notification</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Notification title"
              placeholderTextColor={colors.subtext}
              editable={canSendNotifications}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Message</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Notification message"
              placeholderTextColor={colors.subtext}
              multiline
              numberOfLines={4}
              editable={canSendNotifications}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Target Audience</Text>
            <View style={styles.targetGrid}>
              <TargetButton value="all" label="All Users" icon={Users} />
              <TargetButton value="members" label="Members" icon={Users} />
              <TargetButton value="guests" label="Guests" icon={Users} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Priority</Text>
            <View style={styles.priorityRow}>
              <PriorityButton value="normal" label="Normal" />
              <PriorityButton value="high" label="High Priority" />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: canSendNotifications ? colors.accent : colors.border },
            ]}
            onPress={handleSendNotification}
            disabled={!canSendNotifications || isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Send size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Send Notification</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.logSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Notifications</Text>
          {notificationLog.map((item) => (
            <NotificationLogItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  permissionBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  targetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  targetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  activeTarget: {
    borderWidth: 0,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activePriority: {
    borderWidth: 0,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logSection: {
    padding: 16,
  },
  logItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 12,
  },
  logMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTarget: {
    fontSize: 12,
    fontWeight: '600',
  },
  logRecipients: {
    fontSize: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
