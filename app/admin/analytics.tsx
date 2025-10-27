import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Music, 
  Video,
  TrendingUp,
  Calendar,
  Clock,
  Eye
} from 'lucide-react-native';
import colors from '@/constants/colors';

const analyticsData = {
  users: {
    total: 1247,
    active: 892,
    new: 45,
    growth: '+12%'
  },
  messages: {
    sent: 156,
    delivered: 1389,
    opened: 1124,
    rate: '81%'
  },
  sermons: {
    total: 89,
    views: 5432,
    downloads: 1234,
    avgDuration: '42:15'
  },
  liveStreams: {
    total: 24,
    viewers: 2156,
    peakViewers: 456,
    avgDuration: '1:23:45'
  }
};

export default function Analytics() {
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: IconComponent, 
    color, 
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: string;
    trend?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={20} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <TrendingUp size={12} color="#059669" />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>User Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={analyticsData.users.total.toLocaleString()}
            subtitle="Registered members"
            icon={Users}
            color="#4F46E5"
            trend={analyticsData.users.growth}
          />
          <StatCard
            title="Active Users"
            value={analyticsData.users.active.toLocaleString()}
            subtitle="Last 30 days"
            icon={Eye}
            color="#059669"
          />
          <StatCard
            title="New Users"
            value={analyticsData.users.new}
            subtitle="This week"
            icon={TrendingUp}
            color="#DC2626"
          />
        </View>

        <Text style={styles.sectionTitle}>Message Performance</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Messages Sent"
            value={analyticsData.messages.sent}
            subtitle="Total campaigns"
            icon={MessageSquare}
            color="#7C3AED"
          />
          <StatCard
            title="Total Delivered"
            value={analyticsData.messages.delivered.toLocaleString()}
            subtitle="All time"
            icon={Users}
            color="#059669"
          />
          <StatCard
            title="Open Rate"
            value={analyticsData.messages.rate}
            subtitle={`${analyticsData.messages.opened} opened`}
            icon={Eye}
            color="#D97706"
          />
        </View>

        <Text style={styles.sectionTitle}>Sermon Analytics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Sermons"
            value={analyticsData.sermons.total}
            subtitle="Available content"
            icon={Music}
            color="#0891B2"
          />
          <StatCard
            title="Total Views"
            value={analyticsData.sermons.views.toLocaleString()}
            subtitle="All sermons"
            icon={Eye}
            color="#059669"
          />
          <StatCard
            title="Downloads"
            value={analyticsData.sermons.downloads.toLocaleString()}
            subtitle="Audio/Video"
            icon={TrendingUp}
            color="#DC2626"
          />
          <StatCard
            title="Avg Duration"
            value={analyticsData.sermons.avgDuration}
            subtitle="Per sermon"
            icon={Clock}
            color="#7C3AED"
          />
        </View>

        <Text style={styles.sectionTitle}>Live Stream Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Streams"
            value={analyticsData.liveStreams.total}
            subtitle="All time"
            icon={Video}
            color="#EA580C"
          />
          <StatCard
            title="Total Viewers"
            value={analyticsData.liveStreams.viewers.toLocaleString()}
            subtitle="Cumulative"
            icon={Users}
            color="#059669"
          />
          <StatCard
            title="Peak Viewers"
            value={analyticsData.liveStreams.peakViewers}
            subtitle="Single stream"
            icon={TrendingUp}
            color="#DC2626"
          />
          <StatCard
            title="Avg Duration"
            value={analyticsData.liveStreams.avgDuration}
            subtitle="Per stream"
            icon={Clock}
            color="#4F46E5"
          />
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Key Insights</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                User engagement is up 12% this month
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Sunday sermons have the highest view count
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Live streams peak at 10 AM on Sundays
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Message open rates are highest on weekdays
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginTop: 24,
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 14,
    color: colors.dark.subtext,
  },
  insightsCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.dark.accent,
  },
  insightText: {
    fontSize: 14,
    color: colors.dark.subtext,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.dark.subtext,
  },
});