import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {VehiclesStackParamList} from '../navigation/types';
import {useVehicles} from '../context/VehicleContext';
import {Vehicle, VehicleFormData} from '../types/vehicle';
import {generateUUID} from '../utils/uuid';
import {validateVehicleForm, hasErrors, ValidationErrors} from '../utils/validation';
import {Input} from '../components/common/Input';
import {Button} from '../components/common/Button';
import {colors, spacing, typography, borderRadius} from '../constants/theme';

type AddVehicleScreenNavigationProp = NativeStackNavigationProp<VehiclesStackParamList, 'AddVehicle'>;

interface AddVehicleScreenProps {
  navigation: AddVehicleScreenNavigationProp;
}

export const AddVehicleScreen: React.FC<AddVehicleScreenProps> = ({navigation}) => {
  const {addVehicle} = useVehicles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: '',
    vin: '',
    nickname: '',
    color: '',
    mileage: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const validationErrors = validateVehicleForm(formData);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const now = new Date().toISOString();
      const vehicle: Vehicle = {
        id: generateUUID(),
        make: formData.make?.trim() || 'Unknown',
        model: formData.model?.trim() || 'Unknown',
        year: formData.year ? parseInt(formData.year, 10) : new Date().getFullYear(),
        vin: formData.vin?.trim().toUpperCase() || 'N/A',
        nickname: formData.nickname?.trim() || undefined,
        color: formData.color?.trim() || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage, 10) : undefined,
        createdAt: now,
        updatedAt: now,
      };

      const success = await addVehicle(vehicle);

      if (success) {
        Alert.alert('Success', 'Vehicle added successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to add vehicle. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Error adding vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Add New Vehicle</Text>
          <Text style={styles.subtitle}>Enter your vehicle's information</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Providing complete information helps our AI give you more accurate diagnostics and recommendations.
            </Text>
          </View>

          <Input
            label="Make (Optional)"
            value={formData.make}
            onChangeText={value => handleInputChange('make', value)}
            placeholder="e.g., Toyota, Ford, Honda"
            error={errors.make}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Input
            label="Model (Optional)"
            value={formData.model}
            onChangeText={value => handleInputChange('model', value)}
            placeholder="e.g., Camry, F-150, Civic"
            error={errors.model}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Input
            label="Year (Optional)"
            value={formData.year}
            onChangeText={value => handleInputChange('year', value)}
            placeholder="e.g., 2020"
            error={errors.year}
            keyboardType="numeric"
            returnKeyType="next"
          />

          <Input
            label="VIN (Optional)"
            value={formData.vin}
            onChangeText={value => handleInputChange('vin', value.toUpperCase())}
            placeholder="17-character VIN"
            error={errors.vin}
            autoCapitalize="characters"
            maxLength={17}
            returnKeyType="next"
          />

          <Input
            label="Nickname (Optional)"
            value={formData.nickname}
            onChangeText={value => handleInputChange('nickname', value)}
            placeholder="e.g., My Daily Driver"
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Input
            label="Color (Optional)"
            value={formData.color}
            onChangeText={value => handleInputChange('color', value)}
            placeholder="e.g., Blue, Red, Silver"
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Input
            label="Mileage (Optional)"
            value={formData.mileage}
            onChangeText={value => handleInputChange('mileage', value)}
            placeholder="e.g., 50000"
            error={errors.mileage}
            keyboardType="numeric"
            returnKeyType="done"
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Add Vehicle"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
