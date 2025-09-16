import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { Product } from '../../types/product';
import { PriceDisplay } from '../PriceDisplay';

type Props = {
  product: Product;
  onPress: (product: Product) => void;
};

const DEFAULT_IMAGE = 'https://via.placeholder.com/150';

const ProductCard: React.FC<Props> = ({ product, onPress }) => {
  const getImageUrl = () => {
    if (!product.images || product.images.length === 0) {
      return DEFAULT_IMAGE;
    }
    return product.images[0];
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: getImageUrl() }} style={styles.image} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.categoryContainer}>
          <Text style={styles.category} numberOfLines={1}>
            {product.category}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <PriceDisplay price={product.price} currency={product.currency} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryContainer: {
    marginBottom: SPACING.xs,
  },
  category: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  location: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
});

export default ProductCard; 