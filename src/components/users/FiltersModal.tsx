import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationInput } from '../common/LocationInput';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: UserFilters) => void;
  initialFilters: {
    location?: string;
  };
};

export type UserFilters = {
  location?: string;
}

const FiltersModal: React.FC<Props> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [location, setLocation] = useState(initialFilters.location || '');

  const handleApply = () => {
    onApply({
      location: location || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setLocation('');
    onApply({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>Filters</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filters}>
              <View style={styles.field}>
                <Text style={styles.label}>Location</Text>
                <LocationInput
                  value={location}
                  onLocationSelect={(loc) => {
                    setLocation(loc);
                  }}
                  placeholder="Enter location"
                />
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.button, styles.resetButton]} 
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.applyButton]} 
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  safeArea: {
    paddingTop: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  filters: {
    paddingHorizontal: SPACING.lg,
  },
  field: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 16,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xl,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.background,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  resetButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FiltersModal; 