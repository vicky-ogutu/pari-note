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
import Ionicons from "react-native-vector-icons/Ionicons";
import tw from "tailwind-react-native-classnames";
import CustomDrawer from "../components/CustomDrawer";
import HamburgerButton from "../components/HamburgerButton";
import { BASE_URL } from "../constants/ApiConfig";

// Types
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

interface Location {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  children: Location[];
}

interface LocationOption {
  label: string;
  value: string;
  type: string;
  level: number;
  parentId?: string | null;
  isBackOption?: boolean;
}

// Constants
const ROLE_MAPPING: { [key: string]: number } = {
  "county user": 2,
  "subcounty user": 3,
  admin: 1,
  nurse: 4,
};

const ROLE_HIERARCHY: { [key: string]: string[] } = {
  "county user": ["county user", "subcounty user", "admin", "nurse"],
  "subcounty user": ["subcounty user", "admin", "nurse"],
  admin: ["admin", "nurse"],
  nurse: ["nurse"],
};

const ROLE_DISPLAY_NAMES: { [key: string]: string } = {
  "county user": "County Admin",
  "subcounty user": "Subcounty Admin",
  admin: "Facility In-Charge",
  nurse: "HCW",
};

const RegisterScreen = () => {
  // State
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
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [locationTree, setLocationTree] = useState<Location | null>(null);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedLocationPath, setSelectedLocationPath] = useState<Location[]>([]);
  const [isFocus, setIsFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dropdownKey, setDropdownKey] = useState(0);

  // Effects
  useEffect(() => {
    initializeUserData();
  }, []);

  useEffect(() => {
    if (locationTree) {
      buildLocationOptions();
    }
  }, [locationTree, selectedLocationPath]);

  // Functions
  const initializeUserData = async () => {
    try {
      const [storedRoles, userId] = await Promise.all([
        AsyncStorage.getItem("roles"),
        AsyncStorage.getItem("user_id"),
      ]);

      const parsedRoles: string[] = storedRoles ? JSON.parse(storedRoles) : [];
      setUserRole(parsedRoles.join(", "));

      // Set allowed roles
      const combinedRoles = new Set<string>();
      parsedRoles.forEach((role) => {
        const normalized = role.toLowerCase().trim();
        const allowed = ROLE_HIERARCHY[normalized] || [];
        allowed.forEach((ar) => combinedRoles.add(ar));
      });
      setAllowedRoles(Array.from(combinedRoles));

      // Load location tree if user ID exists
      if (userId) {
        await loadLocationTree(userId);
      }
    } catch (error) {
      console.error("Error initializing user data:", error);
      Alert.alert("Error", "Failed to initialize user data");
    }
  };

  const loadLocationTree = async (userId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token available");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/users/${userId}/location-tree`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data) {
        // Handle both response formats
        const locationData = response.data.location || response.data;
        setLocationTree(locationData);
        // Set initial selected location to the root
        setSelectedLocation(locationData.id.toString());
        setSelectedLocationPath([locationData]);
        setDropdownKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error loading location tree:", error);
      Alert.alert("Error", "Failed to load location data");
    }
  };

  const buildLocationOptions = () => {
    if (!locationTree) return;

    let currentLevel = locationTree;
    const path = [...selectedLocationPath];

    // Navigate to the current level based on selected path
    for (let i = 1; i < path.length; i++) {
      const nextLocation = path[i];
      const childLocation = currentLevel.children.find(
        (child) => child.id === nextLocation.id
      );
      if (childLocation) {
        currentLevel = childLocation;
      }
    }

    const options: LocationOption[] = [];

    // Add "Back" option if we're not at the root level
    if (path.length > 1) {
      options.push({
        label: `← Back to ${path[path.length - 2].name}`,
        value: 'back',
        type: 'back',
        level: path.length - 2,
        isBackOption: true
      });
    }

    // Add current level children
    if (currentLevel.children && currentLevel.children.length > 0) {
      options.push(
        ...currentLevel.children.map((child) => ({
          label: `${child.name} (${child.type})`,
          value: child.id.toString(),
          type: child.type,
          level: path.length,
          parentId: child.parentId,
        }))
      );
    }

    // Add option to select current level if it has no children or is the last level
    if (!currentLevel.children || currentLevel.children.length === 0 || isLowestLevel(currentLevel)) {
      options.push({
        label: `Select ${currentLevel.name}`,
        value: currentLevel.id.toString(),
        type: currentLevel.type,
        level: path.length - 1,
        parentId: currentLevel.parentId,
      });
    }

    console.log("Location options built:", options);
    setLocationOptions(options);
    setDropdownKey(prev => prev + 1);
  };

  const isLowestLevel = (location: Location): boolean => {
    return location.type === "facility" || !location.children || location.children.length === 0;
  };

  const handleLocationSelect = (locationId: string) => {
    if (!locationTree) return;

    if (locationId === 'back') {
      if (selectedLocationPath.length > 1) {
        const newPath = selectedLocationPath.slice(0, -1);
        const newLocation = newPath[newPath.length - 1];
        setSelectedLocationPath(newPath);
        setSelectedLocation(newLocation.id.toString());
      }
      return;
    }

    const findLocationPath = (
      current: Location,
      targetId: string,
      path: Location[] = []
    ): Location[] | null => {
      const newPath = [...path, current];

      if (current.id.toString() === targetId) {
        return newPath;
      }

      if (current.children) {
        for (const child of current.children) {
          const result = findLocationPath(child, targetId, newPath);
          if (result) return result;
        }
      }

      return null;
    };

    const newPath = findLocationPath(locationTree, locationId);
    if (newPath) {
      setSelectedLocationPath(newPath);
      setSelectedLocation(locationId);
    }
  };

  const handleLocationChange = (item: LocationOption) => {
    if (item && item.value) {
      console.log("Location selected:", item);
      handleLocationSelect(item.value);
    }
    setIsFocus(false);
  };

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

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRole = (role: string) => {
    if (!allowedRoles.includes(role)) {
      Alert.alert("Error", "You are not authorized to create this role");
      return;
    }

    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const validateForm = (): boolean => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }

    if (selectedRoles.length === 0) {
      Alert.alert("Error", "Please select at least one role");
      return false;
    }

    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location");
      return false;
    }

    const unauthorizedRoles = selectedRoles.filter(
      (role) => !allowedRoles.includes(role)
    );
    if (unauthorizedRoles.length > 0) {
      Alert.alert(
        "Error",
        `You are not authorized to create these roles: ${unauthorizedRoles.join(", ")}`
      );
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const requestData = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        password: formData.password,
        roleIds: selectedRoles.map((role) => ROLE_MAPPING[role]),
        locationId: selectedLocation,
        phone: formData.phone || undefined,
      };

      console.log("Registration request data:", requestData);

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
      const errorMessage = error.response?.data?.message || 
        error.request ? "No response from server" : "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await clearAuthTokens();
          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  const renderRoleCheckbox = (role: string, displayName: string) => (
    <TouchableOpacity
      style={tw`flex-row items-center mb-3 ${
        !allowedRoles.includes(role) ? "opacity-50" : ""
      }`}
      onPress={() => toggleRole(role)}
      disabled={!allowedRoles.includes(role)}
    >
      <View
        style={tw`w-6 h-6 border border-gray-400 rounded-md mr-3 justify-center items-center ${
          selectedRoles.includes(role)
            ? "bg-purple-600 border-purple-600"
            : "bg-white"
        }`}
      >
        {selectedRoles.includes(role) && (
          <Ionicons name="checkmark" size={16} color="white" />
        )}
      </View>
      <Text style={tw`text-gray-700`}>{displayName}</Text>
    </TouchableOpacity>
  );

  const renderInputField = (
    field: keyof FormData,
    placeholder: string,
    options: any = {}
  ) => (
    <TextInput
      style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={formData[field]}
      onChangeText={(text) => updateFormData(field, text)}
      {...options}
    />
  );

  const renderPasswordField = (field: keyof FormData, placeholder: string) => (
    <View style={tw`relative mb-4`}>
      <TextInput
        style={tw`bg-gray-100 p-4 rounded-lg border border-gray-300 pr-12`}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={formData[field]}
        onChangeText={(text) => updateFormData(field, text)}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity
        style={tw`absolute right-3 top-4`}
        onPress={() => setShowPassword((prev) => !prev)}
      >
        <Ionicons
          name={showPassword ? "eye-off" : "eye"}
          size={22}
          color="#666"
        />
      </TouchableOpacity>
    </View>
  );

  const renderLocationItem = (item: LocationOption) => (
    <View style={tw`p-4 border-b border-gray-200 ${
      item.isBackOption ? 'bg-gray-50' : ''
    }`}>
      <Text style={tw`text-gray-700 text-base ${
        item.isBackOption ? 'text-purple-600 font-medium' : ''
      }`}>
        {item.label}
      </Text>
      {!item.isBackOption && (
        <Text style={tw`text-gray-500 text-xs mt-1`}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}>
        <HamburgerButton onPress={() => setDrawerVisible(true)} position="relative" />
        <Text style={tw`text-2xl font-bold text-purple-500`}>Create user</Text>
        <TouchableOpacity onPress={handleAddUser}>
          <UserPlusIcon color="#682483" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={tw`flex-grow p-5`}>
        <View style={tw`w-full`}>
          {/* Personal Information */}
          <Text style={tw`text-lg font-bold text-gray-500 mb-4`}>Personal Information</Text>
          
          {renderInputField("firstName", "First Name *")}
          {renderInputField("lastName", "Last Name *")}
          {renderInputField("email", "Email *", {
            keyboardType: "email-address",
            autoCapitalize: "none",
          })}
          {renderInputField("phone", "Phone Number", {
            keyboardType: "phone-pad",
          })}

          {/* Password Section */}
          <Text style={tw`text-lg font-bold text-gray-500 mb-4 mt-2`}>Security</Text>
          {renderPasswordField("password", "Password *")}
          {renderPasswordField("confirmPassword", "Confirm Password *")}

          {/* Location Selection */}
          <Text style={tw`text-lg font-bold text-gray-500 mb-4 mt-2`}>Location & Role</Text>
          
          {locationOptions.length > 0 ? (
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-700 mb-2 font-medium`}>Select Location *</Text>
              <Dropdown
                key={dropdownKey}
                style={[
                  tw`bg-gray-100 p-4 rounded-lg border border-gray-300 min-h-16`,
                  isFocus && { borderColor: "#682483", borderWidth: 2 },
                ]}
                placeholderStyle={tw`text-gray-500 text-base`}
                selectedTextStyle={tw`text-gray-700 text-base`}
                inputSearchStyle={tw`h-12 text-gray-700 text-base`}
                itemTextStyle={tw`text-gray-700 text-base`}
                containerStyle={tw`rounded-lg border border-gray-300 shadow-lg`}
                data={locationOptions}
                search
                maxHeight={400}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? "Select location" : "..."}
                searchPlaceholder="Search locations..."
                value={selectedLocation}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={handleLocationChange}
                renderItem={renderLocationItem}
              />
              {selectedLocationPath.length > 0 && (
                <View style={tw`flex-row flex-wrap mt-2`}>
                  <Text style={tw`text-gray-600 text-sm mr-1`}>Path: </Text>
                  {selectedLocationPath.map((loc, index) => (
                    <TouchableOpacity
                      key={loc.id}
                      onPress={() => {
                        if (index < selectedLocationPath.length - 1) {
                          const newPath = selectedLocationPath.slice(0, index + 1);
                          const newLocation = newPath[newPath.length - 1];
                          setSelectedLocationPath(newPath);
                          setSelectedLocation(newLocation.id.toString());
                        }
                      }}
                    >
                      <Text style={tw`text-purple-600 text-sm ${
                        index < selectedLocationPath.length - 1 ? 'underline' : 'font-medium'
                      }`}>
                        {loc.name}
                        {index < selectedLocationPath.length - 1 && " > "}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-700 mb-2 font-medium`}>Select Location *</Text>
              <View style={tw`bg-gray-100 p-4 rounded-lg border border-gray-300 min-h-16 justify-center`}>
                <Text style={tw`text-gray-500 text-base`}>
                  {locationTree ? "Loading locations..." : "No locations available"}
                </Text>
              </View>
            </View>
          )}

          {/* Role Selection */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-700 mb-3 font-medium`}>Select Role(s) *</Text>
            {renderRoleCheckbox("county user", ROLE_DISPLAY_NAMES["county user"])}
            {renderRoleCheckbox("subcounty user", ROLE_DISPLAY_NAMES["subcounty user"])}
            {renderRoleCheckbox("admin", ROLE_DISPLAY_NAMES["admin"])}
            {renderRoleCheckbox("nurse", ROLE_DISPLAY_NAMES["nurse"])}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={tw`bg-purple-600 p-4 rounded-lg items-center mt-4 shadow-lg ${
              isLoading ? "opacity-50" : ""
            }`}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={tw`text-white text-lg font-bold`}>
              {isLoading ? "Creating User..." : "Create User"}
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