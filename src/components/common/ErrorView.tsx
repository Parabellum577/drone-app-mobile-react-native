import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
});

export default ErrorView; 