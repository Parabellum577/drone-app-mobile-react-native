import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import type { RootStackParamList } from "../types/navigation";
import { COLORS, SPACING } from "../constants/theme";
import productService from "../services/product.service";
import { Currency } from "../types/service";
import { ProductCategory } from "../types/product";
import { FormInput } from "../components/common/FormInput";
import { FormTextArea } from "../components/common/FormTextArea";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

const CURRENCIES = [Currency.USD, Currency.EUR, Currency.PLN];

type FormField = {
  id: string;
  type:
    | "title"
    | "category"
    | "description"
    | "price"
    | "images";
  label: string;
};

const formFields: FormField[] = [
  { id: "title", type: "title", label: "Title" },
  { id: "category", type: "category", label: "Category" },
  { id: "description", type: "description", label: "Description" },
  { id: "images", type: "images", label: "Images" },
  { id: "price", type: "price", label: "Price" },
];

const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: Currency.EUR,
    images: [""],
    category: ProductCategory.DRONE,
  });

  useEffect(() => {
    const params = route.params as {
      productId?: string;
      mode?: "create" | "edit";
    };

    if (params?.productId && params?.mode === "edit") {
      setIsEditMode(true);
      loadProductData(params.productId);
    }
  }, [route.params]);

  const loadProductData = async (productId: string) => {
    try {
      setInitialLoading(true);
      const productData = await productService.getProductById(productId);

      if (productData) {
        setForm({
          title: productData.title || "",
          description: productData.description || "",
          price: productData.price ? productData.price.toString() : "0",
          currency: productData.currency || Currency.EUR,
          images: productData.images && productData.images.length > 0 
            ? productData.images 
            : [""],
          category: productData.category || ProductCategory.DRONE,
        });

        setIsFree(productData.price === 0);
      }
    } catch (error) {
      console.error("Error loading product data:", error);
      Alert.alert("Error", "Failed to load product data");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      (!isFree && !form.price.trim()) ||
      !form.images[0].trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Remove empty image URLs
    const images = form.images.filter(img => img.trim() !== "");
    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image URL");
      return;
    }

    try {
      setLoading(true);

      const productData = {
        ...form,
        price: isFree ? 0 : parseFloat(form.price),
        images,
      };

      let result;
      const params = route.params as {
        productId?: string;
        mode?: "create" | "edit";
      };

      if (isEditMode && params?.productId) {
        result = await productService.updateProduct(
          params.productId,
          productData
        );
        Alert.alert("Success", "Product updated successfully");
      } else {
        result = await productService.createProduct(productData);
        Alert.alert("Success", "Product created successfully");
      }

      navigation.navigate("Main", {
        screen: "Home",
        params: { newProduct: result }
      });
    } catch (err) {
      console.error(
        isEditMode ? "Error updating product:" : "Error creating product:",
        err
      );
      Alert.alert(
        "Error",
        isEditMode ? "Failed to update product" : "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...form.images];
    updatedImages[index] = value;
    
    // Add a new empty field if this is the last one and it's not empty
    if (index === updatedImages.length - 1 && value.trim() !== "") {
      updatedImages.push("");
    }
    
    // Remove empty fields in the middle (but keep at least one)
    const filteredImages = updatedImages.filter((img, i) => img.trim() !== "" || i === updatedImages.length - 1);
    
    updateForm("images", filteredImages);
  };

  const removeImage = (index: number) => {
    if (form.images.length <= 1) {
      updateForm("images", [""]);
      return;
    }
    
    const updatedImages = form.images.filter((_, i) => i !== index);
    updateForm("images", updatedImages);
  };

  const renderFormField = ({ item }: { item: FormField }) => {
    switch (item.type) {
      case "title":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <FormInput
              value={form.title}
              onChangeText={(value) => updateForm("title", value)}
              placeholder="Enter product title"
            />
          </View>
        );

      case "category":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {Object.values(ProductCategory).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    form.category === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => updateForm("category", category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      form.category === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {getCategoryLabel(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case "description":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <FormTextArea
              value={form.description}
              onChangeText={(value) => updateForm("description", value)}
              placeholder="Enter product description"
            />
          </View>
        );

      case "images":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            {form.images.map((image, index) => (
              <View key={index} style={styles.imageInputContainer}>
                <TextInput
                  style={styles.imageInput}
                  value={image}
                  onChangeText={(value) => handleImageChange(index, value)}
                  placeholder="Enter image URL"
                  placeholderTextColor={COLORS.textSecondary}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
            <Text style={styles.helperText}>
              Add multiple image URLs, one per line. First image will be the main product image.
            </Text>
          </View>
        );

      case "price":
        return (
          <View style={styles.field}>
            <View style={styles.priceHeader}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={styles.freeSwitch}>
                <Text style={styles.switchLabel}>Free</Text>
                <Switch
                  value={isFree}
                  onValueChange={setIsFree}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              </View>
            </View>
            <View style={styles.priceContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.priceInput,
                  isFree && styles.disabled,
                ]}
                value={form.price}
                onChangeText={(value) => updateForm("price", value)}
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
                editable={!isFree}
              />
              <View style={styles.currencyContainer}>
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyButton,
                      form.currency === curr && styles.currencyButtonActive,
                      isFree && styles.disabled,
                    ]}
                    onPress={() =>
                      !isFree &&
                      setForm((prev) => ({ ...prev, currency: curr }))
                    }
                    disabled={isFree}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        form.currency === curr && styles.currencyTextActive,
                        isFree && styles.disabledText,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'electronics':
        return 'Electronics';
      case 'drone':
        return 'Drone';
      case 'camera':
        return 'Camera';
      case 'drone_parts':
        return 'Drone Parts';
      case 'accessories':
        return 'Accessories';
      case 'software':
        return 'Software';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  return (
    <View style={styles.container}>
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading product data...</Text>
        </View>
      ) : (
        <>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            <FlatList
              data={formFields}
              renderItem={renderFormField}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              ListFooterComponent={<View style={styles.bottomPadding} />}
            />
          </KeyboardAvoidingView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditMode ? "Update Product" : "Create Product"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  field: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryContainer: {
    marginBottom: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: "white",
    borderRadius: 8,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryButtonTextActive: {
    color: "white",
  },
  imageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  imageInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeImageButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  freeSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  priceContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  priceInput: {
    flex: 1,
  },
  currencyContainer: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  currencyButton: {
    backgroundColor: "white",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 60,
    alignItems: "center",
  },
  currencyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  currencyText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  currencyTextActive: {
    color: "white",
  },
  disabled: {
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default CreateProductScreen; 