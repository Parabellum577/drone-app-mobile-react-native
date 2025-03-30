import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Share,
  TouchableOpacity,
  Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../types/navigation";
import { COLORS, SPACING } from "../constants/theme";
import serviceService, { Service } from "../services/service.service";
import userService, { User } from "../services/user.service";
import { ServiceCategory } from "../types/service";
import { 
  ServiceHeader, 
  ServiceInfo, 
  ScheduleInfo, 
  ServiceDescription, 
  BookingButton 
} from "../components/serviceDetails";
import ErrorView from "../components/common/ErrorView";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "ServiceDetails">,
  NativeStackScreenProps<RootStackParamList>
>;

const ServiceDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<User | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const navigateToServices = useCallback(() => {
    navigation.navigate("Home", { activeTab: "services" });
  }, [navigation]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServiceById(serviceId);
      setService(data);
      if (data && data.created_by) {
        fetchCreatorInfo(data.created_by);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
      setError("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorInfo = async (userId: string) => {
    try {
      const info = await userService.getUserProfile(userId);
      setCreatorInfo(info);
      
      // Check if current user is the creator
      const currentUser = await userService.getCurrentUserProfile();
      setIsCreator(currentUser.id === userId);
    } catch (err) {
      console.error("Error fetching creator info:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServiceDetails();
    }, [serviceId])
  );

  const handleBookService = () => {
    if (service?.category === ServiceCategory.EVENT && service.startDate) {
      setDate(service.startDate);
      if (service.startTime) {
        setTime(service.startTime);
      }
    } else {
      setDate("");
      setTime("");
    }

    setNotes("");
    setBookingModalVisible(true);
  };

  const handleSubmitBooking = async () => {
    if (service?.category !== ServiceCategory.EVENT && !date) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    try {
      setBookingLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setBookingModalVisible(false);

      const successMessage =
        service?.category === ServiceCategory.EVENT
          ? "You have successfully registered for the event. The organizer will contact you soon."
          : "Your booking request has been sent. The service provider will contact you soon.";

      Alert.alert("Success!", successMessage, [
        {
          text: "OK",
          onPress: navigateToServices,
        },
      ]);
    } catch (err) {
      console.error("Error booking service:", err);
      Alert.alert("Error", "Failed to book the service. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleEditService = () => {
    if (service) {
      navigation.navigate("CreateService", { 
        serviceId: service.serviceId,
        mode: 'edit' as 'edit'
      });
    }
  };

  const handleShareService = async () => {
    if (!service) return;
    
    try {
      const result = await Share.share({
        message: `Check out this ${service.category?.toLowerCase() || 'service'}: ${service.title}`,
        title: service.title,
        // In a real app, you would include a URL to the service
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const navigateToCreatorProfile = () => {
    if (creatorInfo) {
      navigation.navigate("UserProfile", {
        userId: creatorInfo.id,
        username: creatorInfo.username,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !service) {
    return (
      <ErrorView 
        error={error || "Service not found"} 
        onRetry={fetchServiceDetails} 
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <ServiceHeader 
          service={service} 
          isCreator={isCreator}
          onEdit={handleEditService}
          onShare={handleShareService}
        />
        
        <View style={styles.content}>
          <ServiceInfo 
            service={service} 
          />
          
          <ScheduleInfo service={service} />
          
          <ServiceDescription description={service.description} />

          {creatorInfo && (
        <TouchableOpacity
          style={styles.creatorLink}
          onPress={navigateToCreatorProfile}
        >
          <Text style={styles.creatorLinkText}>
            Created by: <Text style={styles.creatorLinkName}>@{creatorInfo.username}</Text>
          </Text>
          <Icon name="chevron-right" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
        </View>
      </ScrollView>

      <BookingButton 
        category={service.category}
        onPress={handleBookService}
      />

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.eventInfoContainer}>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="DD/MM/YYYY"
              />
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional information..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalButtons}>
              {bookingLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={() => setBookingModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.submitButton]} 
                    onPress={handleSubmitBooking}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    padding: SPACING.lg,
  },
  content: {
    padding: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: SPACING.lg,
  },
  eventInfoContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.text,
  },
  creatorLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  creatorLinkText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  creatorLinkName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});

export default ServiceDetailsScreen;
