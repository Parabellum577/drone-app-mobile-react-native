import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING } from '../../constants/theme';
import userService, { User } from '../../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserCard from './UserCard';

type NavigationType = NavigationProp<RootStackParamList>;

type Props = {
  searchQuery: string;
};

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&size=200&length=2&bold=true&format=png&color=ffffff';

const UsersTab: React.FC<Props> = ({ searchQuery }) => {
  const navigation = useNavigation<NavigationType>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = async () => {
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const getAvatarUrl = (user: User) => {
    if (user.avatar) return user.avatar;
    
    let initials;
    try {
      initials = (user.fullName || user.username).trim().split(/\s+/).map(n => n[0] || '').join('');
      if (!initials) {
        initials = user.username.slice(0, 2).toUpperCase();
      }
      if (!initials) {
        initials = 'US';
      }
    } catch (e) {
      initials = 'US';
    }
    
    return `${DEFAULT_AVATAR}&name=${encodeURIComponent(initials)}`;
  };

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await userService.getUsers(
        searchQuery ? { searchParam: searchQuery } : undefined
      );
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: 'white',
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
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default UsersTab; 