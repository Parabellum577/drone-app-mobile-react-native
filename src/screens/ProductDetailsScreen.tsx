import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SPACING } from "../constants/theme";
import type { RootStackParamList } from "../types/navigation";
import productService from "../services/product.service";
import userService from "../services/user.service";
import { Product } from "../types/product";
import { User } from "../services/user.service";
import { AuthContext } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PriceDisplay } from "../components/common/PriceDisplay";

type ProductDetailsRouteProp = RouteProp<RootStackParamList, "ProductDetails">;
type NavigationType = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=random";

const ProductDetailsScreen: React.FC = () => {
  const route = useRoute<ProductDetailsRouteProp>();
  const navigation = useNavigation<NavigationType>();
  const { productId } = route.params;
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAuthError = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductById(productId);
      setProduct(data);
      
      if (data.created_by) {
        fetchCreatorInfo(data.created_by);
      }

      // Fetch current user info
      try {
        const userData = await userService.getCurrentUserProfile();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError(err?.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorInfo = async (userId: string) => {
    try {
      const userInfo = await userService.getUserProfile(userId);
      setCreatorInfo(userInfo);
    } catch (err) {
      console.error("Error fetching creator info:", err);
    }
  };

  const navigateToCreatorProfile = () => {
    if (creatorInfo) {
      navigation.navigate("UserProfile", {
        userId: creatorInfo.id,
        username: creatorInfo.username || "User",
      });
    }
  };

  const handleEditProduct = () => {
    if (product) {
      navigation.navigate("CreateProduct", {
        productId: product.id,
        mode: "edit",
      });
    }
  };

  const handleContactSeller = () => {
    if (creatorInfo) {
      // In a real app, this would navigate to a chat with the seller
      Alert.alert(
        "Contact Seller",
        `Would you like to contact ${creatorInfo.fullName || creatorInfo.username}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Contact",
            onPress: () => {
              // Navigate to chat or other contact method
              navigation.navigate("Inbox");
            },
          },
        ]
      );
    }
  };

  const getAvatarUrl = (user: User) => {
    if (user.avatar) return user.avatar;

    let initials;
    try {
      initials = (user.fullName || user.username)
        .trim()
        .split(/\s+/)
        .map((n) => n[0] || "")
        .join("");
      if (!initials) {
        initials = user.username.slice(0, 2).toUpperCase();
      }
      if (!initials) {
        initials = "US";
      }
    } catch (e) {
      initials = "US";
    }

    return `${DEFAULT_AVATAR}&name=${encodeURIComponent(initials)}`;
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

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  useEffect(() => {
    if (product) {
      navigation.setOptions({
        title: product.title,
      });
    }
  }, [product, navigation]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Product not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProductData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnProduct = currentUser?.id === product.created_by;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Images Carousel */}
        <View style={styles.imageCarousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const contentOffset = e.nativeEvent.contentOffset;
              const viewSize = width;
              const index = Math.floor(contentOffset.x / viewSize);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {product.images.length > 0 ? (
              product.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={[styles.productImage, { width }]}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[styles.noImage, { width }]}>
                <Icon name="image-off" size={48} color={COLORS.textSecondary} />
                <Text style={styles.noImageText}>No image available</Text>
              </View>
            )}
          </ScrollView>
          {product.images.length > 1 && (
            <View style={styles.pagination}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          {/* Title and Price */}
          <View style={styles.header}>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.priceContainer}>
              <PriceDisplay 
                price={product.price} 
                currency={product.currency}
                size="large"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>
              {getCategoryLabel(product.category)}
            </Text>
          </View>

          {/* Seller Info */}
          {creatorInfo && (
            <TouchableOpacity
              style={styles.sellerContainer}
              onPress={navigateToCreatorProfile}
            >
              <Image
                source={{ uri: getAvatarUrl(creatorInfo) }}
                style={styles.sellerAvatar}
              />
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>
                  {creatorInfo.fullName || creatorInfo.username}
                </Text>
                <Text style={styles.sellerRole}>Seller</Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isOwnProduct ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProduct}
          >
            <Icon name="pencil" size={20} color="white" />
            <Text style={styles.buttonText}>Edit Product</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSeller}
          >
            <Icon name="message" size={20} color="white" />
            <Text style={styles.buttonText}>Contact Seller</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
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
  imageCarousel: {
    position: "relative",
  },
  productImage: {
    height: 300,
  },
  noImage: {
    height: 300,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: SPACING.md,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "white",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailsContainer: {
    padding: SPACING.lg,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryLabel: {
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    color: COLORS.primary,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  sellerRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  actionButtons: {
    padding: SPACING.md,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: SPACING.xs,
  },
});

export default ProductDetailsScreen; 