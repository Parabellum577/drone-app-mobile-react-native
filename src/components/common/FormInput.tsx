import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export type Props = TextInputProps & {
  error?: boolean;
  valid?: boolean;
  errorText?: string;
};

export const FormInput: React.FC<Props> = ({ error, valid, style, errorText, ...props }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          valid && styles.inputValid,
          style,
        ]}
        placeholderTextColor={COLORS.textSecondary}
        {...props}
      />
      {error && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputValid: {
    borderColor: COLORS.success,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: SPACING.xs,
  },
}); 