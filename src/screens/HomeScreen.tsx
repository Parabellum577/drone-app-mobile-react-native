import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { COLORS, SPACING } from "../constants/theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import UsersTab from "../components/home/UsersTab";
import MarketplaceTab from "../components/home/MarketplaceTab";
import ServicesTab from "../components/home/ServicesTab";
import { useRoute } from "@react-navigation/native";

type TabType = "users" | "marketplace" | "services";

interface TabItemProps {
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  title,
  icon,
  isActive,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.tabItem, isActive && styles.activeTabItem]}
    onPress={onPress}
  >
    <Icon
      name={icon}
      size={24}
      color={isActive ? COLORS.primary : COLORS.textSecondary}
    />
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState<TabType>("users");

  useEffect(() => {
    if (route.params && "activeTab" in route.params) {
      const tab = route.params.activeTab as TabType;
      if (tab && ["users", "marketplace", "services"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [route.params]);

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersTab />;
      case "marketplace":
        return <MarketplaceTab />;
      case "services":
        return <ServicesTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.tabs}>
        <TabItem
          title="Users"
          icon="account-group"
          isActive={activeTab === "users"}
          onPress={() => setActiveTab("users")}
        />
        <TabItem
          title="Marketplace"
          icon="shopping"
          isActive={activeTab === "marketplace"}
          onPress={() => setActiveTab("marketplace")}
        />
        <TabItem
          title="Services"
          icon="briefcase"
          isActive={activeTab === "services"}
          onPress={() => setActiveTab("services")}
        />
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: SPACING.sm,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    marginVertical: SPACING.sm,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  activeTabItem: {
    backgroundColor: "white",
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
});

export default HomeScreen;
