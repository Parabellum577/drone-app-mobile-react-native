import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING } from '../../constants/theme';
import { Service } from '../../services/service.service';
import { ServiceCategory } from '../../types/service';

interface ScheduleInfoProps {
  service: Service;
}

const ScheduleInfo: React.FC<ScheduleInfoProps> = ({ service }) => {
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

    case ServiceCategory.COURSE:
      return (
        <View style={styles.scheduleSection}>
          {/* Course-specific schedule info */}
          {service.startDate && (
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleItem}>
                <Icon name="calendar-range" size={20} color={COLORS.primary} />
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.scheduleLabel}>Course period:</Text>
                  <Text style={styles.scheduleValue}>
                    {service.startDate}
                    {service.endDate ? ` to ${service.endDate}` : ""}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Available days for course */}
          {service.availableDays && service.availableDays.length > 0 && (
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleItem}>
                <Icon name="calendar-week" size={20} color={COLORS.primary} />
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.scheduleLabel}>Class days:</Text>
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

          {/* Class hours */}
          {service.startTime && (
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleItem}>
                <Icon name="clock-outline" size={20} color={COLORS.primary} />
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.scheduleLabel}>Class time:</Text>
                  <Text style={styles.scheduleValue}>
                    {service.startTime}
                    {service.endTime ? ` - ${service.endTime}` : ""}
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

const styles = StyleSheet.create({
  scheduleSection: {
    marginBottom: SPACING.md,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
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
    flexWrap: "wrap",
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
});

export default ScheduleInfo; 