import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Users, BookOpen, ShoppingBag, Heart, GraduationCap, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import Header from '@/components/Header';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const features = [
    {
      title: 'Community',
      description: 'Connect with believers',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
      route: '/(tabs)/community',
    },
    {
      title: 'Sermons',
      description: 'Watch & listen',
      icon: BookOpen,
      image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80',
      route: '/(tabs)/sermons',
    },
    {
      title: 'Shop',
      description: 'Browse products',
      icon: ShoppingBag,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      route: '/(tabs)/shop',
    },
    {
      title: 'Giving',
      description: 'Support the ministry',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
      route: '/giving',
    },
    {
      title: 'Discipleship',
      description: 'Grow in your faith',
      icon: GraduationCap,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      route: '/discipleship',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80' }}
            style={styles.heroImageBackground}
            imageStyle={styles.heroImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Sparkles size={32} color="#fff" />
                <Text style={styles.heroSubtitle}>Explore everything Overcomers has to offer</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
          <View style={styles.gridContainer}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={feature.title}
                style={styles.featureCard}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.7}
              >
                <ImageBackground
                  source={{ uri: feature.image }}
                  style={styles.featureImageBackground}
                  imageStyle={styles.featureImage}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.featureOverlay}
                  >
                    <View style={styles.featureIconContainer}>
                      <feature.icon size={28} color="#fff" strokeWidth={2.5} />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    height: 180,
  },
  heroImageBackground: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    borderRadius: 20,
  },
  heroGradient: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    textAlign: 'center' as const,
    fontWeight: '600' as const,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    height: 140,
  },
  featureImageBackground: {
    width: '100%',
    height: '100%',
  },
  featureImage: {
    borderRadius: 16,
  },
  featureOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});