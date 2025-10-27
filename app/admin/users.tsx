import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Edit, Trash2, UserCheck, UserX } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

import { User } from '@/types';

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'member' as User['role'] });

  const { data: users = [], refetch } = trpc.admin.users.getAll.useQuery();

  const updateUserMutation = trpc.admin.users.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditModalVisible(false);
      Alert.alert('Success', 'User updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const deleteUserMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'User deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setEditModalVisible(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      id: selectedUser.id,
      ...editForm
    });
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteUserMutation.mutate({ id: user.id })
        }
      ]
    );
  };

  const toggleUserStatus = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      active: !user.active
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#DC2626';
      case 'member': return '#059669';
      case 'guest': return '#6B7280';
      default: return colors.dark.subtext;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.statsText}>{users.length} Total Users</Text>
        
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleUserStatus(user as User)}
                  >
                    {user.active ? (
                      <UserCheck size={18} color="#059669" />
                    ) : (
                      <UserX size={18} color="#DC2626" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditUser(user as User)}
                  >
                    <Edit size={18} color={colors.dark.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteUser(user as User)}
                  >
                    <Trash2 size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userMeta}>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                  <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                    {user.role.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.joinDate}>Joined {user.joinDate}</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: user.active ? '#059669' : '#DC2626' }
                ]} />
                <Text style={styles.statusText}>
                  {user.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.dark.subtext}
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.dark.subtext}
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.roleSelector}>
              {(['member', 'guest'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    editForm.role === role && styles.roleOptionSelected
                  ]}
                  onPress={() => setEditForm({ ...editForm, role })}
                >
                  <Text style={[
                    styles.roleOptionText,
                    editForm.role === role && styles.roleOptionTextSelected
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateUser}
                disabled={updateUserMutation.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {updateUserMutation.isPending ? 'Saving...' : 'Save'}
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
  statsText: {
    fontSize: 16,
    color: colors.dark.subtext,
    marginVertical: 16,
  },
  userCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  userInfo: {
    gap: 8,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  userEmail: {
    fontSize: 14,
    color: colors.dark.subtext,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinDate: {
    fontSize: 12,
    color: colors.dark.subtext,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.dark.subtext,
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
    width: '90%',
    maxWidth: 400,
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
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  roleOptionText: {
    color: colors.dark.text,
    fontWeight: '500',
  },
  roleOptionTextSelected: {
    color: colors.dark.background,
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
  },
  saveButtonText: {
    color: colors.dark.background,
    fontWeight: '600',
  },
});