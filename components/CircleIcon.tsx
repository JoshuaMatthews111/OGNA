import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Calendar, Tv } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';

interface CircleIconProps {
  title: string;
  icon: 'calendar' | 'bell' | 'tv';
  colors: string[];
  imageUrl?: string;
  isActive?: boolean;
  onPress?: () => void;
}

export default function CircleIcon({ 
  title, 
  icon, 
  colors,
  imageUrl, 
  isActive = false,
  onPress 
}: CircleIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  
  const renderIcon = () => {
    switch (icon) {
      case 'calendar':
        return <Calendar size={24} color="white" />;
      case 'bell':
        return <Bell size={24} color="white" />;
      case 'tv':
        return <Tv size={24} color="white" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconWrapper}>
        {imageUrl ? (
          <View style={[styles.circle, isActive && styles.activeCircle]}>
            <ImageBackground
              source={{ uri: imageUrl }}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.overlay}
              >
                {renderIcon()}
              </LinearGradient>
            </ImageBackground>
          </View>
        ) : (
          <LinearGradient
            colors={colors as any}
            style={[styles.circle, isActive && styles.activeCircle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {renderIcon()}
          </LinearGradient>
        )}
        {isActive && <View style={styles.activeBorder} />}
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconWrapper: {
    position: 'relative',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    shadowColor: isDark ? Colors.dark.accent : Colors.light.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  activeBorder: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: isDark ? Colors.dark.accent : Colors.light.accent,
  },
  title: {
    color: isDark ? Colors.dark.text : Colors.light.text,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  imageStyle: {
    borderRadius: 30,
  },
  overlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
});