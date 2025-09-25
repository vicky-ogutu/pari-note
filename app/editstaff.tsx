// app/editstaff.tsx
import HamburgerButton from "@/components/HamburgerButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
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
import tw from "tailwind-react-native-classnames";
import CustomDrawer from "../components/CustomDrawer";
import { BASE_URL } from "../constants/ApiConfig";

const EditStaffScreen = () => {
  const params = useLocalSearchParams();

  const [formData, setFormData] = useState({
    name: (params.name as string) || "",
    email: (params.email as string) || "",
    password: "",
    location_id: (params.locationId as string) || "",
  });

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

  const [isLoading, setIsLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);

  // All roles
  const allRoles = [
    { id: 1, name: "admin", displayName: "Facility in-charge" },
    { id: 2, name: "county user", displayName: "County admin" },
    { id: 3, name: "subcounty user", displayName: "Subcounty admin" },
    { id: 4, name: "nurse", displayName: "HCW" },
  ];

  useEffect(() => {
    getCurrentUserRole();
    // Initialize selected roles from params
    if (params.role) {
      setSelectedRoles([params.role as string]);
    }
  }, []);

  useEffect(() => {
    if (currentUserRole) {
      setAllowedRoles(getAllowedRoles(currentUserRole));
    }
  }, [currentUserRole]);

  const getCurrentUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem("role");
      setCurrentUserRole(role || "");
    } catch (error) {
      console.error("Error getting user role:", error);
    }
  };

  const getAllowedRoles = (userRole: string): string[] => {
    switch (userRole) {
      case "county user":
        return ["subcounty user", "admin", "nurse"];
      case "subcounty user":
        return ["admin", "nurse"];
      case "admin":
        return ["nurse"];
      case "nurse":
        return [];
      default:
        return [];
    }
  };

  const handleUpdate = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.location_id ||
      selectedRoles.length === 0
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const roleIds = selectedRoles
      .map((roleName) => allRoles.find((role) => role.name === roleName)?.id)
      .filter((id): id is number => id !== undefined);

    if (roleIds.length === 0) {
      Alert.alert("Error", "Invalid role selection");
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const userId = params.userId as string;

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        location_id: parseInt(formData.location_id),
        role_ids: roleIds, // send multiple roles
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put(
        `${BASE_URL}/users/${userId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "User updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (roleName: string) => {
    if (!allowedRoles.includes(roleName)) {
      Alert.alert("Error", "You are not authorized to assign this role");
      return;
    }

    setSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        return prev.filter((role) => role !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = () => {
    router.push("/register");
  };

  // Get display name for role
  const getRoleDisplayName = (roleName: string) => {
    const role = allRoles.find((r) => r.name === roleName);
    return role ? role.displayName : roleName;
  };

  const isRoleAllowed = (roleName: string) => {
    return allowedRoles.includes(roleName);
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
        <Text style={tw`text-2xl font-bold text-purple-500`}>Edit User</Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={handleAddUser}>
            <UserPlusIcon color="#682483ff" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={tw`flex-1 bg-gray-100`}
        contentContainerStyle={tw`p-5`}
      >
        <View style={tw`bg-white p-5 rounded-lg`}>
          <Text style={tw`text-lg font-semibold mb-4 text-gray-500`}>
            Edit User Details
          </Text>

          {/* Name Input */}
          <TextInput
            style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300 text-gray-500`}
            placeholder="Full Name *"
            value={formData.name}
            onChangeText={(text) => updateField("name", text)}
          />

          {/* Email Input */}
          <TextInput
            style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300 text-gray-500`}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => updateField("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300 text-gray-500`}
            placeholder="Password (leave blank to keep current)"
            value={formData.password}
            onChangeText={(text) => updateField("password", text)}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Location Display (read-only since it's passed from parent) */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-500 mb-2 font-medium`}>Location</Text>
            <View style={tw`bg-gray-100 p-3 rounded border border-gray-300`}>
              <Text style={tw`text-gray-500`}>{params.locationName}</Text>
            </View>
            <Text style={tw`text-xs text-gray-400 mt-1`}>
              Location cannot be changed from this screen
            </Text>
          </View>

          {/* Role Selection Checkboxes */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 mb-2 font-medium`}>
              Select Roles *
            </Text>
            <Text style={tw`text-xs text-gray-400 mb-3`}>
              Current user role: {currentUserRole}
            </Text>

            {allRoles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={tw`flex-row items-center mb-2 ${
                  !isRoleAllowed(role.name) ? "opacity-50" : ""
                }`}
                onPress={() => toggleRole(role.name)}
                disabled={!isRoleAllowed(role.name)}
              >
                <View
                  style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                    selectedRoles.includes(role.name)
                      ? "bg-purple-600 border-purple-600"
                      : "bg-white"
                  }`}
                >
                  {selectedRoles.includes(role.name) && (
                    <Text style={tw`text-white text-sm`}>✓</Text>
                  )}
                </View>
                <Text style={tw`text-gray-500`}>
                  {role.displayName}
                  {!isRoleAllowed(role.name) && " (Not authorized)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Selection Display */}
          {selectedRoles.length > 0 && (
            <View
              style={tw`bg-blue-50 p-3 rounded mb-4 border border-blue-200`}
            >
              <Text style={tw`text-blue-800 text-sm font-bold mb-1`}>
                Selected Roles:
              </Text>
              {selectedRoles.map((role, index) => (
                <Text key={index} style={tw`text-blue-800 text-sm`}>
                  • {getRoleDisplayName(role)}
                </Text>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={tw`flex-row justify-between`}>
            <TouchableOpacity
              style={tw`bg-gray-500 px-4 py-3 rounded flex-1 mr-2`}
              onPress={() => router.back()}
            >
              <Text style={tw`text-white text-center`}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-purple-600 px-4 py-3 rounded flex-1 ml-2`}
              onPress={handleUpdate}
              disabled={isLoading}
            >
              <Text style={tw`text-white text-center`}>
                {isLoading ? "Updating..." : "Update User"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomDrawer
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        userRole={currentUserRole}
        handleLogout={handleLogout}
      />
    </KeyboardAvoidingView>
  );
};

export default EditStaffScreen;
