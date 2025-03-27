import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import serviceService from "../../services/service.service";
import { Service } from "../../types/profile";
import ServiceCard from "../home/ServiceCard";
import { COLORS, SPACING } from "../../constants/theme";
import type { RootStackParamList } from "../../types/navigation";

type NavigationType = NavigationProp<RootStackParamList>;

interface ServicesTabProps {
  userId: string;
  onServicePress: (service: Service) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
  userId,
  onServicePress,
}) => {
  const navigation = useNavigation<NavigationType>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, [userId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getUserServices(userId);
      setServices(data);
    } catch (err) {
      console.error("Error loading user services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    navigation.navigate('CreateService');
  };

  if (loading) {
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={() => onServicePress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services yet</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={handleCreateService}>
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
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
});

export default ServicesTab;
