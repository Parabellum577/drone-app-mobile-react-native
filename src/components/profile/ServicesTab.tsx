import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList, TabParamList } from "../../types/navigation";
import { COLORS, SPACING } from "../../constants/theme";
import serviceService, { Service } from "../../services/service.service";
import ServiceCard from "../home/ServiceCard";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = {
  userId: string;
  isOwnProfile: boolean;
  onServicePress: (service: Service) => void;
};

type NavigationType = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Profile">,
  NativeStackNavigationProp<RootStackParamList>
>;

const ServicesTab: React.FC<Props> = ({
  userId,
  isOwnProfile,
  onServicePress,
}) => {
  const navigation = useNavigation<NavigationType>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 10,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUserServices = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const data = await serviceService.getUserServices(userId);

      if (!data || !data.items) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // Get the offset for pagination
      const offset = isRefresh ? 0 : pagination.offset;
      const end = offset + pagination.limit;
      
      // Get a slice of items for the current page
      const paginatedData = data.items.slice(offset, end);

      // Update pagination data
      setPagination({
        total: data.total,
        offset: offset + paginatedData.length,
        limit: pagination.limit
      });

      // Update the services list
      if (isRefresh) {
        setServices(paginatedData);
      } else {
        setServices(prev => [...prev, ...paginatedData]);
      }
    } catch (error) {
      console.error("Error fetching user services:", error);
      setError("Failed to load services");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    if (pagination.offset >= pagination.total) return;
    fetchUserServices(false);
  };

  useEffect(() => {
    // Reset pagination when userId changes
    setPagination({
      total: 0,
      offset: 0,
      limit: 10
    });
    setServices([]);
    fetchUserServices(true);
  }, [userId]);

  if (loading && !services.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchUserServices(true)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!services.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No services yet</Text>
        {isOwnProfile && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              navigation.navigate("CreateService");
            }}
          >
            <Text style={styles.createButtonText}>Create Service</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={() => onServicePress(item)} />
        )}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
      
      {isOwnProfile && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate("CreateService")}
        >
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
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
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  loadingMoreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ServicesTab;
