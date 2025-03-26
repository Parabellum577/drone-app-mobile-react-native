import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING } from '../constants/theme';
import userService, { User } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

const UserProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId, name } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: name,
    });
  }, [name, navigation]);

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

  const fetchCurrentUser = async () => {
    try {
      const data = await userService.getCurrentUserProfile();
      setCurrentUser(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthError();
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      setError(null);
      const [userData, currentUserData] = await Promise.all([
        userService.getUserProfile(userId),
        userService.getCurrentUserProfile()
      ]);
      setUser(userData);
      setCurrentUser(currentUserData);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFollow = async () => {
    if (!user || followLoading) return;

    try {
      setFollowLoading(true);
      const response = await userService.followUser(userId);
      setUser(prevUser => ({
        ...prevUser!,
        ...response.user
      }));
      setCurrentUser(prevUser => ({
        ...prevUser!,
        ...response.follower
      }));
    } catch (err: any) {
      console.error('Error following user:', err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      Alert.alert('Error', 'Failed to follow user. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user || followLoading) return;

    try {
      setFollowLoading(true);
      const response = await userService.unfollowUser(userId);
      setUser(prevUser => ({
        ...prevUser!,
        ...response.user
      }));
      setCurrentUser(prevUser => ({
        ...prevUser!,
        ...response.follower
      }));
    } catch (err: any) {
      console.error('Error unfollowing user:', err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      Alert.alert('Error', 'Failed to unfollow user. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'User not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchUserProfile}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;
  const isFollowing = currentUser?.following?.includes(user.id) || false;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Image
          source={{ uri: getAvatarUrl(user) }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.fullName || user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.location && (
            <Text style={styles.location}>{user.location}</Text>
          )}
          
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {!isOwnProfile && (
          <TouchableOpacity 
            style={[
              styles.followButton,
              isFollowing && styles.unfollowButton
            ]}
            onPress={isFollowing ? handleUnfollow : handleFollow}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md,
  },
  userInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  bio: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  unfollowButton: {
    backgroundColor: COLORS.textSecondary,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
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
});

export default UserProfileScreen; 