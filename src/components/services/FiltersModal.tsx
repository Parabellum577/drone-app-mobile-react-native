import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../constants/theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LocationInput } from "../common/LocationInput";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { ServiceCategory } from "../../types/service";

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ServiceFilters) => void;
  initialFilters: ServiceFilters;
};

export type ServiceFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: ServiceCategory;
}
const MIN_PRICE = 0;
const MAX_PRICE = 1000;

const FiltersModal: React.FC<Props> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [location, setLocation] = useState(initialFilters.location || "");
  const [priceRange, setPriceRange] = useState([
    initialFilters.minPrice || MIN_PRICE,
    initialFilters.maxPrice || MAX_PRICE,
  ]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(
    initialFilters.category || null
  );

  const categoryOptions = [
    { label: 'All', value: null },
    { label: 'Services', value: ServiceCategory.SERVICE },
    { label: 'Events', value: ServiceCategory.EVENT },
    { label: 'Courses', value: ServiceCategory.COURSE },
  ];

  const handleApply = () => {
    onApply({
      location: location || undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      category: selectedCategory || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setLocation("");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedCategory(null);
    onApply({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>Filters</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filters}>
              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryButtonsContainer}>
                  {categoryOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value || 'all'}
                      style={[
                        styles.categoryButton,
                        selectedCategory === option.value && styles.selectedCategoryButton
                      ]}
                      onPress={() => setSelectedCategory(option.value)}
                    >
                      <Text 
                        style={[
                          styles.categoryButtonText,
                          selectedCategory === option.value && styles.selectedCategoryButtonText
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.field}>
                <Text style={styles.label}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <Text style={styles.priceText}>${priceRange[0]}</Text>
                  <View style={styles.sliderWrapper}>
                    <MultiSlider
                      values={priceRange}
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={10}
                      sliderLength={220}
                      onValuesChange={setPriceRange}
                      selectedStyle={styles.selectedTrack}
                      unselectedStyle={styles.unselectedTrack}
                      containerStyle={styles.sliderContainer}
                      markerStyle={styles.marker}
                      markerContainerStyle={styles.markerContainer}
                    />
                  </View>
                  <Text style={styles.priceText}>${priceRange[1]}</Text>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Location</Text>
                <LocationInput
                  value={location}
                  onLocationSelect={setLocation}
                  placeholder="Enter location"
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  safeArea: {
    paddingTop: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
  },
  filters: {
    paddingHorizontal: SPACING.lg,
  },
  field: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'white',
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  sliderContainer: {
    height: 50,
  },
  selectedTrack: {
    backgroundColor: COLORS.primary,
    height: 3,
  },
  unselectedTrack: {
    backgroundColor: COLORS.border,
    height: 3,
  },
  markerContainer: {
    marginTop: 4,
  },
  marker: {
    backgroundColor: COLORS.primary,
    borderColor: "white",
    borderWidth: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  priceText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 16,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xl,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: COLORS.background,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  resetButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FiltersModal;
