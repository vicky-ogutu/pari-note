import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // Import axios
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
const ROLE_MAPPING: { [key: string]: number } = {
  "county-admin": 1, //2
  "subcounty-admin": 2, //3
  "facility-incharge-admin": 3, //1
  HCW: 4, //nurse ok
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

  useEffect(() => {
    const getUserData = async () => {
      const role = await AsyncStorage.getItem("role");
      const locationIdStr = await AsyncStorage.getItem("location_id");
      setUserRole(role || "");
      setLocationId(locationIdStr ? parseInt(locationIdStr) : null);
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

    // if (!locationId) {
    //   Alert.alert("Error", "Location information not found");
    //   return;
    // }

    setIsLoading(true);

    try {
      // Get the access token
      const accessToken = await AsyncStorage.getItem("access_token");

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
        "http://localhost:3000/users/register",
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
    setSelectedRoles([role]); // Only allow one role selection
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

            {/* County Admin */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2`}
              onPress={() => toggleRole("county-admin")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("county-admin")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("county-admin") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>County Admin</Text>
            </TouchableOpacity>

            {/* Subcounty Admin */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2`}
              onPress={() => toggleRole("subcounty-admin")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("subcounty-admin")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("subcounty-admin") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>Subcounty Admin</Text>
            </TouchableOpacity>

            {/* Facility In-Charge Admin */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2`}
              onPress={() => toggleRole("facility-incharge-admin")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("facility-incharge-admin")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("facility-incharge-admin") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>Facility In-Charge Admin</Text>
            </TouchableOpacity>

            {/* HCW (Nurse) */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2`}
              onPress={() => toggleRole("HCW")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("HCW")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("HCW") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>HCW (Nurse)</Text>
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
                Hospital Management System
              </Text>
            </View>

            <ScrollView style={tw`flex-1 p-4`}>
              <View style={tw`mb-6`}>
                <Text
                  style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}
                >
                  Main Navigation
                </Text>

                {userRole === "admin" && (
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
