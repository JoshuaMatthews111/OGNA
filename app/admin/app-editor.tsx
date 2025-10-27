import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Palette,
  Image as ImageIcon,
  Type,
  Settings as SettingsIcon,
  Download,
  Upload,
  RefreshCw,
  Edit3,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { useAppConfigStore, AppColors } from '@/store/appConfigStore';

export default function AppEditor() {
  const { colors } = useTheme();
  const { config, updateLightColors, updateDarkColors, updateBranding, updateImages, updateFeatures, resetToDefaults, exportConfig } = useAppConfigStore();
  const [activeTab, setActiveTab] = useState<'colors' | 'branding' | 'images' | 'features'>('colors');
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [showImageEditor, setShowImageEditor] = useState<boolean>(false);
  const [selectedImageType, setSelectedImageType] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');

  const currentColors = colorMode === 'light' ? config.lightColors : config.darkColors;

  const handleColorChange = (key: keyof AppColors, value: string) => {
    if (colorMode === 'light') {
      updateLightColors({ [key]: value });
    } else {
      updateDarkColors({ [key]: value });
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt for image generation');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://toolkit.rork.com/images/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: '1024x1024',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      const imageBase64 = `data:${data.image.mimeType};base64,${data.image.base64Data}`;
      setGeneratedImageUrl(imageBase64);
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyGeneratedImage = () => {
    if (generatedImageUrl) {
      updateImages({ [selectedImageType]: generatedImageUrl });
      setShowImageEditor(false);
      setGeneratedImageUrl('');
      setImagePrompt('');
      Alert.alert('Success', 'Image applied successfully!');
    }
  };

  const openImageEditor = (imageType: string) => {
    setSelectedImageType(imageType);
    setShowImageEditor(true);
  };

  const handleExportConfig = () => {
    const configData = exportConfig();
    Alert.alert(
      'Export Configuration',
      `Configuration exported successfully!\n\nLast Updated: ${new Date(configData.lastUpdated).toLocaleString()}`,
      [
        {
          text: 'OK',
          onPress: () => console.log('Config exported:', JSON.stringify(configData, null, 2)),
        },
      ]
    );
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'This will reset all customizations to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaults();
            Alert.alert('Success', 'App configuration reset to defaults!');
          },
        },
      ]
    );
  };

  const ColorInput = ({ label, colorKey }: { label: string; colorKey: keyof AppColors }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.colorInputRow}>
        <View style={[styles.colorPreview, { backgroundColor: currentColors[colorKey] }]} />
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={currentColors[colorKey]}
          onChangeText={(value) => handleColorChange(colorKey, value)}
          placeholder="#000000"
          placeholderTextColor={colors.subtext}
        />
      </View>
    </View>
  );

  const BrandingInput = ({ label, value, onChangeText }: { label: string; value: string; onChangeText: (text: string) => void }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.subtext}
      />
    </View>
  );

  const FeatureToggle = ({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) => (
    <View style={styles.featureRow}>
      <Text style={[styles.featureLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={value ? colors.accent : colors.subtext}
      />
    </View>
  );

  const ImageEditor = () => (
    <View style={[styles.imageEditorSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Image Generator</Text>
      <TextInput
        style={[styles.promptInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
        value={imagePrompt}
        onChangeText={setImagePrompt}
        placeholder="Describe the image you want to generate..."
        placeholderTextColor={colors.subtext}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: colors.accent }]}
        onPress={handleGenerateImage}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Sparkles size={20} color="#FFF" />
            <Text style={styles.generateButtonText}>Generate Image</Text>
          </>
        )}
      </TouchableOpacity>
      {generatedImageUrl && (
        <View style={styles.generatedImageContainer}>
          <Image source={{ uri: generatedImageUrl }} style={styles.generatedImage} />
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.success }]}
            onPress={handleApplyGeneratedImage}
          >
            <Text style={styles.applyButtonText}>Apply Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Master App Editor</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExportConfig} style={styles.iconButton}>
            <Download size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetToDefaults} style={styles.iconButton}>
            <RefreshCw size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'colors' as const, label: 'Colors', icon: Palette },
          { key: 'branding' as const, label: 'Branding', icon: Type },
          { key: 'images' as const, label: 'Images', icon: ImageIcon },
          { key: 'features' as const, label: 'Features', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && [styles.activeTab, { borderBottomColor: colors.accent }],
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon size={20} color={activeTab === tab.key ? colors.accent : colors.subtext} />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.key ? colors.accent : colors.subtext },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'colors' && (
          <View style={styles.section}>
            <View style={styles.colorModeToggle}>
              <TouchableOpacity
                style={[
                  styles.colorModeButton,
                  colorMode === 'light' && [styles.activeColorMode, { backgroundColor: colors.accent }],
                  { borderColor: colors.border },
                ]}
                onPress={() => setColorMode('light')}
              >
                <Text style={[styles.colorModeText, { color: colorMode === 'light' ? '#FFF' : colors.text }]}>
                  Light Mode
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.colorModeButton,
                  colorMode === 'dark' && [styles.activeColorMode, { backgroundColor: colors.accent }],
                  { borderColor: colors.border },
                ]}
                onPress={() => setColorMode('dark')}
              >
                <Text style={[styles.colorModeText, { color: colorMode === 'dark' ? '#FFF' : colors.text }]}>
                  Dark Mode
                </Text>
              </TouchableOpacity>
            </View>

            <ColorInput label="Primary Color" colorKey="primary" />
            <ColorInput label="Secondary Color" colorKey="secondary" />
            <ColorInput label="Accent Color" colorKey="accent" />
            <ColorInput label="Background Color" colorKey="background" />
            <ColorInput label="Card Color" colorKey="card" />
            <ColorInput label="Text Color" colorKey="text" />
            <ColorInput label="Subtext Color" colorKey="subtext" />
            <ColorInput label="Border Color" colorKey="border" />
            <ColorInput label="Error Color" colorKey="error" />
            <ColorInput label="Success Color" colorKey="success" />
            <ColorInput label="Warning Color" colorKey="warning" />
            <ColorInput label="Info Color" colorKey="info" />
            <ColorInput label="Accent Light Color" colorKey="accentLight" />
          </View>
        )}

        {activeTab === 'branding' && (
          <View style={styles.section}>
            <BrandingInput
              label="App Name"
              value={config.branding.appName}
              onChangeText={(text) => updateBranding({ appName: text })}
            />
            <BrandingInput
              label="Church Name"
              value={config.branding.churchName}
              onChangeText={(text) => updateBranding({ churchName: text })}
            />
            <BrandingInput
              label="Founder"
              value={config.branding.founder}
              onChangeText={(text) => updateBranding({ founder: text })}
            />
            <BrandingInput
              label="Mission"
              value={config.branding.mission}
              onChangeText={(text) => updateBranding({ mission: text })}
            />
            <BrandingInput
              label="Location"
              value={config.branding.location}
              onChangeText={(text) => updateBranding({ location: text })}
            />
            <BrandingInput
              label="Email"
              value={config.branding.email}
              onChangeText={(text) => updateBranding({ email: text })}
            />
            <BrandingInput
              label="Website"
              value={config.branding.website}
              onChangeText={(text) => updateBranding({ website: text })}
            />
            <BrandingInput
              label="Phone"
              value={config.branding.phone}
              onChangeText={(text) => updateBranding({ phone: text })}
            />
          </View>
        )}

        {activeTab === 'images' && (
          <View style={styles.section}>
            {[
              { label: 'Welcome Background', key: 'welcomeBackground' },
              { label: 'Home Hero Image', key: 'homeHeroImage' },
              { label: 'Explore Hero Image', key: 'exploreHeroImage' },
              { label: 'Community Hero Image', key: 'communityHeroImage' },
              { label: 'Giving Image', key: 'givingImage' },
              { label: 'Discipleship Image', key: 'discipleshipImage' },
            ].map((imageType) => (
              <View key={imageType.key} style={styles.imageRow}>
                <Text style={[styles.imageLabel, { color: colors.text }]}>{imageType.label}</Text>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.accent }]}
                  onPress={() => openImageEditor(imageType.key)}
                >
                  <Edit3 size={16} color="#FFF" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'features' && (
          <View style={styles.section}>
            <FeatureToggle
              label="Live Stream"
              value={config.features.enableLiveStream}
              onValueChange={(value) => updateFeatures({ enableLiveStream: value })}
            />
            <FeatureToggle
              label="Sermons"
              value={config.features.enableSermons}
              onValueChange={(value) => updateFeatures({ enableSermons: value })}
            />
            <FeatureToggle
              label="Events"
              value={config.features.enableEvents}
              onValueChange={(value) => updateFeatures({ enableEvents: value })}
            />
            <FeatureToggle
              label="Community"
              value={config.features.enableCommunity}
              onValueChange={(value) => updateFeatures({ enableCommunity: value })}
            />
            <FeatureToggle
              label="Giving"
              value={config.features.enableGiving}
              onValueChange={(value) => updateFeatures({ enableGiving: value })}
            />
            <FeatureToggle
              label="Discipleship"
              value={config.features.enableDiscipleship}
              onValueChange={(value) => updateFeatures({ enableDiscipleship: value })}
            />
            <FeatureToggle
              label="Shop"
              value={config.features.enableShop}
              onValueChange={(value) => updateFeatures({ enableShop: value })}
            />
            <FeatureToggle
              label="Music"
              value={config.features.enableMusic}
              onValueChange={(value) => updateFeatures({ enableMusic: value })}
            />
            <FeatureToggle
              label="Notifications"
              value={config.features.enableNotifications}
              onValueChange={(value) => updateFeatures({ enableNotifications: value })}
            />
          </View>
        )}
      </ScrollView>

      <Modal visible={showImageEditor} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Image</Text>
              <TouchableOpacity onPress={() => {
                setShowImageEditor(false);
                setGeneratedImageUrl('');
                setImagePrompt('');
              }}>
                <Text style={[styles.closeButton, { color: colors.accent }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <ImageEditor />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  colorModeToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  colorModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activeColorMode: {
    borderWidth: 0,
  },
  colorModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  featureLabel: {
    fontSize: 16,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  imageLabel: {
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  imageEditorSection: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  generatedImageContainer: {
    marginTop: 16,
  },
  generatedImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
