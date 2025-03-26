import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UsersTab from '../components/home/UsersTab';
import MarketplaceTab from '../components/home/MarketplaceTab';
import ServicesTab from '../components/home/ServicesTab';

type TabType = 'users' | 'marketplace' | 'services';

interface TabItemProps {
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ title, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tabItem, isActive && styles.activeTabItem]}
    onPress={onPress}
  >
    <Icon
      name={icon}
      size={24}
      color={isActive ? COLORS.primary : COLORS.textSecondary}
    />
    <Text
      style={[
        styles.tabText,
        isActive && styles.activeTabText,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      // TODO: Implement search logic per tab
    }, 500);

    setSearchTimeout(timeout);
  };

  useEffect(() => {
    handleSearch();
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery]);

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab searchQuery={searchQuery} />;
      case 'marketplace':
        return <MarketplaceTab />;
      case 'services':
        return <ServicesTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="magnify" size={24} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TabItem
          title="Users"
          icon="account-group"
          isActive={activeTab === 'users'}
          onPress={() => setActiveTab('users')}
        />
        <TabItem
          title="Marketplace"
          icon="shopping"
          isActive={activeTab === 'marketplace'}
          onPress={() => setActiveTab('marketplace')}
        />
        <TabItem
          title="Services"
          icon="briefcase"
          isActive={activeTab === 'services'}
          onPress={() => setActiveTab('services')}
        />
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: SPACING.sm,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    marginVertical: SPACING.sm,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  activeTabItem: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

export default HomeScreen; 