import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Service } from '../../types/profile';
import { COLORS, SPACING } from '../../constants/theme';

interface ServicesTabProps {
  services: Service[];
  onServicePress: (service: Service) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ services, onServicePress }) => {
  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.serviceCard} 
      onPress={() => onServicePress(item)}
    >
      <Text style={styles.serviceTitle}>{item.title}</Text>
      <Text style={styles.serviceDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.rating}>⭐️ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={services}
      renderItem={renderService}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  rating: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default ServicesTab; 