import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface ServiceDescriptionProps {
  description: string;
}

const ServiceDescription: React.FC<ServiceDescriptionProps> = ({ description }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
});

export default ServiceDescription; 