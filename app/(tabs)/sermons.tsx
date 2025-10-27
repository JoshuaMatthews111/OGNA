import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import SermonCard from '@/components/SermonCard';
import { Sermon } from '@/types';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/store/themeStore';

export default function SermonsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { data: content, isLoading } = trpc.admin.content.get.useQuery();
  const sermons = content?.sermons || [];

  const handleSermonPress = (sermon: Sermon) => {
    router.push(`/sermon/${sermon.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sermons</Text>
          
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <Search size={20} color={colors.subtext} />
            <Text style={[styles.searchPlaceholder, { color: colors.subtext }]}>Search sermons...</Text>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.activeFilterText, { color: colors.accent }]}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={[styles.filterText, { color: colors.subtext }]}>Popular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={[styles.filterText, { color: colors.subtext }]}>Series</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <Text style={[styles.loadingText, { color: colors.subtext }]}>Loading sermons...</Text>
          ) : sermons.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No sermons available</Text>
          ) : (
            <View style={styles.sermonsContainer}>
              {sermons.map((sermon) => (
                <SermonCard 
                  key={sermon.id} 
                  sermon={sermon} 
                  onPress={handleSermonPress}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 20,
  },
  filterText: {
    fontSize: 14,
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sermonsContainer: {
    marginTop: 8,
  },
});