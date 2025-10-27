import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/store/themeStore';
import { Colors } from '@/constants/colors';
import { Users, Key, Shield, Trash2, UserCheck, UserX, RefreshCw } from 'lucide-react-native';

export default function AdminManagePage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  
  const [activeTab, setActiveTab] = useState<'users' | 'keys' | 'posts'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessKeyModal, setAccessKeyModal] = useState(false);
  const [newKey, setNewKey] = useState<{key: string; role: string} | null>(null);
  const [keyRole, setKeyRole] = useState<'admin' | 'moderator' | 'member'>('member');
  const [keyExpireDays, setKeyExpireDays] = useState('30');

  const usersQuery = trpc.admin.users.list.useQuery({ 
    search: searchQuery,
    role: 'all',
    status: 'all'
  });
  
  const accessKeysQuery = trpc.admin.listAccessKeys.useQuery();
  
  const postsQuery = trpc.admin.content.listPosts.useQuery({
    category: 'all',
    status: 'all'
  });

  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      Alert.alert('Success', 'User role updated successfully');
    }
  });

  const deleteUserMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      Alert.alert('Success', 'User deleted successfully');
    }
  });

  const toggleStatusMutation = trpc.admin.users.toggleStatus.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      Alert.alert('Success', 'User status updated');
    }
  });

  const generateKeyMutation = trpc.admin.generateAccessKey.useMutation({
    onSuccess: (data) => {
      setNewKey(data);
      accessKeysQuery.refetch();
    }
  });

  const deletePostMutation = trpc.admin.content.deletePost.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
      Alert.alert('Success', 'Post deleted successfully');
    }
  });

  const flagPostMutation = trpc.admin.content.flagPost.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
      Alert.alert('Success', 'Post flagged for review');
    }
  });

  const handleGenerateKey = () => {
    const days = parseInt(keyExpireDays);
    if (isNaN(days) || days < 1) {
      Alert.alert('Error', 'Please enter valid number of days');
      return;
    }
    
    generateKeyMutation.mutate({
      role: keyRole,
      expiresInDays: days
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteUserMutation.mutate({ userId })
        }
      ]
    );
  };

  const handlePromoteUser = (userId: string, currentRole: string) => {
    const roles = ['guest', 'member', 'moderator', 'admin'];
    const currentIndex = roles.indexOf(currentRole);
    const newRole = roles[Math.min(currentIndex + 1, roles.length - 1)] as 'admin' | 'moderator' | 'member' | 'guest';
    
    if (currentIndex >= roles.length - 1) {
      Alert.alert('Info', 'User already has the highest role');
      return;
    }

    Alert.alert(
      'Promote User',
      `Promote user to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: () => updateRoleMutation.mutate({ userId, role: newRole })
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: colors.subtext }]}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.active ? colors.success : colors.error }
          ]} />
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.goldLight }]}
          onPress={() => handlePromoteUser(item.id, item.role)}
        >
          <Shield size={16} color={colors.gold} />
          <Text style={[styles.actionBtnText, { color: colors.gold }]}>Promote</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.blueLight }]}
          onPress={() => toggleStatusMutation.mutate({ userId: item.id })}
        >
          {item.active ? <UserX size={16} color={colors.royal} /> : <UserCheck size={16} color={colors.royal} />}
          <Text style={[styles.actionBtnText, { color: colors.royal }]}>
            {item.active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: 'rgba(220, 53, 69, 0.1)' }]}
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <Trash2 size={16} color={colors.error} />
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccessKeyItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.keyHeader}>
        <Key size={20} color={colors.gold} />
        <Text style={[styles.keyText, { color: colors.text }]} numberOfLines={1}>
          {item.key}
        </Text>
      </View>
      
      <View style={styles.keyInfo}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
        </View>
        <Text style={[styles.keyExpiry, { color: colors.subtext }]}>
          Expires: {new Date(item.expiresAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.keyStatus, { color: item.used ? colors.error : colors.success }]}>
          {item.used ? 'USED' : 'AVAILABLE'}
        </Text>
      </View>
    </View>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <Text style={[styles.postAuthor, { color: colors.text }]}>{item.userName}</Text>
        <Text style={[styles.postDate, { color: colors.subtext }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}
          onPress={() => flagPostMutation.mutate({ postId: item.id, reason: 'Flagged by admin' })}
        >
          <Text style={[styles.actionBtnText, { color: colors.warning }]}>Flag</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: 'rgba(220, 53, 69, 0.1)' }]}
          onPress={() => {
            Alert.alert(
              'Delete Post',
              'Are you sure you want to delete this post?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deletePostMutation.mutate({ postId: item.id })
                }
              ]
            );
          }}
        >
          <Trash2 size={16} color={colors.error} />
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#D4AF37';
      case 'moderator': return '#3B82F6';
      case 'member': return '#10B981';
      case 'guest': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitle: 'User & Content Management',
        }}
      />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && { borderBottomColor: colors.gold }]}
          onPress={() => setActiveTab('users')}
        >
          <Users size={20} color={activeTab === 'users' ? colors.gold : colors.subtext} />
          <Text style={[styles.tabText, { color: activeTab === 'users' ? colors.gold : colors.subtext }]}>
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'keys' && { borderBottomColor: colors.gold }]}
          onPress={() => setActiveTab('keys')}
        >
          <Key size={20} color={activeTab === 'keys' ? colors.gold : colors.subtext} />
          <Text style={[styles.tabText, { color: activeTab === 'keys' ? colors.gold : colors.subtext }]}>
            Access Keys
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && { borderBottomColor: colors.gold }]}
          onPress={() => setActiveTab('posts')}
        >
          <RefreshCw size={20} color={activeTab === 'posts' ? colors.gold : colors.subtext} />
          <Text style={[styles.tabText, { color: activeTab === 'posts' ? colors.gold : colors.subtext }]}>
            Posts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'users' && (
        <>
          <View style={styles.searchBar}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Search users..."
              placeholderTextColor={colors.subtext}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <FlatList
            data={usersQuery.data || []}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={usersQuery.isLoading}
            onRefresh={() => usersQuery.refetch()}
          />
        </>
      )}

      {activeTab === 'keys' && (
        <>
          <TouchableOpacity
            style={[styles.generateBtn, { backgroundColor: colors.gold }]}
            onPress={() => setAccessKeyModal(true)}
          >
            <Key size={20} color="#FFFFFF" />
            <Text style={styles.generateBtnText}>Generate New Access Key</Text>
          </TouchableOpacity>
          
          <FlatList
            data={accessKeysQuery.data || []}
            renderItem={renderAccessKeyItem}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.list}
            refreshing={accessKeysQuery.isLoading}
            onRefresh={() => accessKeysQuery.refetch()}
          />
        </>
      )}

      {activeTab === 'posts' && (
        <FlatList
          data={postsQuery.data || []}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={postsQuery.isLoading}
          onRefresh={() => postsQuery.refetch()}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No posts to moderate</Text>
          }
        />
      )}

      <Modal
        visible={accessKeyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAccessKeyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Generate Access Key</Text>
            
            <Text style={[styles.label, { color: colors.text }]}>Role</Text>
            <View style={styles.roleButtons}>
              {(['member', 'moderator', 'admin'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    { backgroundColor: keyRole === role ? colors.gold : colors.background }
                  ]}
                  onPress={() => setKeyRole(role)}
                >
                  <Text style={[styles.roleButtonText, { color: keyRole === role ? '#FFFFFF' : colors.text }]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.label, { color: colors.text }]}>Expires In (Days)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="30"
              keyboardType="number-pad"
              value={keyExpireDays}
              onChangeText={setKeyExpireDays}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.background }]}
                onPress={() => setAccessKeyModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.gold }]}
                onPress={() => {
                  handleGenerateKey();
                  setAccessKeyModal(false);
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Generate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!newKey}
        transparent
        animationType="fade"
        onRequestClose={() => setNewKey(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Access Key Generated!</Text>
            
            <View style={[styles.keyDisplay, { backgroundColor: colors.background }]}>
              <Text style={[styles.keyDisplayText, { color: colors.gold }]}>{newKey?.key}</Text>
            </View>
            
            <Text style={[styles.keyNote, { color: colors.subtext }]}>
              Save this key securely. It won&apos;t be shown again.
            </Text>
            
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.gold }]}
              onPress={() => setNewKey(null)}
            >
              <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  searchBar: {
    padding: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  keyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    flex: 1,
  },
  keyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keyExpiry: {
    fontSize: 12,
  },
  keyStatus: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  postDate: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
    marginTop: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  keyDisplay: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  keyDisplayText: {
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  keyNote: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
});
