import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { ServiceCategory } from '../../types/service';

interface BookingButtonProps {
  category?: ServiceCategory;
  onPress: () => void;
}

const BookingButton: React.FC<BookingButtonProps> = ({ category, onPress }) => {
  const getButtonText = () => {
    switch (category) {
      case ServiceCategory.EVENT:
        return "Register";
      case ServiceCategory.COURSE:
        return "Enroll";
      default:
        return "Book Now";
    }
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.bookButton} onPress={onPress}>
        <Text style={styles.bookButtonText}>{getButtonText()}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "white",
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BookingButton; 