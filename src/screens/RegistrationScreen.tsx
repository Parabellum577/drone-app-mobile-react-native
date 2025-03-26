import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { COLORS, SPACING } from "../constants/theme";
import authService from "../services/auth.service";
import { AuthContext } from "../contexts/AuthContext";
import { StepOneForm, type StepOneData } from "../components/auth/StepOneForm";
import { StepTwoForm, type StepTwoData } from "../components/auth/StepTwoForm";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const { checkAuth } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepOneData, setStepOneData] = useState<StepOneData | null>(null);

  const handleNextStep = (data: StepOneData) => {
    setStepOneData(data);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (data: StepTwoData) => {
    if (!stepOneData) return;

    try {
      setLoading(true);
      await authService.register({
        name: data.fullName,
        username: data.username,
        email: stepOneData.email,
        password: stepOneData.password,
        location: data.location,
      });
      await checkAuth();
    } catch (error: any) {
      if (error?.response?.data?.field === "email") {
        setStep(1);
      }
      if (error?.response?.data?.field === "username") {
        // Handle username error
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        {step === 1 ? (
          <StepOneForm onSubmit={handleNextStep} />
        ) : (
          <StepTwoForm 
            onSubmit={handleSubmit}
            onBack={handleBack}
            loading={loading}
          />
        )}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: SPACING.xl,
    textAlign: "center",
    color: COLORS.text,
  },
  stepText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  loginButton: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },
  loginText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

export default RegistrationScreen;
