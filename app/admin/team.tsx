import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Edit, Trash2, Users, Shield, Eye, EyeOff, UserCheck, UserX } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { useAdminStore, TeamMember, AdminPermission } from '@/store/adminStore';

export default function TeamManagementScreen() {
  const { colors } = useTheme();
  const { teamMembers, permissions, addTeamMember, updateTeamMember, removeTeamMember, hasPermission } = useAdminStore();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'moderator' | 'editor';
    permissions: string[];
  }>({
    name: '',
    email: '',
    role: 'editor',
    permissions: []
  });

  const canManageTeam = hasPermission('team.manage');

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      role: newMember.role,
      permissions: newMember.permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'current-admin-id'
    };

    addTeamMember(member);
    setNewMember({ name: '', email: '', role: 'editor', permissions: [] });
    setShowAddModal(false);
    Alert.alert('Success', 'Team member added successfully');
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      email: member.email,
      role: member.role,
      permissions: member.permissions
    });
    setShowAddModal(true);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;

    updateTeamMember(editingMember.id, {
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      role: newMember.role,
      permissions: newMember.permissions
    });

    setEditingMember(null);
    setNewMember({ name: '', email: '', role: 'editor', permissions: [] });
    setShowAddModal(false);
    Alert.alert('Success', 'Team member updated successfully');
  };

  const handleDeleteMember = (member: TeamMember) => {
    Alert.alert(
      'Delete Team Member',
      `Are you sure you want to remove ${member.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeTeamMember(member.id);
            Alert.alert('Success', 'Team member removed successfully');
          }
        }
      ]
    );
  };

  const handleToggleActive = (member: TeamMember) => {
    updateTeamMember(member.id, { isActive: !member.isActive });
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = newMember.permissions;
    const hasPermission = currentPermissions.includes(permissionId);
    
    if (hasPermission) {
      setNewMember({
        ...newMember,
        permissions: currentPermissions.filter(p => p !== permissionId)
      });
    } else {
      setNewMember({
        ...newMember,
        permissions: [...currentPermissions, permissionId]
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return colors.error;
      case 'moderator': return colors.warning;
      case 'editor': return colors.info;
      default: return colors.subtext;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'moderator': return UserCheck;
      case 'editor': return Edit;
      default: return Users;
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, AdminPermission[]>);

  const TeamMemberCard = ({ member }: { member: TeamMember }) => {
    const RoleIcon = getRoleIcon(member.role);
    
    return (
      <View style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.memberHeader}>
          <View style={styles.memberInfo}>
            <View style={[styles.roleIcon, { backgroundColor: `${getRoleColor(member.role)}20` }]}>
              <RoleIcon size={20} color={getRoleColor(member.role)} />
            </View>
            <View style={styles.memberDetails}>
              <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
              <Text style={[styles.memberEmail, { color: colors.subtext }]}>{member.email}</Text>
              <View style={styles.memberMeta}>
                <Text style={[styles.memberRole, { color: getRoleColor(member.role) }]}>
                  {member.role.toUpperCase()}
                </Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: member.isActive ? `${colors.success}20` : `${colors.error}20` 
                }]}>
                  <Text style={[styles.statusText, { 
                    color: member.isActive ? colors.success : colors.error 
                  }]}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {canManageTeam && (
            <View style={styles.memberActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.accentLight }]}
                onPress={() => handleToggleActive(member)}
              >
                {member.isActive ? (
                  <EyeOff size={16} color={colors.accent} />
                ) : (
                  <Eye size={16} color={colors.accent} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.accentLight }]}
                onPress={() => handleEditMember(member)}
              >
                <Edit size={16} color={colors.accent} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}
                onPress={() => handleDeleteMember(member)}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.permissionsPreview}>
          <Text style={[styles.permissionsLabel, { color: colors.subtext }]}>
            Permissions: {member.permissions.length}
          </Text>
          <View style={styles.permissionTags}>
            {member.permissions.slice(0, 3).map(permissionId => {
              const permission = permissions.find(p => p.id === permissionId);
              return permission ? (
                <View key={permissionId} style={[styles.permissionTag, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.permissionTagText, { color: colors.accent }]}>
                    {permission.name}
                  </Text>
                </View>
              ) : null;
            })}
            {member.permissions.length > 3 && (
              <Text style={[styles.morePermissions, { color: colors.subtext }]}>
                +{member.permissions.length - 3} more
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const AddMemberModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setShowAddModal(false);
            setEditingMember(null);
            setNewMember({ name: '', email: '', role: 'editor', permissions: [] });
          }}>
            <Text style={[styles.modalCancel, { color: colors.error }]}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingMember ? 'Edit Member' : 'Add Team Member'}
          </Text>
          
          <TouchableOpacity onPress={editingMember ? handleUpdateMember : handleAddMember}>
            <Text style={[styles.modalSave, { color: colors.accent }]}>
              {editingMember ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newMember.name}
              onChangeText={(text) => setNewMember({ ...newMember, name: text })}
              placeholder="Enter full name"
              placeholderTextColor={colors.subtext}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newMember.email}
              onChangeText={(text) => setNewMember({ ...newMember, email: text })}
              placeholder="Enter email address"
              placeholderTextColor={colors.subtext}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Role</Text>
            <View style={styles.roleOptions}>
              {(['admin', 'moderator', 'editor'] as const).map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    {
                      backgroundColor: newMember.role === role ? colors.accentLight : colors.card,
                      borderColor: newMember.role === role ? colors.accent : colors.border
                    }
                  ]}
                  onPress={() => setNewMember({ ...newMember, role })}
                >
                  <Text style={[
                    styles.roleOptionText,
                    { color: newMember.role === role ? colors.accent : colors.text }
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Permissions</Text>
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <View key={category} style={styles.permissionCategory}>
                <Text style={[styles.categoryTitle, { color: colors.accent }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {categoryPermissions.map(permission => (
                  <TouchableOpacity
                    key={permission.id}
                    style={[
                      styles.permissionItem,
                      {
                        backgroundColor: newMember.permissions.includes(permission.id) 
                          ? colors.accentLight 
                          : colors.card,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => togglePermission(permission.id)}
                  >
                    <View style={styles.permissionInfo}>
                      <Text style={[
                        styles.permissionName,
                        { 
                          color: newMember.permissions.includes(permission.id) 
                            ? colors.accent 
                            : colors.text 
                        }
                      ]}>
                        {permission.name}
                      </Text>
                      <Text style={[styles.permissionDescription, { color: colors.subtext }]}>
                        {permission.description}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      {
                        backgroundColor: newMember.permissions.includes(permission.id) 
                          ? colors.accent 
                          : 'transparent',
                        borderColor: colors.accent
                      }
                    ]}>
                      {newMember.permissions.includes(permission.id) && (
                        <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (!canManageTeam) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Team Management</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.noPermissionContainer}>
          <Shield size={64} color={colors.subtext} />
          <Text style={[styles.noPermissionTitle, { color: colors.text }]}>Access Denied</Text>
          <Text style={[styles.noPermissionText, { color: colors.subtext }]}>
            You don't have permission to manage team members.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Team Management</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Plus size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{teamMembers.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Total Members</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {teamMembers.filter(m => m.isActive).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Active</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {teamMembers.filter(m => m.role === 'admin').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Admins</Text>
          </View>
        </View>

        <View style={styles.membersContainer}>
          {teamMembers.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={64} color={colors.subtext} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Team Members</Text>
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                Add team members to help manage your app content and users.
              </Text>
            </View>
          ) : (
            teamMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))
          )}
        </View>
      </ScrollView>

      <AddMemberModal />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  membersContainer: {
    paddingHorizontal: 16,
  },
  memberCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    marginBottom: 6,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionsPreview: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  permissionsLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  permissionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  permissionTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  permissionTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  morePermissions: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noPermissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noPermissionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  permissionCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});