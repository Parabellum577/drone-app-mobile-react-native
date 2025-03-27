import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList, TabParamList } from "../types/navigation";
import { COLORS, SPACING } from "../constants/theme";
import serviceService, { Service } from "../services/service.service";
import userService, { User } from "../services/user.service";
import { PriceDisplay } from "../components/PriceDisplay";
import { CATEGORY_DESCRIPTIONS, ServiceCategory } from "../types/service";

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

  const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?background=random&size=200&length=2&bold=true&format=png&color=ffffff";

  const categoryIcons = {
    [ServiceCategory.SERVICE]: "briefcase-outline",
    [ServiceCategory.EVENT]: "calendar-star",
    [ServiceCategory.COURSE]: "school-outline",
  };

  const categoryLabels = {
    [ServiceCategory.SERVICE]: "Service",
    [ServiceCategory.EVENT]: "Event",
    [ServiceCategory.COURSE]: "Course",
  };

  const navigateToServices = useCallback(() => {
    navigation.navigate("Home", { activeTab: "services" });
  }, [navigation]);

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
    } catch (err) {
      console.error("Error fetching creator info:", err);
      // Не устанавливаем ошибку, так как это не критическая информация
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

  const getBookButtonText = () => {
    switch (service?.category) {
      case ServiceCategory.EVENT:
        return "Register";
      case ServiceCategory.COURSE:
        return "Enroll";
      default:
        return "Book Now";
    }
  };

  const ScheduleInfo: React.FC<{ service: Service }> = ({ service }) => {
    if (!service) return null;

    switch (service.category) {
      case ServiceCategory.EVENT:
        return (
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleEventContainer}>
              <View style={styles.scheduleEventItem}>
                <Icon name="calendar" size={20} color={COLORS.primary} />
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.scheduleLabel}>Date:</Text>
                  <Text style={styles.scheduleValue}>
                    {service.startDate}
                    {service.endDate && service.endDate !== service.startDate
                      ? ` - ${service.endDate}`
                      : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.scheduleEventItem}>
                <Icon name="clock-outline" size={20} color={COLORS.primary} />
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.scheduleLabel}>Time:</Text>
                  <Text style={styles.scheduleValue}>
                    {service.startTime}
                    {service.endTime ? ` - ${service.endTime}` : ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case ServiceCategory.SERVICE:
        return (
          <View style={styles.scheduleSection}>
            {service.availableDays && service.availableDays.length > 0 && (
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleItem}>
                  <Icon name="calendar-week" size={20} color={COLORS.primary} />
                  <View style={styles.scheduleTextContainer}>
                    <Text style={styles.scheduleLabel}>Available days:</Text>
                    <View style={styles.daysContainer}>
                      {service.availableDays.map((day) => (
                        <View key={day} style={styles.dayBadge}>
                          <Text style={styles.dayText}>{day}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {service.workingHours && (
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleItem}>
                  <Icon name="clock-outline" size={20} color={COLORS.primary} />
                  <View style={styles.scheduleTextContainer}>
                    <Text style={styles.scheduleLabel}>Working hours:</Text>
                    <Text style={styles.scheduleValue}>
                      {service.workingHours.from} - {service.workingHours.to}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
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
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Service not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchServiceDetails}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: service.image }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{service.title}</Text>
            {service.category && (
              <View style={styles.categoryContainer}>
                <View style={styles.categoryBadge}>
                  <Icon
                    name={categoryIcons[service.category]}
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.categoryLabel}>
                    {categoryLabels[service.category]}
                  </Text>
                </View>
                <Text style={styles.categoryDescription}>
                  {CATEGORY_DESCRIPTIONS[service.category]}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon 
                name="map-marker" 
                size={20} 
                color={COLORS.textSecondary} 
                style={styles.locationIcon}
              />
              <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
                {service.location}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <PriceDisplay
                price={service.price}
                currency={service.currency}
                style={styles.price}
              />
            </View>
          </View>

          <ScheduleInfo service={service} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>
          
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

      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookService}>
          <Text style={styles.bookButtonText}>{getBookButtonText()}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {service?.category === ServiceCategory.EVENT
                ? "Event Registration"
                : service?.category === ServiceCategory.COURSE
                ? "Course Enrollment"
                : "Book Service"}
            </Text>

            {service?.category === ServiceCategory.EVENT ? (
              <View style={styles.eventInfoContainer}>
                <Text style={styles.eventInfoTitle}>Event Information:</Text>

                <View style={styles.eventInfoRow}>
                  <Text style={styles.eventInfoLabel}>Date:</Text>
                  <Text style={styles.eventInfoValue}>{date}</Text>
                </View>

                {time && (
                  <View style={styles.eventInfoRow}>
                    <Text style={styles.eventInfoLabel}>Time:</Text>
                    <Text style={styles.eventInfoValue}>{time}</Text>
                  </View>
                )}

                <Text style={styles.eventInfoDesc}>
                  You are registering for an event with the specified date and
                  time.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalLabel}>Preferred Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD/MM/YYYY"
                />

                <Text style={styles.modalLabel}>Preferred Time</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                />
              </>
            )}

            <Text style={styles.modalLabel}>
              Additional Information (Optional)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Specify any special requirements or questions..."
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBookingModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmitBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
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
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    width: "100%",
    paddingRight: SPACING.sm,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SPACING.md,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    flex: 1,
  },
  price: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: "bold",
    paddingRight: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "white",
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: "center",
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.xs,
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
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
  },
  titleContainer: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    marginTop: SPACING.xs,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 120, 255, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: SPACING.xs,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  categoryDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  scheduleSection: {
    marginBottom: SPACING.md,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  scheduleTextContainer: {
    flexDirection: "column",
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  scheduleValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  daysContainer: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  dayBadge: {
    backgroundColor: "rgba(0, 120, 255, 0.1)",
    borderRadius: 4,
    padding: SPACING.xs,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  eventInfoContainer: {
    marginBottom: SPACING.md,
  },
  eventInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  eventInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  eventInfoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  eventInfoValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  eventInfoDesc: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  scheduleEventContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  scheduleEventItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    minWidth: "45%",
    marginBottom: SPACING.xs,
  },
  creatorLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
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
  locationIcon: {
    marginRight: SPACING.xs,
  },
  priceContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
});

export default ServiceDetailsScreen;
