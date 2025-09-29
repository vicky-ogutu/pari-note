// components/CustomDrawer.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import tw from "tailwind-react-native-classnames";
import { ScreenName } from "../components/permissions";
import { usePermissions } from "../components/usePermissions";

interface DrawerProps {
  drawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
  handleLogout: () => void;
}

interface UserData {
  name: string;
  location: string;
  email?: string;
  subcounty?: string;
  county?: string;
}

const CustomDrawer: React.FC<DrawerProps> = ({
  drawerVisible,
  setDrawerVisible,
  handleLogout,
}) => {
  const router = useRouter();
  const { userRoles, canAccess, hasRole } = usePermissions();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      const name = await AsyncStorage.getItem("user_name");
      const location = await AsyncStorage.getItem("location_name");
      const email = await AsyncStorage.getItem("user_email");
      const subcounty = await AsyncStorage.getItem("subcounty_name");
      const county = await AsyncStorage.getItem("county_name");

      if (name || location) {
        setUserData({
          name: name || "Unknown User",
          location: location || "Unknown Location",
          email: email || undefined,
          subcounty: subcounty || undefined,
          county: county || undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching user data from AsyncStorage:", error);
    }
  };

  useEffect(() => {
    if (drawerVisible) {
      fetchUserData();
    }
  }, [drawerVisible]);

  // Function to get avatar initials
  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Function to get primary role for display (prioritize county > subcounty > nurse)
  const getPrimaryRole = (): string => {
    if (userRoles.length === 0) return "user";

    // Priority order for display
    if (userRoles.includes("county_user")) return "county_user";
    if (userRoles.includes("subcounty_user")) return "subcounty_user";
    if (userRoles.includes("nurse")) return "nurse";

    return userRoles[0];
  };

  // Function to get display name for multiple roles
  const getRolesDisplayText = (): string => {
    if (userRoles.length === 0) return "user";
    return userRoles.map((r) => r.replace("_", " ")).join(", ");
  };

  // Function to determine location display text based on user roles
  const getLocationDisplayText = () => {
    if (!userData) return "Location not set";

    // If user has multiple roles, show comprehensive location info
    if (userRoles.length > 1) {
      let locationText = "";

      if (hasRole("nurse") && userData.location) {
        locationText += userData.location;
      }

      if (hasRole("subcounty_user") && userData.subcounty) {
        if (locationText) locationText += " • ";
        locationText += userData.subcounty;
      }

      if (hasRole("county_user") && userData.county) {
        if (locationText) locationText += " • ";
        locationText += userData.county;
      }

      return locationText;
    }

    // Single role users
    const primaryRole = getPrimaryRole();

    // For nurses (facility users), show facility
    if (primaryRole === "nurse") {
      return userData.location || "Facility not set";
    }

    // For subcounty users, show subcounty and county
    if (primaryRole === "subcounty_user") {
      let locationText = userData.subcounty || "Subcounty not set";
      if (userData.county) {
        locationText += `, ${userData.county}`;
      }
      return locationText;
    }

    // For county users, show county only
    if (primaryRole === "county_user") {
      return userData.county || "County not set";
    }

    return userData.location || "Location not set";
  };

  // Handle navigation with permission check
  const handleNavigation = (screen: ScreenName) => {
    if (canAccess(screen)) {
      setDrawerVisible(false);
      router.push(`/${screen}`);
    } else {
      alert("You don't have permission to access this screen");
    }
  };

  return (
    <Modal
      visible={drawerVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setDrawerVisible(false)}
    >
      <TouchableOpacity
        style={tw`flex-1 bg-black bg-opacity-50`}
        onPress={() => setDrawerVisible(false)}
        activeOpacity={1}
      >
        <View style={tw`w-64 h-full bg-white`}>
          {/* Header with User Info */}
          <View style={tw`p-5 bg-purple-500`}>
            <View style={tw`flex-row items-center mb-3`}>
              <View
                style={tw`w-12 h-12 bg-purple-300 rounded-full items-center justify-center mr-3`}
              >
                {userData?.name ? (
                  <Text style={tw`text-purple-800 font-bold text-lg`}>
                    {getAvatarInitials(userData.name)}
                  </Text>
                ) : (
                  <Text style={tw`text-purple-800 font-bold text-lg`}>👤</Text>
                )}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-lg font-bold`}>
                  {userData?.name || "Loading..."}
                </Text>
                {userData?.email && (
                  <Text style={tw`text-purple-200 text-xs`}>
                    {userData.email}
                  </Text>
                )}
              </View>
            </View>

            <View style={tw`bg-purple-400 rounded-lg p-3`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Text style={tw`text-white text-xs`}>
                  {getLocationDisplayText()}
                </Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text
                  style={tw`text-purple-200 text-xs font-semibold capitalize`}
                >
                  {getRolesDisplayText()}
                </Text>
                {userRoles.length > 1 && (
                  <Text style={tw`text-purple-200 text-xs ml-1`}>
                    ({userRoles.length} roles)
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Navigation Menu */}
          <View style={tw`flex-1 p-4`}>
            <View style={tw`mb-6`}>
              <Text
                style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}
              >
                Main Navigation
              </Text>

              {/* Dashboard - Accessible to all roles */}
              <TouchableOpacity
                style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                onPress={() => handleNavigation("home")}
              >
                <Text style={tw`text-gray-500 font-medium ml-2`}>
                  🏠 Dashboard
                </Text>
              </TouchableOpacity>

              {/* Report Stillbirth - Accessible to all roles based on scenarios */}
              {/* Report Stillbirth - Visible only if nurse role is present */}
              {hasRole("nurse") && (
                <TouchableOpacity
                  style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                  onPress={() => handleNavigation("patient_registration")}
                >
                  <Text style={tw`text-gray-500 font-medium ml-2`}>
                    📋 Report Stillbirth
                  </Text>
                </TouchableOpacity>
              )}

              {/* User Management - hidden if ONLY nurse */}
              {!(
                userRoles.length === 1 && userRoles[0].toLowerCase() === "nurse"
              ) && (
                <View style={tw`mb-2`}>
                  {/* Register User - Accessible to county and subcounty users */}
                  {/* <Text
                    style={tw`text-gray-400 text-xs font-semibold pl-3 mb-1`}
                  >
                    User Management
                  </Text> */}

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg`}
                    onPress={() => handleNavigation("users")}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      👥 Users
                    </Text>
                  </TouchableOpacity>

                  {/* <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg`}
                    onPress={() => handleNavigation("register")}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      📝 Register Staff
                    </Text>
                  </TouchableOpacity> */}
                </View>
              )}

              {/* Logout - Always visible */}
              <TouchableOpacity
                style={tw`flex-row items-center p-50 rounded-lg mt-4`}
                onPress={handleLogout}
              >
                <Text style={tw`text-gray-500 font-medium ml-2`}>
                  🚪 Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomDrawer;
