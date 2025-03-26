import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING } from '../constants/theme';
import serviceService from '../services/service.service';
import { Currency } from '../types/service';
import { FormInput } from '../components/common/FormInput';
import { FormTextArea } from '../components/common/FormTextArea';
import { LocationInput } from '../components/common/LocationInput';

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

const CURRENCIES = [Currency.USD, Currency.EUR, Currency.PLN];

const CreateServiceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(Currency.USD);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: Currency.EUR,
    image: '',
    location: '',
  });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || (!isFree && !form.price.trim()) || !form.image.trim() || !form.location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newService = await serviceService.createService({
        ...form,
        price: isFree ? '0' : form.price,
      });
      
      navigation.navigate('Main', {
        screen: 'Services',
        params: { newService }
      });
    } catch (err) {
      console.error('Error creating service:', err);
      Alert.alert('Error', 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <FormInput
              value={form.title}
              onChangeText={(value) => updateForm('title', value)}
              placeholder="Enter service title"
            />
          </View>

          <View style={[styles.field, styles.locationField]}>
            <Text style={styles.label}>Location</Text>
            <LocationInput
              value={form.location}
              onLocationSelect={(location) => updateForm('location', location)}
              listPosition="absolute"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <FormTextArea
              value={form.description}
              onChangeText={(value) => updateForm('description', value)}
              placeholder="Enter service description"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.priceHeader}>
              <Text style={styles.label}>Price</Text>
              <View style={styles.freeSwitch}>
                <Text style={styles.switchLabel}>Free</Text>
                <Switch
                  value={isFree}
                  onValueChange={setIsFree}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              </View>
            </View>
            <View style={styles.priceContainer}>
              <TextInput
                style={[styles.input, styles.priceInput, isFree && styles.disabled]}
                value={form.price}
                onChangeText={(value) => updateForm('price', value)}
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
                editable={!isFree}
              />
              <View style={styles.currencyContainer}>
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyButton,
                      form.currency === curr && styles.currencyButtonActive,
                      isFree && styles.disabled
                    ]}
                    onPress={() => !isFree && setForm(prev => ({ ...prev, currency: curr }))}
                    disabled={isFree}
                  >
                    <Text style={[
                      styles.currencyText,
                      form.currency === curr && styles.currencyTextActive,
                      isFree && styles.disabledText
                    ]}>
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={form.image}
              onChangeText={(value) => updateForm('image', value)}
              placeholder="Enter image URL (optional)"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Create Service</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  form: {
    gap: SPACING.md,
    position: 'relative',
  },
  field: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.sm + 2,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priceInput: {
    flex: 1,
  },
  currencyContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  currencyButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyButtonFirst: {
    borderLeftWidth: 0,
  },
  currencyButtonActive: {
    backgroundColor: COLORS.primary,
  },
  currencyButtonEnabled: {
    opacity: 1,
  },
  currencyText: {
    fontSize: 16,
    color: COLORS.text,
  },
  currencyTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.lg + 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  locationField: {
    zIndex: 1000,
    position: 'relative',
  },
});

export default CreateServiceScreen; 