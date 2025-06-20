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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import type { Video } from "../types/profile";
import type { Product } from "../types/profile";

type Props = TabScreenProps<"Profile">;
type TabType = "videos" | "services" | "products";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&size=200&length=2&bold=true&format=png&color=ffffff";

const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<TabType>("videos");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkAuth } = useContext(AuthContext);

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

  const updateNavigationHeader = (userData: User) => {
    navigation.setOptions({
      title: `@${userData.username}`,
    });
  };

  const fetchUserProfile = async () => {
    try {
      const data = await userService.getCurrentUserProfile();
      setUser(data);
      updateNavigationHeader(data);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      if (err?.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: handleLogout,
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const mockVideos: Video[] = [
    {
      id: "1",
      title: "Drone Flight",
      thumbnail: "https://picsum.photos/300/200",
      duration: "2:30",
      views: 1200,
      likes: 45,
      comments: 12,
    },
    {
      id: "2",
      title: "City View",
      thumbnail: "https://picsum.photos/300/200",
      duration: "3:45",
      views: 850,
      likes: 32,
      comments: 8,
    },
  ];

  const mockProducts: Product[] = [
    {
      id: "1",
      title: "DJI Mini 2",
      price: "$449",
      description: "Lightweight drone",
      image: "https://picsum.photos/300/200",
      category: "Drone",
    },
    {
      id: "2",
      title: "Landing Pad",
      price: "$29",
      description: "Safe landing pad",
      image: "https://picsum.photos/300/200",
      category: "Drone",
    },
  ];

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("token");
            await checkAuth();
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await userService.getCurrentUserProfile();
        if (isMounted) {
          setUser(data);
          updateNavigationHeader(data);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    const unsubscribe = navigation.addListener("focus", () => {
      if (isMounted) {
        loadProfile();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    if (route.params?.refresh) {
      fetchUserProfile();
    }
  }, [route.params?.refresh]);

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
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryText}>Retry</Text>
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
            userId={user.id}
            isOwnProfile={true}
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
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Icon name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.fullName}</Text>
          {user.location && (
            <View style={styles.locationContainer}>
              <Icon name="map-marker" size={16} color={COLORS.textSecondary} style={{marginRight: SPACING.xs}}/>
              <Text style={styles.location}>{user.location}</Text>
            </View>
          )}
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
          {<Text style={styles.bio}>{user.bio ? user.bio : "No bio yet"}</Text>}
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
            Videos
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
            Services
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
            Products
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
    padding: SPACING.md,
    backgroundColor: "white",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: SPACING.xs,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 32,
    height: 32,
    borderRadius: 16,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  },
  bio: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
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
  logoutButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: SPACING.sm,
  },
});

export default ProfileScreen;
