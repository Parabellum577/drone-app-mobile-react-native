import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { COLORS, SPACING } from "../constants/theme";
import userService from "../services/user.service";
import authService from "../services/auth.service";
import { FormInput } from "../components/common/FormInput";
import { LocationInput } from "../components/common/LocationInput";
import debounce from "lodash/debounce";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

interface ProfileFormData {
  username?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [originalUsername, setOriginalUsername] = useState<string>("");

  const { control, handleSubmit, setValue, setError } = useForm<ProfileFormData>({
    defaultValues: {
      username: "",
      fullName: "",
      bio: "",
      location: "",
      avatar: "",
    },
    mode: "onChange",
  });

  const checkUsernameDebounced = useMemo(
    () => debounce(async (value: string) => {
      // Skip check if username is the same as original
      if (value === originalUsername) return;
      
      try {
        const isAvailable = await authService.checkUsername(value);
        if (!isAvailable) {
          setError("username", { 
            type: "validate", 
            message: "This username is already taken" 
          });
        }
      } catch (err) {
        console.error("Error checking username:", err);
      }
    }, 500),
    [originalUsername]
  );

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getCurrentUserProfile();
      
      if (typeof profile.username === 'string') {
        setValue("username", profile.username);
        setOriginalUsername(profile.username);
      } else {
        setValue("username", "");
        setOriginalUsername("");
      }
      
      setValue("fullName", profile.fullName || "");
      setValue("bio", profile.bio || "");
      setValue("location", profile.location || "");
      setValue("avatar", profile.avatar || "");
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      // Filter out empty fields and undefined values
      const updatedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key as keyof ProfileFormData] = value;
        }
        return acc;
      }, {} as ProfileFormData);

      const updatedProfile = await userService.updateUserProfile(updatedData);
      Alert.alert("Success", "Profile updated successfully");
      
      // Force refresh of profile data when navigating back
      navigation.navigate("Main", { 
        screen: "Profile",
        params: { refresh: Date.now() } // Pass a timestamp to force refresh
      });
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User name</Text>
            <Controller
              control={control}
              name="username"
              rules={{
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Minimum 3 characters",
                },
                validate: async (value) => {
                  // Skip validation if username is the same
                  if (value === originalUsername) return true;
                  
                  try {
                    const isAvailable = await authService.checkUsername(value || "");
                    return isAvailable || "This username is already taken";
                  } catch (err) {
                    return true;
                  }
                },
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormInput
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    if (text.length > 2 && text !== originalUsername) {
                      checkUsernameDebounced(text);
                    }
                  }}
                  placeholder="Enter your username"
                  autoCapitalize="none"
                  error={!!error}
                  errorText={error?.message}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your full name"
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <Controller
              control={control}
              name="bio"
              rules={{
                maxLength: {
                  value: 150,
                  message: "Bio cannot exceed 150 characters"
                }
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <FormInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Tell us about yourself"
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                    maxLength={150}
                    error={!!error}
                    errorText={error?.message}
                  />
                  <Text style={styles.charCount}>
                    {value?.length || 0}/150
                  </Text>
                </>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationContainer}>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <LocationInput
                    value={value || ""}
                    onLocationSelect={onChange}
                    placeholder="Enter your location"
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Avatar URL</Text>
            <Controller
              control={control}
              name="avatar"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter avatar URL"
                  autoCapitalize="none"
                />
              )}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 16,
    marginBottom: SPACING.xs,
    color: COLORS.text,
    fontWeight: "500",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  locationContainer: {
    position: 'relative',
    zIndex: 1,
  },
});

export default EditProfileScreen; 