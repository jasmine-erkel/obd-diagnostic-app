import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform} from 'react-native';
import {launchCamera, launchImageLibrary, ImagePickerResponse} from 'react-native-image-picker';
import {colors, spacing, typography, borderRadius, shadows} from '../../constants/theme';

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  currentImage?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({onImageSelected, currentImage}) => {
  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (result.assets && result.assets[0]?.uri) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0]?.uri) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  return (
    <View style={styles.container}>
      {currentImage && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Current Photo</Text>
          <Image source={{uri: currentImage}} style={styles.preview} resizeMode="cover" />
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto} activeOpacity={0.7}>
          <View style={styles.buttonIcon}>
            <Text style={styles.buttonIconText}>📷</Text>
          </View>
          <Text style={styles.buttonTitle}>Take Photo</Text>
          <Text style={styles.buttonSubtitle}>Use camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleChooseFromLibrary}
          activeOpacity={0.7}>
          <View style={styles.buttonIcon}>
            <Text style={styles.buttonIconText}>🖼️</Text>
          </View>
          <Text style={styles.buttonTitle}>Choose from Library</Text>
          <Text style={styles.buttonSubtitle}>Select existing photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    marginBottom: spacing.lg,
  },
  previewLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  buttonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buttonIconText: {
    fontSize: 32,
  },
  buttonTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  buttonSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
