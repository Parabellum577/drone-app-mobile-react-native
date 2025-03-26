import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FormInput } from '../common/FormInput';
import { COLORS, SPACING } from '../../constants/theme';
import authService from '../../services/auth.service';
import debounce from 'lodash/debounce';

export type StepOneData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type Props = {
  onSubmit: (data: StepOneData) => void;
};

export const StepOneForm: React.FC<Props> = ({ onSubmit }) => {
  const { control, handleSubmit, setError, getValues } = useForm<StepOneData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const checkEmailDebounced = useMemo(
    () => debounce(async (value: string) => {
      try {
        const isAvailable = await authService.checkEmail(value);
        if (!isAvailable) {
          setError('email', { message: 'This email is already taken' });
        }
      } catch (err) {
        console.error('Error checking email:', err);
      }
    }, 500),
    []
  );

  return (
    <>
      <View style={styles.formField}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            validate: {
              format: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) || 'Invalid email format';
              },
              available: async (value) => {
                try {
                  const isAvailable = await authService.checkEmail(value);
                  return isAvailable || 'This email is already taken';
                } catch (err) {
                  return true;
                }
              },
            },
          }}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error, invalid },
          }) => (
            <FormInput
              placeholder="Email"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (text.length > 3) {
                  checkEmailDebounced(text);
                }
              }}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
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
          name="password"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          }}
          render={({
            field: { onChange, value },
            fieldState: { error, invalid },
          }) => (
            <FormInput
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={!!error}
              valid={!invalid && value !== ''}
            />
          )}
        />
      </View>

      <View style={styles.formField}>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Please confirm your password',
            validate: (value) =>
              value === getValues('password') || 'Passwords do not match',
          }}
          render={({
            field: { onChange, value },
            fieldState: { error, invalid },
          }) => (
            <FormInput
              placeholder="Confirm Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={!!error}
              valid={!invalid && value !== ''}
            />
          )}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Next</Text>
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
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 