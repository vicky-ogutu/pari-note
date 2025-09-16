import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import HamburgerButton from "../components/HamburgerButton";
import { BASE_URL } from "../constants/ApiConfig";

// Define the form data type
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

// Define role mapping to roleId
// Match exactly what is in DB
// Match exactly what is in DB
const ROLE_MAPPING: { [key: string]: number } = {
  "county user": 2,
  "subcounty user": 3,
  admin: 1, // facility in-charge admin
  nurse: 4, // HCW
};

// Who can create whom
const ROLE_HIERARCHY: { [key: string]: string[] } = {
  "county user": ["subcounty user"],
  "subcounty user": ["admin"],
  admin: ["nurse"],
  nurse: [],
};

const RegisterScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);

  useEffect(() => {
    const getUserData = async () => {
      const role = await AsyncStorage.getItem("role");
      const locationIdStr = await AsyncStorage.getItem("location_id");

      console.log("Current user role from storage:", role); // Debug log
      setUserRole(role || "");
      setLocationId(locationIdStr ? parseInt(locationIdStr) : null);

      // Set allowed roles based on current user's role
      if (role && ROLE_HIERARCHY[role]) {
        console.log("Allowed roles for", role, ":", ROLE_HIERARCHY[role]); // Debug log
        setAllowedRoles(ROLE_HIERARCHY[role]);
      } else {
        console.log("No allowed roles for role:", role); // Debug log
        setAllowedRoles([]);
      }
    };
    getUserData();
  }, []);

  //clear authentication tokens
  const clearAuthTokens = async () => {
    try {
      await AsyncStorage.multiRemove([
        "access_token",
        "role",
        "role_id",
        "user_id",
        "user_name",
        "user_email",
        "location_id",
        "location_name",
        "location_type",
        "permissions",
      ]);
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword, phone } =
      formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (selectedRoles.length === 0) {
      Alert.alert("Error", "Please select at least one role");
      return;
    }

    // Check if the selected role is allowed for the current user
    if (!allowedRoles.includes(selectedRoles[0])) {
      Alert.alert("Error", "You are not authorized to create this role");
      return;
    }

    setIsLoading(true);

    try {
      // Get the access token
      const accessToken = await AsyncStorage.getItem("access_token");
      console.log("Access Token:", accessToken);
      console.log("User Role:", userRole);
      console.log("Location ID:", locationId);

      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found");
        setIsLoading(false);
        return;
      }

      // Prepare the request data
      const requestData = {
        email: email,
        name: `${firstName} ${lastName}`,
        password: password,
        roleId: ROLE_MAPPING[selectedRoles[0]], // Using the first selected role
        locationId: locationId,
      };

      // Make the API call
      const response = await axios.post(
        `${BASE_URL}/users/register`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "User account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/users"),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage =
          error.response.data?.message || "Registration failed";
        Alert.alert("Error", errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert(
          "Error",
          "No response from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        Alert.alert("Error", "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Define the type for the field parameter
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle role selection - allow only one role for now
  const toggleRole = (role: string) => {
    // Check if the role is allowed for the current user
    if (allowedRoles.includes(role)) {
      setSelectedRoles([role]); // Only allow one role selection
    } else {
      Alert.alert("Error", "You are not authorized to create this role");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          clearAuthTokens();
          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header with Menu Button */}
      <View
        style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}
      >
        <HamburgerButton
          onPress={() => setDrawerVisible(true)}
          position="relative"
        />
      </View>

      <ScrollView contentContainerStyle={tw`flex-grow justify-center p-5`}>
        <View style={tw`items-center mb-8`}>
          <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>
            Create User Account
          </Text>
          <Text style={tw`text-gray-600 text-center`}>
            Add a new healthcare provider to the system
          </Text>
          {userRole && (
            <Text style={tw`text-purple-600 text-sm mt-2`}>
              Your role: {userRole}
            </Text>
          )}
          {allowedRoles.length > 0 && (
            <Text style={tw`text-green-600 text-xs mt-1`}>
              You can create: {allowedRoles.join(", ")}
            </Text>
          )}
        </View>

        <View style={tw`w-full`}>
          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="First Name *"
            placeholderTextColor="#999"
            value={formData.firstName}
            onChangeText={(text) => updateFormData("firstName", text)}
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Last Name *"
            placeholderTextColor="#999"
            value={formData.lastName}
            onChangeText={(text) => updateFormData("lastName", text)}
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Email *"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(text) => updateFormData("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            value={formData.phone}
            onChangeText={(text) => updateFormData("phone", text)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Password *"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            secureTextEntry
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Confirm Password *"
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData("confirmPassword", text)}
            secureTextEntry
          />

          {/* Role Selection Checkboxes */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-700 mb-2 font-medium`}>
              Select Role *
            </Text>

            {/* County User */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("county user") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("county user")}
              disabled={!allowedRoles.includes("county user")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("county user")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("county user") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>County User</Text>
            </TouchableOpacity>

            {/* Subcounty User */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("subcounty user") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("subcounty user")}
              disabled={!allowedRoles.includes("subcounty user")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("subcounty user")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("subcounty user") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>Subcounty User</Text>
            </TouchableOpacity>

            {/* Admin (Facility In-Charge) */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("admin") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("admin")}
              disabled={!allowedRoles.includes("admin")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("admin")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("admin") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>Admin (Facility In-Charge)</Text>
            </TouchableOpacity>

            {/* Nurse */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("nurse") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("nurse")}
              disabled={!allowedRoles.includes("nurse")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("nurse")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("nurse") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>Nurse</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={tw`bg-purple-600 p-4 rounded-lg items-center mt-2 shadow-lg ${
              isLoading ? "opacity-50" : ""
            }`}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={tw`text-white text-base font-bold`}>
              {isLoading ? "Creating..." : "Create User"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Enhanced Drawer */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={tw`flex-1`}>
          <TouchableOpacity
            style={tw`flex-1 bg-black bg-opacity-50`}
            onPress={() => setDrawerVisible(false)}
            activeOpacity={1}
          />

          <View
            style={tw`absolute left-0 top-0 h-full w-72 bg-white shadow-xl`}
          >
            <View style={tw`p-6 bg-purple-600`}>
              <Text style={tw`text-white text-xl font-bold`}>PeriNote</Text>
              <Text style={tw`text-purple-100 text-sm mt-1`}>
                Stillbirth Notification System
              </Text>
            </View>

            <ScrollView style={tw`flex-1 p-4`}>
              <View style={tw`mb-6`}>
                <Text
                  style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}
                >
                  Main Navigation
                </Text>

                {(userRole === "admin" ||
                  userRole === "county user" ||
                  userRole === "subcounty user") && (
                  <>
                    {/* Dashboard */}
                    <TouchableOpacity
                      style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                      onPress={() => {
                        setDrawerVisible(false);
                        router.push("/home");
                      }}
                    >
                      <Text style={tw`text-gray-700 font-medium ml-2`}>
                        🏠 Dashboard
                      </Text>
                    </TouchableOpacity>

                    {/* Users */}
                    <TouchableOpacity
                      style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                      onPress={() => {
                        setDrawerVisible(false);
                        router.push("/users");
                      }}
                    >
                      <Text style={tw`text-gray-700 font-medium ml-2`}>
                        👥 Users
                      </Text>
                    </TouchableOpacity>

                    {/* Register */}
                    <TouchableOpacity
                      style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                      onPress={() => {
                        setDrawerVisible(false);
                        router.push("/register");
                      }}
                    >
                      <Text style={tw`text-gray-700 font-medium ml-2`}>
                        📝 Register Staff
                      </Text>
                    </TouchableOpacity>

                    {/* Logout */}
                    <TouchableOpacity
                      style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                      onPress={handleLogout}
                    >
                      <Text style={tw`text-gray-700 font-medium ml-2`}>
                        🚪 Logout
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
