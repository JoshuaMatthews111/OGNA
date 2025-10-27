import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { churchInfo } from '@/constants/onboarding';
import Colors from '@/constants/colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export default function Logo({ size = 'medium', showText = true, style }: LogoProps) {
  const logoSize = {
    small: 40,
    medium: 60,
    large: 100,
  }[size];

  const textSize = {
    small: 12,
    medium: 16,
    large: 20,
  }[size];

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder for OGN Logo - using a styled circle with text for now */}
      <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
        <View style={[styles.logoCircle, { width: logoSize, height: logoSize }]}>
          <Text style={[styles.logoText, { fontSize: logoSize * 0.3 }]}>OGN</Text>
        </View>
      </View>
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.orgName, { fontSize: textSize }]}>
            {churchInfo.name}
          </Text>
          {size !== 'small' && (
            <Text style={[styles.tagline, { fontSize: textSize * 0.7 }]}>Global Network</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 8,
  },
  logoCircle: {
    backgroundColor: Colors.dark.accent,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E3A8A', // Blue border to match the logo theme
  },
  logoText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  orgName: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagline: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginTop: 2,
  },
});