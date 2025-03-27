import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING } from "../../constants/theme";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

interface ProfileMenuProps {
  onClose: () => void;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose, onLogout }) => {
  const navigation = useNavigation<NavigationType>();
  const [visible, setVisible] = useState(false);

  const handleEditProfile = () => {
    setVisible(false);
    onClose();
    navigation.dispatch(
      CommonActions.navigate({
        name: 'EditProfile'
      })
    );
  };

  const handleLogout = () => {
    setVisible(false);
    onLogout();
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Icon name="dots-horizontal" size={24} color={COLORS.text} style={{ marginRight: SPACING.md }} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setVisible(false);
          onClose();
        }}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            setVisible(false);
            onClose();
          }}
        >
          <View style={styles.container}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <Icon name="account-edit" size={24} color={COLORS.text} />
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Icon name="logout" size={24} color={COLORS.text} />
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  container: {
    backgroundColor: "white",
    marginTop: 50,
    marginRight: SPACING.md,
    marginLeft: "auto",
    borderRadius: 8,
    padding: SPACING.sm,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutText: {
    color: COLORS.text,
  },
});

export default ProfileMenu; 