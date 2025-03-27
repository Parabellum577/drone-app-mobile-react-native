import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Service } from '../../services/service.service';
import { PriceDisplay } from '../PriceDisplay';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ServiceCategory } from '../../types/service';

type Props = {
  service: Service;
  onPress: () => void;
};

const ServiceCard: React.FC<Props> = ({ service, onPress }) => {
  const categoryIcons = {
    [ServiceCategory.SERVICE]: 'briefcase-outline',
    [ServiceCategory.EVENT]: 'calendar-star',
    [ServiceCategory.COURSE]: 'school-outline',
  };

  const categoryLabels = {
    [ServiceCategory.SERVICE]: 'Service',
    [ServiceCategory.EVENT]: 'Event',
    [ServiceCategory.COURSE]: 'Course',
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {service.image && (
        <Image 
          source={{ uri: service.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{service.title}</Text>
          {service.category && (
            <View style={styles.categoryBadge}>
              <Icon name={categoryIcons[service.category]} size={14} color={COLORS.primary} />
              <Text style={styles.categoryLabel}>{categoryLabels[service.category]}</Text>
            </View>
          )}
        </View>
        <Text 
          style={styles.description}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {service.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.location}>
            <Icon name="map-marker" size={16} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{service.location}</Text>
          </View>
          <PriceDisplay 
            price={service.price}
            currency={service.currency}
            style={styles.price}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 120, 255, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: SPACING.xs,
    gap: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ServiceCard; 