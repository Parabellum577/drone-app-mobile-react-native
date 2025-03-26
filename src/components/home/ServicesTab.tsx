import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  provider: {
    name: string;
    avatar: string;
    location: string;
  };
  image: string;
}

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Event Aerial Photography',
    description: 'Professional drone photography for your events. Weddings, corporate events, sports competitions.',
    price: 'from $60/hour',
    rating: 4.8,
    provider: {
      name: 'Roman Litvin',
      avatar: 'https://images.unsplash.com/photo-1520409364224-63400afe26e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80',
      location: 'Poznan, Poland',
    },
    image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: '2',
    title: 'FPV Drone Pilot Training',
    description: 'Individual FPV drone piloting lessons. From basics to advanced tricks.',
    price: 'from $40/hour',
    rating: 5.0,
    provider: {
      name: 'Anna Peters',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80',
      location: 'New York, USA',
    },
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: '3',
    title: 'Drone Repair & Maintenance',
    description: 'Professional repair and maintenance of all types of drones. Quick turnaround time.',
    price: 'from $50/repair',
    rating: 4.9,
    provider: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80',
      location: 'San Francisco, USA',
    },
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
  },
];

const ServicesTab: React.FC = () => {
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`star-${i}`} name="star" size={16} color={COLORS.primary} />
        ))}
        {hasHalfStar && (
          <Icon name="star-half" size={16} color={COLORS.primary} />
        )}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity style={styles.serviceCard}>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <View style={styles.providerInfo}>
          <Image source={{ uri: item.provider.avatar }} style={styles.providerAvatar} />
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{item.provider.name}</Text>
            <Text style={styles.location}>{item.provider.location}</Text>
          </View>
          {renderRatingStars(item.rating)}
        </View>
        
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={mockServices}
      renderItem={renderServiceItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  serviceInfo: {
    padding: SPACING.md,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  providerDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default ServicesTab; 