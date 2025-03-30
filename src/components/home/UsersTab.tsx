import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING } from "../../constants/theme";
import userService, { User } from "../../services/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserCard from "./UserCard";
import SearchHeader from "../common/SearchHeader";
import FiltersModal, { UserFilters } from "../users/FiltersModal";
import debounce from "lodash/debounce";

type NavigationType = NavigationProp<RootStackParamList>;

const UsersTab: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    location: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 10,
  });

  const handleAuthError = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const fetchUsers = async (isRefresh = false, newFilters?: UserFilters) => {
    console.log("🚀 ~ fetchUsers")
    // Don't fetch if already loading
    if (loading && !isRefresh) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate the correct offset
      const offset = isRefresh ? 0 : pagination.offset;
      let updatedFilters = newFilters || filters;
      // Create request params
      const params = {
        limit: pagination.limit,
        offset,
        ...(searchQuery ? { searchParam: searchQuery } : {}),
        ...(updatedFilters.location
          ? { location: updatedFilters.location.trim() }
          : {}),
      };
      // Make a single API call
      const response = await userService.getUsers(params);

      // Update state with the results
      if (isRefresh) {
        setUsers(response.items);
      } else {
        setUsers((prev) => [...prev, ...response.items]);
      }

      setPagination({
        total: response.total,
        offset: offset + response.items.length,
        limit: pagination.limit,
      });
    } catch (err: any) {
      console.error("Error fetching users:", err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError("Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    // Only load more if not already loading and there are more items to load
    if (!loading && pagination.offset < pagination.total) {
      fetchUsers(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPagination((prev) => ({
      ...prev,
      offset: 0,
    }));
    fetchUsers(true);
  };

  const handleApplyFilters = (newFilters: UserFilters) => {
    // Update filters and reset pagination
    setFilters({
      location: newFilters.location?.trim() || "",
    });
    setPagination({
      total: 0,
      offset: 0,
      limit: pagination.limit,
    });
    setUsers([]);
    fetchUsers(true, newFilters);
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 600),
    [searchQuery]
  );

    useEffect(() => {
      setPagination({
        total: 0,
        offset: 0,
        limit: pagination.limit,
      });
      fetchUsers(true);
    }, [searchQuery]);

  if (loading && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchUsers(true)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchHeader
        value={searchQuery}
        onChangeText={debouncedSearch}
        placeholder="Search users"
        showFilters
        onFiltersPress={() => setFiltersVisible(true)}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No users found</Text>
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
          loading && users.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
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
  },
  searchContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  list: {
    padding: SPACING.md,
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
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
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
});

export default UsersTab;
