import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING } from '../../constants/theme';
import { Service } from '../../services/service.service';
import { CATEGORY_DESCRIPTIONS, ServiceCategory } from '../../types/service';
import ActionButtons from './ActionButtons';

interface ServiceHeaderProps {
  service: Service;
  isCreator: boolean;
  onEdit: () => void;
  onShare: () => void;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  service,
  isCreator,
  onEdit,
  onShare,
}) => {
  const categoryIcons = {
    [ServiceCategory.SERVICE]: "briefcase-outline",
    [ServiceCategory.EVENT]: "calendar-star",
    [ServiceCategory.COURSE]: "school-outline",
  };

  const categoryLabels = {
    [ServiceCategory.SERVICE]: "Service",
    [ServiceCategory.EVENT]: "Event",
    [ServiceCategory.COURSE]: "Course",
  };

  return (
    <View>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: service.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <ActionButtons 
          isCreator={isCreator} 
          onEdit={onEdit} 
          onShare={onShare} 
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{service.title}</Text>
        {service.category && (
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Icon
                name={categoryIcons[service.category]}
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.categoryLabel}>
                {categoryLabels[service.category]}
              </Text>
            </View>
            <Text style={styles.categoryDescription}>
              {CATEGORY_DESCRIPTIONS[service.category]}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  categoryContainer: {
    marginTop: SPACING.xs,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 120, 255, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: SPACING.xs,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  categoryDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
});

export default ServiceHeader; 