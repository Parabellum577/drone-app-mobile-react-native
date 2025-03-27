import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING } from '../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import serviceService, { Service } from '../../services/service.service';
import ServiceCard from './ServiceCard';
import SearchHeader from '../common/SearchHeader';
import FiltersModal from '../services/FiltersModal';

type NavigationType = NavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Main'>;

const ServicesTab: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const route = useRoute<RouteType>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: 0,
    maxPrice: 0,
  });

  const fetchServices = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await serviceService.getServices({
        searchTitle: searchQuery,
        location: filters.location,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const handleCreateService = () => {
    navigation.navigate('CreateService');
  };

  const handleApplyFilters = (newFilters: { location?: string; minPrice?: number; maxPrice?: number }) => {
    setFilters({
      location: newFilters.location || '',
      minPrice: newFilters.minPrice || 0,
      maxPrice: newFilters.maxPrice || 0,
    });
    setFiltersVisible(false);
    fetchServices();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchServices();
    }, 500);
  
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  useEffect(() => {
    const params = route.params as { newService?: Service };
    if (params?.newService && 'id' in params.newService) {
      setServices(prev => [params.newService as Service, ...prev]);
      navigation.setParams({
        screen: 'Services',
        params: { newService: undefined }
      });
    }
  }, [route.params]);

  if (loading && !services.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && !services.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchServices}
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
        placeholder="Search services"
        showFilters
        onFiltersPress={() => setFiltersVisible(true)}
      />
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard 
            service={item}
            onPress={() => console.log('Service pressed:', item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services found</Text>
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
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateService}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
});

export default ServicesTab; 