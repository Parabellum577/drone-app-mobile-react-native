import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING } from '../constants/theme';
import { AuthContext } from '../contexts/AuthContext';
import authService from '../services/auth.service';
import { useForm, Controller } from 'react-hook-form';
import { FormInput } from '../components/common/FormInput';

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

type LoginData = {
  email: string;
  password: string;
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const { checkAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setError } = useForm<LoginData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginData) => {
    try {
      setLoading(true);
      await authService.login(data);
      await checkAuth();
    } catch (error: any) {
      if (error?.response?.data?.field === 'email') {
        setError('email', { message: 'Invalid email' });
      } else if (error?.response?.data?.field === 'password') {
        setError('password', { message: 'Invalid password' });
      } else {
        setError('email', { message: 'Login failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <View style={styles.form}>
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
              },
            }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error, invalid },
            }) => (
              <FormInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
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
                errorText={error?.message}
              />
            )}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Registration')}
      >
        <Text style={styles.registerText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
    textAlign: 'center',
    color: COLORS.text,
  },
  form: {
    gap: SPACING.md,
  },
  formField: {
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

export default LoginScreen; 