import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING } from '../../constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onFiltersPress?: () => void;
};

const SearchHeader: React.FC<Props> = ({ 
  value, 
  onChangeText, 
  placeholder = "Search",
  showFilters,
  onFiltersPress
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <View style={styles.searchButton}>
          <Icon name="magnify" size={24} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={COLORS.textSecondary}
          />
          {showFilters && (
            <TouchableOpacity onPress={onFiltersPress}>
              <Icon name="filter-variant" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    marginVertical: SPACING.sm,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
});

export default SearchHeader; 