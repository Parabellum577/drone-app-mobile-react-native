import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Currency } from '../../types/service';

type Props = {
  price: number;
  currency: Currency;
  size?: 'small' | 'medium' | 'large';
};

export const PriceDisplay: React.FC<Props> = ({ 
  price, 
  currency, 
  size = 'medium' 
}) => {
  const isFree = price === 0;
  
  const getFontSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 18;
      default: return 14;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.price, 
          isFree ? styles.freePrice : {}, 
          { fontSize: getFontSize() }
        ]}
      >
        {isFree ? 'Free' : `${price.toFixed(2)} ${currency}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
  },
  freePrice: {
    color: COLORS.primary,
  },
}); 