import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface ImageUploadResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  type: string;
}

export interface ImageUploadOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
  mediaTypes?: ImagePicker.MediaTypeOptions;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please enable photo library access in your device settings to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return false;
  }
}

/**
 * Take a photo using the camera
 */
export async function takePhoto(options: ImageUploadOptions = {}): Promise<ImageUploadResult | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [1, 1],
      quality: options.quality ?? 0.8,
      base64: options.base64 ?? false,
      mediaTypes: options.mediaTypes ?? ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      base64: asset.base64,
      width: asset.width,
      height: asset.height,
      type: asset.type || 'image',
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo. Please try again.');
    return null;
  }
}

/**
 * Pick an image from the photo library
 */
export async function pickImage(options: ImageUploadOptions = {}): Promise<ImageUploadResult | null> {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [1, 1],
      quality: options.quality ?? 0.8,
      base64: options.base64 ?? false,
      mediaTypes: options.mediaTypes ?? ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      base64: asset.base64,
      width: asset.width,
      height: asset.height,
      type: asset.type || 'image',
    };
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to select image. Please try again.');
    return null;
  }
}

/**
 * Show action sheet to choose between camera and photo library
 */
export async function chooseImageSource(options: ImageUploadOptions = {}): Promise<ImageUploadResult | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Choose Photo',
      'Select a photo source',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await takePhoto(options);
            resolve(result);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await pickImage(options);
            resolve(result);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}

/**
 * Upload image to server (placeholder - implement with your backend)
 */
export async function uploadImageToServer(imageUri: string): Promise<string> {
  try {
    // TODO: Implement actual upload to your backend
    // For now, return the local URI
    // In production, you would upload to your server and return the URL
    
    // Example implementation:
    // const formData = new FormData();
    // formData.append('image', {
    //   uri: imageUri,
    //   type: 'image/jpeg',
    //   name: 'photo.jpg',
    // } as any);
    
    // const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    
    // const data = await response.json();
    // return data.url;
    
    // For now, return the local URI
    return imageUri;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}
