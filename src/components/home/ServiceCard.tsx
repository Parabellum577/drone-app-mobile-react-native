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

type Props = {
  service: Service;
  onPress: () => void;
};

const ServiceCard: React.FC<Props> = ({ service, onPress }) => {
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
        <Text style={styles.title}>{service.title}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
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