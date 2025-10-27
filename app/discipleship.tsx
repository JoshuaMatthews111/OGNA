import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { GraduationCap, CheckCircle2, Circle, Clock, BookOpen, Users } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { trpc } from '@/lib/trpc';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'personal' | 'group';
  groupId?: string;
  groupName?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedBy: string;
  createdAt: string;
}

export default function DiscipleshipScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'personal' | 'group'>('all');

  const assignmentsQuery = trpc.discipleship.list.useQuery({
    userId: user?.id || '',
    type: filter === 'all' ? undefined : filter,
  });

  const toggleStatusMutation = trpc.discipleship.updateStatus.useMutation({
    onSuccess: () => {
      assignmentsQuery.refetch();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      default:
        return colors.subtext;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in-progress':
        return Clock;
      default:
        return Circle;
    }
  };

  const renderAssignment = ({ item }: { item: Assignment }) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={[styles.assignmentCard, { backgroundColor: colors.card }]}
        onPress={() => {
          const nextStatus =
            item.status === 'pending'
              ? 'in-progress'
              : item.status === 'in-progress'
              ? 'completed'
              : 'pending';
          toggleStatusMutation.mutate({ id: item.id, status: nextStatus });
        }}
      >
        <View style={styles.assignmentHeader}>
          <StatusIcon size={24} color={statusColor} />
          <View style={styles.assignmentInfo}>
            <Text style={[styles.assignmentTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.assignmentMeta, { color: colors.subtext }]}>
              {item.type === 'group' ? `Group: ${item.groupName}` : 'Personal Assignment'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20`, borderColor: statusColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace('-', ' ')}
            </Text>
          </View>
        </View>
        <Text style={[styles.assignmentDescription, { color: colors.subtext }]}>
          {item.description}
        </Text>
        <View style={styles.assignmentFooter}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Assigned by: {item.assignedBy}
          </Text>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#30cfd0', '#330867']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <GraduationCap size={48} color="#fff" />
        <Text style={styles.headerTitle}>Discipleship</Text>
        <Text style={styles.headerSubtitle}>Grow in your faith journey</Text>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filter === 'all' ? '#30cfd0' : colors.card,
              borderColor: filter === 'all' ? '#30cfd0' : colors.subtext,
            },
          ]}
          onPress={() => setFilter('all')}
        >
          <BookOpen size={18} color={filter === 'all' ? '#fff' : colors.text} />
          <Text
            style={[
              styles.filterText,
              { color: filter === 'all' ? '#fff' : colors.text },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filter === 'personal' ? '#30cfd0' : colors.card,
              borderColor: filter === 'personal' ? '#30cfd0' : colors.subtext,
            },
          ]}
          onPress={() => setFilter('personal')}
        >
          <GraduationCap size={18} color={filter === 'personal' ? '#fff' : colors.text} />
          <Text
            style={[
              styles.filterText,
              { color: filter === 'personal' ? '#fff' : colors.text },
            ]}
          >
            Personal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filter === 'group' ? '#30cfd0' : colors.card,
              borderColor: filter === 'group' ? '#30cfd0' : colors.subtext,
            },
          ]}
          onPress={() => setFilter('group')}
        >
          <Users size={18} color={filter === 'group' ? '#fff' : colors.text} />
          <Text
            style={[
              styles.filterText,
              { color: filter === 'group' ? '#fff' : colors.text },
            ]}
          >
            Group
          </Text>
        </TouchableOpacity>
      </View>

      {assignmentsQuery.isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>Loading...</Text>
        </View>
      ) : assignmentsQuery.data?.assignments.length === 0 ? (
        <View style={styles.centerContainer}>
          <GraduationCap size={64} color={colors.subtext} />
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            No assignments yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
            Check back later for new assignments
          </Text>
        </View>
      ) : (
        <FlatList
          data={assignmentsQuery.data?.assignments || []}
          renderItem={renderAssignment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  assignmentCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assignmentMeta: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
  },
  assignmentDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center' as const,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});