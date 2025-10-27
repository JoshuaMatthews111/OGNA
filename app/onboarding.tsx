import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, Ship } from 'lucide-react-native';
import { onboardingData, churchInfo } from '@/constants/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import Colors from '@/constants/colors';
import Logo from '@/components/Logo';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { setOnboardingCompleted } = useOnboardingStore();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setOnboardingCompleted();
    router.replace('/(tabs)');
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / width);
    setCurrentIndex(index);
  };

  const currentData = onboardingData[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentData.backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentData.backgroundColor} />
      
      {/* Skip Button */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={[styles.imageOverlay, { backgroundColor: item.backgroundColor + '80' }]} />
            </View>
            
            <View style={styles.contentContainer}>
              <Text style={[styles.title, { color: item.accentColor }]}>
                {item.title}
              </Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              
              {index === onboardingData.length - 1 && (
                <View style={styles.churchInfo}>
                  <Logo size="medium" showText={false} style={styles.logoInOnboarding} />
                  <Text style={styles.churchName}>{churchInfo.name}</Text>
                  <Text style={styles.pastorName}>Founded by {churchInfo.founder}</Text>
                  <Text style={styles.location}>{churchInfo.location}</Text>
                  <Text style={styles.mission}>"{churchInfo.mission}"</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex 
                    ? currentData.accentColor 
                    : 'rgba(255, 255, 255, 0.3)',
                  width: index === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          onPress={handleNext} 
          style={[styles.nextButton, { backgroundColor: currentData.accentColor }]}
        >
          {currentIndex === onboardingData.length - 1 ? (
            <Text style={styles.nextButtonText}>Get Started</Text>
          ) : (
            <ChevronRight size={24} color={currentData.backgroundColor} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingRight: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  imageContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  churchInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoInOnboarding: {
    marginBottom: 16,
  },
  churchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  pastorName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    textAlign: 'center',
  },
  mission: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});