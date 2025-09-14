import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]); // Added state for selected roles

  useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem("role");
      setUserRole(role || "");
    };
    getUserRole();
  }, []);

  //clear authentication tokens
  const clearAuthTokens = async () => {
    try {
      await AsyncStorage.multiRemove([
        "access_token",
        "role",
        "location_name",
        "location_type",
      ]);
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  };

  const handleRegister = () => {
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

    // Simulate registration success
    Alert.alert("Success", "Registration successful!", [
      {
        text: "OK",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  // Define the type for the field parameter
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle role selection
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
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
              Select Role(s) *
            </Text>

            {/* Admin Checkbox */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2`}
              onPress={() => toggleRole("admin")}
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
              <Text style={tw`text-gray-700`}>Admin</Text>
            </TouchableOpacity>

            {/* Staff Checkbox */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2`}
              onPress={() => toggleRole("staff")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("staff")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("staff") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-700`}>Nurse</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={tw`bg-purple-600 p-4 rounded-lg items-center mt-2 shadow-lg`}
            onPress={handleRegister}
          >
            <Text style={tw`text-white text-base font-bold`}>Create User</Text>
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
