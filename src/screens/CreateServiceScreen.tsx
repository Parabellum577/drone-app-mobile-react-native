import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { RootStackParamList } from "../types/navigation";
import { COLORS, SPACING } from "../constants/theme";
import serviceService from "../services/service.service";
import { Currency, ServiceCategory } from "../types/service";
import { FormInput } from "../components/common/FormInput";
import { FormTextArea } from "../components/common/FormTextArea";
import { LocationInput } from "../components/common/LocationInput";
import { CategorySelector } from "../components/common/CategorySelector";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

const CURRENCIES = [Currency.USD, Currency.EUR, Currency.PLN];
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type EventSchedule = {
  startDate: Date;
  endDate?: Date;
};

type ServiceSchedule = {
  availableDays: string[];
  startTime: string;
  endTime: string;
};

type FormField = {
  id: string;
  type:
    | "title"
    | "category"
    | "location"
    | "description"
    | "price"
    | "image"
    | "schedule";
  label: string;
};

const formFields: FormField[] = [
  { id: "title", type: "title", label: "Title" },
  { id: "category", type: "category", label: "Category" },
  { id: "location", type: "location", label: "Location" },
  { id: "description", type: "description", label: "Description" },
  { id: "schedule", type: "schedule", label: "Schedule" },
  { id: "price", type: "price", label: "Price" },
  { id: "image", type: "image", label: "Image URL" },
];

const getShortDay = (day: string): string => {
  const index = DAYS_OF_WEEK.indexOf(day);
  return index !== -1 ? DAYS_SHORT[index] : day.substr(0, 3);
};

const CreateServiceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");
  const [datePickerType, setDatePickerType] = useState<"start" | "end">(
    "start"
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [eventSchedule, setEventSchedule] = useState<EventSchedule>({
    startDate: new Date(),
  });

  const [serviceSchedule, setServiceSchedule] = useState<ServiceSchedule>({
    availableDays: [],
    startTime: "09:00",
    endTime: "18:00",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: Currency.EUR,
    image: "",
    location: "",
    category: ServiceCategory.SERVICE,
  });

  useEffect(() => {
    const params = route.params as { serviceId?: string; mode?: 'create' | 'edit' };
    
    if (params?.serviceId && params?.mode === 'edit') {
      setIsEditMode(true);
      loadServiceData(params.serviceId);
    }
  }, [route.params]);

  const loadServiceData = async (serviceId: string) => {
    try {
      setInitialLoading(true);
      const serviceData = await serviceService.getServiceById(serviceId);
      
      if (serviceData) {
        setForm({
          title: serviceData.title || '',
          description: serviceData.description || '',
          price: serviceData.price ? serviceData.price.toString() : '0',
          currency: serviceData.currency || Currency.EUR,
          image: serviceData.image || '',
          location: serviceData.location || '',
          category: serviceData.category || ServiceCategory.SERVICE,
        });
        
        setIsFree(serviceData.price === 0);
        
        if (serviceData.category === ServiceCategory.EVENT) {
          const eventData = {
            startDate: serviceData.startDate ? new Date(serviceData.startDate) : new Date(),
            endDate: serviceData.endDate ? new Date(serviceData.endDate) : undefined
          };
          
          if (serviceData.startTime) {
            const [hours, minutes] = serviceData.startTime.split(':').map(Number);
            eventData.startDate.setHours(hours, minutes);
          }
          
          if (serviceData.endTime && eventData.endDate) {
            const [hours, minutes] = serviceData.endTime.split(':').map(Number);
            eventData.endDate.setHours(hours, minutes);
          }
          
          setEventSchedule(eventData);
        } else if (serviceData.category === ServiceCategory.SERVICE) {
          setServiceSchedule({
            availableDays: serviceData.availableDays || [],
            startTime: serviceData.workingHours?.from || '09:00',
            endTime: serviceData.workingHours?.to || '18:00'
          });
        }
      }
    } catch (error) {
      console.error('Error loading service data:', error);
      Alert.alert('Error', 'Failed to load service data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      (!isFree && !form.price.trim()) ||
      !form.image.trim() ||
      !form.location.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      let scheduleData = {};

      switch (form.category) {
        case ServiceCategory.EVENT:
          scheduleData = {
            startDate: eventSchedule.startDate.toISOString().split("T")[0], // YYYY-MM-DD
            startTime: formatTime(eventSchedule.startDate),
          };

          if (eventSchedule.endDate) {
            scheduleData = {
              ...scheduleData,
              endDate: eventSchedule.endDate.toISOString().split("T")[0],
              endTime: formatTime(eventSchedule.endDate),
            };
          }
          break;

        case ServiceCategory.SERVICE:
          scheduleData = {
            availableDays: serviceSchedule.availableDays.map((day) =>
              getShortDay(day)
            ),
            workingHours: {
              from: serviceSchedule.startTime,
              to: serviceSchedule.endTime,
            },
          };
          break;
      }

      const serviceData = {
        ...form,
        price: isFree ? 0 : parseFloat(form.price),
        ...scheduleData,
      };

      let result;
      const params = route.params as { serviceId?: string; mode?: 'create' | 'edit' };
      
      if (isEditMode && params?.serviceId) {
        result = await serviceService.updateService(params.serviceId, serviceData);
        Alert.alert('Success', 'Service updated successfully');
      } else {
        result = await serviceService.createService(serviceData);
      }

      navigation.navigate("Main", {
        screen: "Services",
        params: { newService: result },
      });
    } catch (err) {
      console.error(isEditMode ? "Error updating service:" : "Error creating service:", err);
      Alert.alert("Error", isEditMode ? "Failed to update service" : "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = (category: ServiceCategory) => {
    setForm((prev) => ({ ...prev, category }));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (!selectedDate) return;

    switch (form.category) {
      case ServiceCategory.EVENT:
        if (datePickerType === "start") {
          if (datePickerMode === "date") {
            const newDate = new Date(selectedDate);
            const hours = eventSchedule.startDate
              ? eventSchedule.startDate.getHours()
              : 0;
            const minutes = eventSchedule.startDate
              ? eventSchedule.startDate.getMinutes()
              : 0;
            newDate.setHours(hours, minutes);

            const endDate = eventSchedule.endDate
              ? new Date(eventSchedule.endDate)
              : null;
            if (endDate && newDate > endDate) {
              const newEndDate = new Date(newDate);
              newEndDate.setHours(newDate.getHours() + 2, newDate.getMinutes());
              setEventSchedule((prev) => ({
                startDate: newDate,
                endDate: newEndDate,
              }));
            } else {
              setEventSchedule((prev) => ({ ...prev, startDate: newDate }));
            }
          } else {
            const newDate = new Date(eventSchedule.startDate);
            newDate.setHours(
              selectedDate.getHours(),
              selectedDate.getMinutes()
            );

            const endDate = eventSchedule.endDate
              ? new Date(eventSchedule.endDate)
              : null;
            if (
              endDate &&
              endDate.getDate() === newDate.getDate() &&
              endDate.getMonth() === newDate.getMonth() &&
              endDate.getFullYear() === newDate.getFullYear() &&
              newDate > endDate
            ) {
              const newEndDate = new Date(newDate);
              newEndDate.setHours(newDate.getHours() + 2, newDate.getMinutes());
              setEventSchedule((prev) => ({
                startDate: newDate,
                endDate: newEndDate,
              }));
            } else {
              setEventSchedule((prev) => ({ ...prev, startDate: newDate }));
            }
          }
        } else {
          if (datePickerMode === "date") {
            const newEndDate = eventSchedule.endDate
              ? new Date(eventSchedule.endDate)
              : new Date(eventSchedule.startDate);
            newEndDate.setFullYear(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            );

            if (newEndDate < eventSchedule.startDate) {
              newEndDate.setFullYear(
                eventSchedule.startDate.getFullYear(),
                eventSchedule.startDate.getMonth(),
                eventSchedule.startDate.getDate()
              );
              newEndDate.setHours(
                eventSchedule.startDate.getHours() + 2,
                eventSchedule.startDate.getMinutes()
              );
            }

            setEventSchedule((prev) => ({ ...prev, endDate: newEndDate }));
          } else {
            const newEndDate = eventSchedule.endDate
              ? new Date(eventSchedule.endDate)
              : new Date(eventSchedule.startDate);
            newEndDate.setHours(
              selectedDate.getHours(),
              selectedDate.getMinutes()
            );

            const isSameDay =
              newEndDate.getDate() === eventSchedule.startDate.getDate() &&
              newEndDate.getMonth() === eventSchedule.startDate.getMonth() &&
              newEndDate.getFullYear() ===
                eventSchedule.startDate.getFullYear();

            if (isSameDay && newEndDate < eventSchedule.startDate) {
              newEndDate.setHours(
                eventSchedule.startDate.getHours() + 1,
                eventSchedule.startDate.getMinutes()
              );
            }

            setEventSchedule((prev) => ({ ...prev, endDate: newEndDate }));
          }
        }
        break;

      case ServiceCategory.SERVICE:
        if (datePickerMode === "time") {
          const timeStr = formatTime(selectedDate);
          if (datePickerType === "start") {
            setServiceSchedule((prev) => ({ ...prev, startTime: timeStr }));
          } else {
            setServiceSchedule((prev) => ({ ...prev, endTime: timeStr }));
          }
        }
        break;
    }
  };

  const showDateTimePickerModal = (
    mode: "date" | "time",
    type: "start" | "end"
  ) => {
    setDatePickerMode(mode);
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  const toggleServiceDay = (day: string) => {
    setServiceSchedule((prev) => {
      const availableDays = [...prev.availableDays];
      const index = availableDays.indexOf(day);

      if (index > -1) {
        availableDays.splice(index, 1);
      } else {
        availableDays.push(day);
      }

      return { ...prev, availableDays };
    });
  };

  const calculateEventDuration = (start: Date, end?: Date): number => {
    if (!end) return 1;

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays);
  };

  const renderScheduleSelector = () => {
    switch (form.category) {
      case ServiceCategory.EVENT:
        const duration = eventSchedule.endDate
          ? calculateEventDuration(
              eventSchedule.startDate,
              eventSchedule.endDate
            )
          : 1;

        const showDuration = eventSchedule.endDate && duration > 1;

        return (
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Start Date:</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showDateTimePickerModal("date", "start")}
              >
                <Text style={styles.datePickerButtonText}>
                  {formatDate(eventSchedule.startDate)}
                </Text>
                <Icon name="calendar" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Start Time:</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showDateTimePickerModal("time", "start")}
              >
                <Text style={styles.datePickerButtonText}>
                  {formatTime(eventSchedule.startDate)}
                </Text>
                <Icon name="clock-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>End Date:</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showDateTimePickerModal("date", "end")}
              >
                <Text style={styles.datePickerButtonText}>
                  {eventSchedule.endDate
                    ? formatDate(eventSchedule.endDate)
                    : "Select date"}
                </Text>
                <Icon name="calendar" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>End Time:</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showDateTimePickerModal("time", "end")}
              >
                <Text style={styles.datePickerButtonText}>
                  {eventSchedule.endDate
                    ? formatTime(eventSchedule.endDate)
                    : "Select time"}
                </Text>
                <Icon name="clock-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {showDuration && (
              <View style={styles.durationIndicator}>
                <Icon name="calendar-clock" size={20} color={COLORS.primary} />
                <Text style={styles.durationText}>
                  {duration} {duration === 1 ? "day" : "days"} event
                </Text>
              </View>
            )}
          </View>
        );

      case ServiceCategory.SERVICE:
        return (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleSubLabel}>Available Days:</Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    serviceSchedule.availableDays.includes(day) &&
                      styles.selectedDayButton,
                  ]}
                  onPress={() => toggleServiceDay(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      serviceSchedule.availableDays.includes(day) &&
                        styles.selectedDayButtonText,
                    ]}
                  >
                    {getShortDay(day)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Working Hours:</Text>
              <View style={styles.timeRange}>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => showDateTimePickerModal("time", "start")}
                >
                  <Text style={styles.timePickerText}>
                    {serviceSchedule.startTime}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.timeRangeSeparator}>-</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => showDateTimePickerModal("time", "end")}
                >
                  <Text style={styles.timePickerText}>
                    {serviceSchedule.endTime}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderFormField = ({ item }: { item: FormField }) => {
    if (item.type === "schedule" && form.category === ServiceCategory.COURSE) {
      return null;
    }

    switch (item.type) {
      case "title":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <FormInput
              value={form.title}
              onChangeText={(value) => updateForm("title", value)}
              placeholder="Enter service title"
            />
          </View>
        );

      case "category":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <CategorySelector
              value={form.category}
              onChange={handleCategoryChange}
            />
          </View>
        );

      case "location":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <LocationInput
              value={form.location}
              onLocationSelect={(location) => updateForm("location", location)}
            />
          </View>
        );

      case "description":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <FormTextArea
              value={form.description}
              onChangeText={(value) => updateForm("description", value)}
              placeholder="Enter service description"
            />
          </View>
        );

      case "schedule":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            {renderScheduleSelector()}
          </View>
        );

      case "price":
        return (
          <View style={styles.field}>
            <View style={styles.priceHeader}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={styles.freeSwitch}>
                <Text style={styles.switchLabel}>Free</Text>
                <Switch
                  value={isFree}
                  onValueChange={setIsFree}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              </View>
            </View>
            <View style={styles.priceContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.priceInput,
                  isFree && styles.disabled,
                ]}
                value={form.price}
                onChangeText={(value) => updateForm("price", value)}
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
                editable={!isFree}
              />
              <View style={styles.currencyContainer}>
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyButton,
                      form.currency === curr && styles.currencyButtonActive,
                      isFree && styles.disabled,
                    ]}
                    onPress={() =>
                      !isFree &&
                      setForm((prev) => ({ ...prev, currency: curr }))
                    }
                    disabled={isFree}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        form.currency === curr && styles.currencyTextActive,
                        isFree && styles.disabledText,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case "image":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
              style={styles.input}
              value={form.image}
              onChangeText={(value) => updateForm("image", value)}
              placeholder="Enter image URL (optional)"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading service data...</Text>
        </View>
      ) : (
        <>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            <FlatList
              data={formFields}
              renderItem={renderFormField}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              ListFooterComponent={<View style={styles.bottomPadding} />}
            />
          </KeyboardAvoidingView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditMode ? "Update Service" : "Create Service"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                datePickerType === "start"
                  ? form.category === ServiceCategory.EVENT
                    ? eventSchedule.startDate
                    : new Date()
                  : form.category === ServiceCategory.EVENT
                  ? eventSchedule.endDate || new Date()
                  : new Date()
              }
              mode={datePickerMode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  field: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.sm + 2,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  freeSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  priceContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  priceInput: {
    flex: 1,
  },
  currencyContainer: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  currencyButton: {
    backgroundColor: "white",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 60,
    alignItems: "center",
  },
  currencyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  currencyText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  currencyTextActive: {
    color: "white",
  },
  disabled: {
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 40,
  },

  scheduleContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  scheduleLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  scheduleSubLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    marginBottom: SPACING.sm,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 120, 255, 0.1)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: 10,
  },
  datePickerButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  timeRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  timePickerButton: {
    backgroundColor: "rgba(0, 120, 255, 0.1)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  timePickerText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  timeRangeSeparator: {
    fontSize: 16,
    color: COLORS.text,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dayButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    minWidth: 40,
    alignItems: "center",
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayButtonText: {
    color: COLORS.text,
  },
  selectedDayButtonText: {
    color: "white",
  },
  durationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  durationText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  scheduleInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    backgroundColor: "rgba(0, 120, 255, 0.05)",
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default CreateServiceScreen;
