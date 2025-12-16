import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import {colors, spacing, typography, borderRadius, shadows} from '../../constants/theme';

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  currentImage?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  currentImage,
}) => {
  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to pick image');
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const uri = response.assets[0].uri;
      if (uri) {
        onImageSelected(uri);
      }
    }
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      saveToPhotos: false,
    };

    launchCamera(options, handleImageResponse);
  };

  const handleChooseFromLibrary = () => {
    const options = {
      mediaType: 'photo' as MediaType,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImagePress = () => {
    Alert.alert(
      'Change Photo',
      'Choose how to update the vehicle photo',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handleChooseFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vehicle Photo (Optional)</Text>

      {currentImage ? (
        <TouchableOpacity
          style={styles.imagePreviewContainer}
          onPress={handleImagePress}
          activeOpacity={0.8}>
          <Image source={{uri: currentImage}} style={styles.imagePreview} />
          <View style={styles.changePhotoOverlay}>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTakePhoto}
            activeOpacity={0.7}>
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleChooseFromLibrary}
            activeOpacity={0.7}>
            <Text style={styles.buttonIcon}>🖼️</Text>
            <Text style={styles.buttonText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background,
    ...shadows.md,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.surface,
  },
});
