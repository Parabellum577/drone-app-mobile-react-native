import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SPACING } from "../../constants/theme";
import { Service } from "../../services/service.service";
import { User } from "../../services/user.service";
import { PriceDisplay } from "../PriceDisplay";

interface ServiceInfoProps {
  service: Service;
}

const ServiceInfo: React.FC<ServiceInfoProps> = ({ service }) => {
  return (
    <View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  locationIcon: {
    marginRight: SPACING.xs,
  },
  priceContainer: {
    minWidth: 60,
    alignItems: "flex-end",
  },
  price: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: "bold",
    paddingRight: SPACING.sm,
  },
});

export default ServiceInfo;
