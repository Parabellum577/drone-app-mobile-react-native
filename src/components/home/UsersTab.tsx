import React, { useEffect, useState } from "react";
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
import FiltersModal from "../users/FiltersModal";

type NavigationType = NavigationProp<RootStackParamList>;

const UsersTab: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
  });

  const handleAuthError = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const params: { searchParam?: string; location?: string } = {};

      if (searchQuery) {
        params.searchParam = searchQuery;
      }

      if (filters.location && filters.location.trim() !== "") {
        params.location = filters.location;
      }

      const data = await userService.getUsers(
        Object.keys(params).length > 0 ? params : undefined
      );
      setUsers(data);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleApplyFilters = (newFilters: { location?: string }) => {
    setFilters({
      location: newFilters.location?.trim() || "",
    });
    setFiltersVisible(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, filters.location]);

  if (loading && !users.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && !users.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchUsers()}
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
        onChangeText={setSearchQuery}
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
});

export default UsersTab;
