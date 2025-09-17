// app/login.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
// import {
//   allowScreenCaptureAsync,
//   preventScreenCaptureAsync,
// } from "expo-screen-capture";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { BASE_URL } from "../constants/ApiConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Prevent black screen in Google Meet screen share
  // useEffect(() => {
  //   const enableScreenShare = async () => {
  //     try {
  //       await preventScreenCaptureAsync();
  //     } catch (err) {
  //       console.warn("Failed to prevent screen capture:", err);
  //     }
  //   };
  //   enableScreenShare();

  //   return () => {
  //     allowScreenCaptureAsync().catch(() =>
  //       console.warn("Failed to allow screen capture back")
  //     );
  //   };
  // }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Store authentication data
      await AsyncStorage.multiSet([
        ["access_token", data.access_token],
        ["role", data.user.role.name],
        ["role_id", data.user.role.id.toString()],
        ["user_id", data.user.id.toString()],
        ["user_name", data.user.name],
        ["user_email", data.user.email],
        ["location_id", data.user.location?.id?.toString() || ""],
        ["location_name", data.user.location?.name || ""],
        ["location_type", data.user.location?.type || ""],
        ["permissions", JSON.stringify(data.user.role.permissions || [])],

        // Store the missing location hierarchy data
        ["subcounty_id", data.user.location?.parent?.id?.toString() || ""],
        ["subcounty_name", data.user.location?.parent?.name || ""],
        ["county_id", data.user.location?.parent?.parent?.id?.toString() || ""],
        ["county_name", data.user.location?.parent?.parent?.name || ""],

        // Store the entire location hierarchy as JSON for easy retrieval
        ["location_hierarchy", JSON.stringify(data.user.location || {})],
      ]);

      console.log("Login successful, stored data:", {
        token: data.access_token,
        role: data.user.role.name,
        userId: data.user.id,
        locationId: data.user.location?.id,
      });

      // Redirect based on role
      switch (data.user.role.name) {
        case "admin":
        case "county user":
        case "subcounty user":
          router.replace("/home");
          break;
        default:
          router.replace("/home");
          break;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        error.message || "Invalid credentials or network error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center p-5`}>
        <View style={tw`items-center mb-10`}>
          <Image
            source={require("../assets/images/splash-logo.jpeg")}
            style={tw`w-40 h-40 mb-4`}
            resizeMode="contain"
          />
          <Text style={tw`text-gray-600 text-base`}>Sign in to continue</Text>
        </View>

        <View style={tw`w-full`}>
          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={tw`bg-purple-500 p-4 rounded-lg items-center mt-2 ${
              isLoading ? "opacity-50" : ""
            }`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={tw`text-white text-base font-bold`}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
