import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal, Camera, Mic } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { DirectMessage, UserProfile } from '@/types';

const mockUser: UserProfile = {
  id: '1',
  name: 'Sarah Matthews',
  email: 'sarah@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
  bio: 'Follower of Christ, mother of two, worship leader',
  location: 'Mentor, OH',
  joinDate: '2023-06-15T10:00:00Z',
  role: 'member',
  isOnline: true,
  lastSeen: '2024-01-20T16:00:00Z',
  groups: ['1', '2'],
  followers: ['2', '3'],
  following: ['2', '4'],
  postsCount: 15,
  testimoniesCount: 3,
  prayerRequestsCount: 2,
  privacy: {
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    showOnlineStatus: true,
  },
};

const mockMessages: DirectMessage[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: 'current-user',
    content: 'Hi! Thank you for your prayers for my father. He\'s doing much better now! 🙏',
    type: 'text',
    isRead: true,
    isEdited: false,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    senderId: 'current-user',
    receiverId: '1',
    content: 'That\'s wonderful news! God is so good. I\'m so happy to hear he\'s recovering well.',
    type: 'text',
    isRead: true,
    isEdited: false,
    createdAt: '2024-01-20T10:05:00Z',
    updatedAt: '2024-01-20T10:05:00Z',
  },
  {
    id: '3',
    senderId: '1',
    receiverId: 'current-user',
    content: 'Yes, He really is! The doctors are amazed at his progress. Thank you for being such a blessing in our community.',
    type: 'text',
    isRead: true,
    isEdited: false,
    createdAt: '2024-01-20T10:10:00Z',
    updatedAt: '2024-01-20T10:10:00Z',
  },
  {
    id: '4',
    senderId: 'current-user',
    receiverId: '1',
    content: 'I\'m just grateful to be part of this amazing church family. See you at service this Sunday?',
    type: 'text',
    isRead: false,
    isEdited: false,
    createdAt: '2024-01-20T10:15:00Z',
    updatedAt: '2024-01-20T10:15:00Z',
  },
];

export default function MessagesScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>(mockMessages);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: DirectMessage = {
        id: Date.now().toString(),
        senderId: 'current-user',
        receiverId: id as string,
        content: message.trim(),
        type: 'text',
        isRead: false,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (msg: DirectMessage, index: number) => {
    const isCurrentUser = msg.senderId === 'current-user';
    const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].senderId !== msg.senderId);
    
    return (
      <View key={msg.id} style={[styles.messageContainer, isCurrentUser && styles.currentUserMessage]}>
        {showAvatar && (
          <Image source={{ uri: mockUser.avatar }} style={styles.messageAvatar} />
        )}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          !showAvatar && !isCurrentUser && styles.messageBubbleWithoutAvatar
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {msg.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTime(msg.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.userInfo} onPress={() => router.push(`/profile/${id}`)}>
          <Image source={{ uri: mockUser.avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{mockUser.name}</Text>
            <Text style={styles.headerStatus}>
              {mockUser.isOnline ? 'Online' : `Last seen ${formatTime(mockUser.lastSeen)}`}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => router.push(`/call/${id}?type=audio`)}
          >
            <Phone size={20} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => router.push(`/call/${id}?type=video`)}
          >
            <Video size={20} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <MoreHorizontal size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg, index) => renderMessage(msg, index))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Camera size={20} color={Colors.dark.subtext} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.dark.subtext}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity style={styles.attachButton}>
            <Mic size={20} color={Colors.dark.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send size={18} color={message.trim() ? Colors.dark.background : Colors.dark.subtext} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleWithoutAvatar: {
    marginLeft: 40,
  },
  currentUserBubble: {
    backgroundColor: Colors.dark.accent,
    borderBottomRightRadius: 6,
  },
  otherUserBubble: {
    backgroundColor: Colors.dark.card,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  currentUserText: {
    color: Colors.dark.background,
  },
  otherUserText: {
    color: Colors.dark.text,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: Colors.dark.background + '80',
  },
  otherUserTime: {
    color: Colors.dark.subtext,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.dark.text,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.dark.accent,
  },
});