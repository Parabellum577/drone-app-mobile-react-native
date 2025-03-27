import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING } from '../../constants/theme';
import { ServiceCategory, CATEGORY_DESCRIPTIONS } from '../../types/service';

interface CategorySelectorProps {
  value: ServiceCategory;
  onChange: (category: ServiceCategory) => void;
  error?: boolean;
  errorText?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  error,
  errorText,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const categoryLabels = {
    [ServiceCategory.SERVICE]: 'Service',
    [ServiceCategory.EVENT]: 'Event',
    [ServiceCategory.COURSE]: 'Course',
  };

  const categoryIcons = {
    [ServiceCategory.SERVICE]: 'briefcase-outline',
    [ServiceCategory.EVENT]: 'calendar-star',
    [ServiceCategory.COURSE]: 'school-outline',
  };

  const handleSelect = (category: ServiceCategory) => {
    onChange(category);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, error && styles.containerError]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.valueContainer}>
          <Icon name={categoryIcons[value]} size={20} color={COLORS.primary} style={{marginRight: SPACING.sm}}/>
          <Text style={styles.value}>{categoryLabels[value]}</Text>
        </View>
        <Icon name="chevron-down" size={20} color={COLORS.textSecondary}/>
      </TouchableOpacity>

      {error && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select category</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {Object.values(ServiceCategory).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    value === category && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleSelect(category)}
                >
                  <View style={styles.categoryHeader}>
                    <Icon name={categoryIcons[category]} size={24} color={value === category ? COLORS.primary : COLORS.text} />
                    <Text style={[
                      styles.categoryLabel,
                      value === category && styles.categoryLabelSelected,
                    ]}>
                      {categoryLabels[category]}
                    </Text>
                  </View>
                  <Text style={styles.categoryDescription}>
                    {CATEGORY_DESCRIPTIONS[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  containerError: {
    borderColor: COLORS.error,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  categoryItem: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 120, 255, 0.05)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryLabelSelected: {
    color: COLORS.primary,
  },
  categoryDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
}); 