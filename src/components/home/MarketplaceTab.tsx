import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING } from "../../constants/theme";
import productService from "../../services/product.service";
import { Product, ProductCategory } from "../../types/product";
import ProductCard from "../products/ProductCard";
import SearchHeader from "../common/SearchHeader";
import FiltersModal from "../products/FiltersModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreateButton } from "../common/CreateButton";

type NavigationType = NavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "Main">;

const MarketplaceTab: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const route = useRoute<RouteType>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 0,
    category: undefined as ProductCategory | undefined,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 10,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  const handleAuthError = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const fetchProducts = async (isRefresh = false) => {
    try {
      setError(null);
      
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const offset = isRefresh ? 0 : pagination.offset;

      const response = await productService.getProducts({
        searchQuery: searchQuery,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        category: filters.category,
        limit: pagination.limit,
        offset: offset,
      });

      setPagination({
        total: response.total,
        offset: offset + response.items.length,
        limit: pagination.limit
      });

      if (isRefresh) {
        setProducts(response.items);
      } else {
        setProducts(prev => [...prev, ...response.items]);
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError("Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    if (pagination.offset >= pagination.total) return;
    fetchProducts(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  const handleCreateProduct = () => {
    navigation.navigate("CreateProduct");
  };

  const navigateToProductDetails = (product: Product) => {
    navigation.navigate("ProductDetails", {
      productId: product.productId,
    });
  };

  const handleApplyFilters = (newFilters: {
    minPrice?: number;
    maxPrice?: number;
    category?: ProductCategory;
  }) => {
    setFilters({
      minPrice: newFilters.minPrice || 0,
      maxPrice: newFilters.maxPrice || 0,
      category: newFilters.category || undefined,
    });
    setFiltersVisible(false);
    
    // Reset pagination and trigger a refresh
    setPagination({
      total: 0,
      offset: 0,
      limit: pagination.limit
    });
    setProducts([]);
    setTimeout(() => {
      fetchProducts(true);
    }, 0);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset pagination when search changes
      setPagination({
        total: 0,
        offset: 0,
        limit: pagination.limit
      });
      setProducts([]);
      fetchProducts(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const params = route.params?.params;
    if (params?.newProduct && !Array.isArray(params.newProduct)) {
      setProducts((prev) => [params.newProduct as Product, ...prev]);
      navigation.setParams({
        params: { newProduct: undefined }
      });
    }
  }, [route.params]);

  useEffect(() => {
    fetchProducts(true);
  }, []);

  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchHeader
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products"
        showFilters
        onFiltersPress={() => setFiltersVisible(true)}
      />
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={navigateToProductDetails}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />

      <CreateButton onPress={handleCreateProduct} />
      
      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  list: {
    padding: SPACING.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
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
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.sm,
  },
  loadingMoreText: {
    color: COLORS.textSecondary,
  },
});

export default MarketplaceTab; 