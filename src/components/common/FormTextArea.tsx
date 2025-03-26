import React from 'react';
import { FormInput } from './FormInput';
import { StyleSheet } from 'react-native';

export const FormTextArea: React.FC<React.ComponentProps<typeof FormInput>> = (props) => {
  return (
    <FormInput
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      style={styles.textArea}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
}); 