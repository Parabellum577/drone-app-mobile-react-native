import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FormInput } from '../common/FormInput';
import { LocationInput } from '../common/LocationInput';
import { COLORS, SPACING } from '../../constants/theme';
import authService from '../../services/auth.service';
import debounce from 'lodash/debounce';

export type StepTwoData = {
  username: string;
  fullName: string;
  location: string;
};

type Props = {
  onSubmit: (data: StepTwoData) => void;
  onBack: () => void;
  loading?: boolean;
};

export const StepTwoForm: React.FC<Props> = ({ onSubmit, onBack, loading }) => {
  const { control, handleSubmit, setError } = useForm<StepTwoData>({
    defaultValues: {
      username: '',
      fullName: '',
      location: '',
    },
    mode: 'onChange',
  });

  const checkUsernameDebounced = useMemo(
    () => debounce(async (value: string) => {
      try {
        const isAvailable = await authService.checkUsername(value);
        if (!isAvailable) {
          setError('username', { message: 'This username is already taken' });
        }
      } catch (err) {
        console.error('Error checking username:', err);
      }
    }, 500),
    []
  );

  return (
    <>
      <View style={styles.formField}>
        <Controller
          control={control}
          name="fullName"
          rules={{ required: 'Full name is required' }}
          render={({
            field: { onChange, value },
            fieldState: { error, invalid, isDirty },
          }) => (
            <FormInput
              placeholder="Full Name"
              value={value}
              onChangeText={onChange}
              error={!!error}
              valid={!invalid && isDirty && value !== ''}
            />
          )}
        />
      </View>

      <View style={styles.formField}>
        <Controller
          control={control}
          name="username"
          rules={{
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters',
            },
            validate: async (value) => {
              try {
                const isAvailable = await authService.checkUsername(value);
                return isAvailable || 'This username is already taken';
              } catch (err) {
                return true;
              }
            },
          }}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error, invalid },
          }) => (
            <FormInput
              placeholder="Username"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (text.length > 2) {
                  checkUsernameDebounced(text);
                }
              }}
              onBlur={onBlur}
              autoCapitalize="none"
              error={!!error}
              valid={!invalid && value !== ''}
              errorText={error?.message}
            />
          )}
        />
      </View>

      <View style={styles.formField}>
        <Controller
          control={control}
          name="location"
          rules={{ required: 'Location is required' }}
          render={({ 
            field: { onChange, value },
            fieldState: { error, invalid, isDirty }
          }) => (
            <LocationInput
              value={value}
              onLocationSelect={onChange}
              placeholder="Enter your location"
            />
          )}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  formField: {
    marginBottom: SPACING.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: COLORS.textSecondary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 