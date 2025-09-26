import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { UserPlusIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import tw from "tailwind-react-native-classnames";
import CustomDrawer from "../components/CustomDrawer";
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
const ROLE_MAPPING: { [key: string]: number } = {
  "county user": 2,
  "subcounty user": 3,
  admin: 1, // facility in-charge admin
  nurse: 4, // HCW
};

// Who can create whom
const ROLE_HIERARCHY: { [key: string]: string[] } = {
  "county user": ["subcounty user", "admin", "nurse"],
  "subcounty user": ["admin", "nurse"],
  admin: ["nurse"],
  nurse: [],
};

// Define location type
interface Location {
  id: number;
  name: string;
  type: string;
}

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const role = await AsyncStorage.getItem("role");
        const locationIdStr = await AsyncStorage.getItem("location_id");
        const locationName = await AsyncStorage.getItem("location_name");
        const locationType = await AsyncStorage.getItem("location_type");
        const subcountyId = await AsyncStorage.getItem("subcounty_id");
        const subcountyName = await AsyncStorage.getItem("subcounty_name");
        const countyId = await AsyncStorage.getItem("county_id");
        const countyName = await AsyncStorage.getItem("county_name");

        console.log("Current user role from storage:", role);
        setUserRole(role || "");
        setLocationId(locationIdStr ? parseInt(locationIdStr) : null);

        // Set allowed roles based on current user's role
        if (role && ROLE_HIERARCHY[role]) {
          console.log("Allowed roles for", role, ":", ROLE_HIERARCHY[role]);
          setAllowedRoles(ROLE_HIERARCHY[role]);
        } else {
          console.log("No allowed roles for role:", role);
          setAllowedRoles([]);
        }

        // Build available locations from stored data
        const availableLocations: Location[] = [];

        // Add current location if available
        if (locationIdStr && locationName && locationType) {
          availableLocations.push({
            id: parseInt(locationIdStr),
            name: locationName,
            type: locationType,
          });
        }

        // Add subcounty if available
        if (subcountyId && subcountyName) {
          availableLocations.push({
            id: parseInt(subcountyId),
            name: subcountyName,
            type: "subcounty",
          });
        }

        // Add county if available
        if (countyId && countyName) {
          availableLocations.push({
            id: parseInt(countyId),
            name: countyName,
            type: "county",
          });
        }

        setLocations(availableLocations);

        // Set default selected location to current location
        if (locationIdStr) {
          setSelectedLocation(parseInt(locationIdStr));
        } else if (availableLocations.length > 0) {
          setSelectedLocation(availableLocations[0].id);
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
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
        "subcounty_id",
        "subcounty_name",
        "county_id",
        "county_name",
      ]);
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  };

  const handleAddUser = () => {
    router.push("/register");
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

    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location");
      return;
    }

    console.log("Current User Role:", userRole);
    console.log("Allowed Roles for Current User:", allowedRoles);

    // Check if all selected roles are allowed for the current user
    const unauthorizedRoles = selectedRoles.filter(
      (role) => !allowedRoles.includes(role)
    );
    if (unauthorizedRoles.length > 0) {
      Alert.alert(
        "Error",
        `You are not authorized to create these roles: ${unauthorizedRoles.join(
          ", "
        )}`
      );
      return;
    }

    setIsLoading(true);

    try {
      // Get the access token
      const accessToken = await AsyncStorage.getItem("access_token");
      console.log("Access Token:", accessToken);
      console.log("User Role:", userRole);
      console.log("Selected Location ID:", selectedLocation);

      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found");
        setIsLoading(false);
        return;
      }

      // Prepare the request data for multiple roles
      const requestData = {
        email: email,
        name: `${firstName} ${lastName}`,
        password: password,
        roleIds: selectedRoles.map((role) => ROLE_MAPPING[role]), // Send array of role IDs
        locationId: selectedLocation, // Use the selected location instead of current user's location
      };

      console.log("Request Data:", requestData);

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

  // Handle role selection - allow multiple roles
  const toggleRole = (role: string) => {
    // Check if the role is allowed for the current user
    if (!allowedRoles.includes(role)) {
      Alert.alert("Error", "You are not authorized to create this role");
      return;
    }

    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        // Remove role if already selected
        return prev.filter((r) => r !== role);
      } else {
        // Add role if not selected
        return [...prev, role];
      }
    });
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
      {/* Header with Menu Button - Updated UI from second file */}
      <View
        style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}
      >
        <HamburgerButton
          onPress={() => setDrawerVisible(true)}
          position="relative"
        />
        <Text style={tw`text-2xl font-bold text-purple-500`}>Create user</Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={handleAddUser}>
            <UserPlusIcon color="#682483ff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={tw`flex-grow justify-center p-5`}>
        <View style={tw`items-center mb-8`}>
          <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>
            Create User Account
          </Text>
          {userRole && (
            <Text style={tw`text-purple-600 text-sm mt-1`}>
              Logged in as: {userRole}
            </Text>
          )}
          {allowedRoles.length > 0 && (
            <Text style={tw`text-green-600 text-xs mt-1`}>
              You can create: {allowedRoles.join(", ")}
            </Text>
          )}
          {selectedRoles.length > 0 && (
            <Text style={tw`text-blue-600 text-xs mt-1`}>
              Selected: {selectedRoles.join(", ")}
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

          {/* Location Dropdown */}
          {locations.length > 0 && (
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-500 mb-2 font-medium`}>
                Select Location *
              </Text>
              <Dropdown
                style={[
                  tw`bg-gray-100 p-4 rounded-lg border border-gray-300`,
                  isFocus && { borderColor: "blue" },
                ]}
                placeholderStyle={tw`text-gray-500`}
                selectedTextStyle={tw`text-gray-500`}
                inputSearchStyle={tw`h-10 text-gray-500`}
                data={locations.map((loc) => ({
                  label: `${loc.name} (${loc.type})`,
                  value: loc.id,
                }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? "Select location" : "..."}
                searchPlaceholder="Search..."
                value={selectedLocation}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setSelectedLocation(item.value);
                  setIsFocus(false);
                }}
              />
            </View>
          )}

          {/* Role Selection Checkboxes */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-500 mb-2 font-medium`}>
              Select Role(s) *
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
                  <Text style={tw`text-white font-sm`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-500`}>County admin</Text>
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
              <Text style={tw`text-gray-500`}>Subcounty admin</Text>
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
              <Text style={tw`text-gray-500`}>Facility in-charge</Text>
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
              <Text style={tw`text-gray-500`}>HCW</Text>
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

      {/* Custom Drawer */}
      <CustomDrawer
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        handleLogout={handleLogout}
      />
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
