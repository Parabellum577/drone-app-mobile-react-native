import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Currency } from '../types/service';

type Props = {
  price: number;
  currency: Currency;
  style?: any;
};

export const PriceDisplay: React.FC<Props> = ({ price, currency, style }) => {
  if (price === 0) {
    return <Text style={[styles.price, style]}>Free</Text>;
  }
  
  return <Text style={[styles.price, style]}>{price} {currency}</Text>;
};

const styles = StyleSheet.create({
  price: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: '600',
  }
}); 