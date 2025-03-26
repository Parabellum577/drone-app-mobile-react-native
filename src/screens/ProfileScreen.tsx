import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { TabScreenProps } from "../types/navigation";
import { COLORS, SPACING } from "../constants/theme";
import VideosTab from "../components/profile/VideosTab";
import ServicesTab from "../components/profile/ServicesTab";
import ProductsTab from "../components/profile/ProductsTab";
import userService, { User } from "../services/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../contexts/AuthContext";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Video } from "../types/profile";
import type { Service } from "../types/profile";
import type { Product } from "../types/profile";

type Props = TabScreenProps<"Profile">;
type TabType = "videos" | "services" | "products";

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&size=200&length=2&bold=true&format=png&color=ffffff';

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>("videos");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkAuth } = useContext(AuthContext);

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

  const fetchUserProfile = async () => {
    try {
      const data = await userService.getCurrentUserProfile();
      setUser(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      if (err?.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const mockVideos: Video[] = [];
  const mockServices: Service[] = [];
  const mockProducts: Product[] = [];

  const handleLogout = async () => {
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await checkAuth();
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Не удалось загрузить профиль</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchUserProfile}
        >
          <Text style={styles.retryText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "videos":
        return (
          <VideosTab
            videos={mockVideos}
            onVideoPress={(video) => console.log("Video pressed:", video)}
          />
        );
      case "services":
        return (
          <ServicesTab
            services={mockServices}
            onServicePress={(service) =>
              console.log("Service pressed:", service)
            }
          />
        );
      case "products":
        return (
          <ProductsTab
            products={mockProducts}
            onProductPress={(product) =>
              console.log("Product pressed:", product)
            }
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: getAvatarUrl(user) }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editButton}>
            <Text>Изменить</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.fullName || user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.location && (
            <Text style={styles.location}>{user.location}</Text>
          )}
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.followersCount}</Text>
              <Text style={styles.statLabel}>Подписчики</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.followingCount}</Text>
              <Text style={styles.statLabel}>Подписки</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "videos" && styles.activeTab]}
          onPress={() => setActiveTab("videos")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "videos" && styles.activeTabText,
            ]}
          >
            Видео
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "services" && styles.activeTab]}
          onPress={() => setActiveTab("services")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "services" && styles.activeTabText,
            ]}
          >
            Услуги
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.activeTabText,
            ]}
          >
            Товары
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderTab()}</View>
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
  header: {
    padding: SPACING.lg,
    backgroundColor: "white",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.sm,
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  userInfo: {
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  bio: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.xl,
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    gap: SPACING.xs,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
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
});

export default ProfileScreen;
