import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import tw from "tailwind-react-native-classnames";

interface DrawerProps {
  drawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
  userRole: string;
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
  userRole,
  handleLogout,
}) => {
  const router = useRouter();
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

  // Function to determine location display text based on user role
  const getLocationDisplayText = () => {
    if (!userData) return "Location not set";

    // For nurses (facility users), show facility, subcounty, and county
    if (userRole === "nurse") {
      let locationText = userData.location || "Facility not set";
      if (userData.subcounty) {
        locationText += `, ${userData.subcounty}`;
      }
      if (userData.county) {
        locationText += `, ${userData.county}`;
      }
      return locationText;
    }

    // For subcounty users, show subcounty and county
    if (userRole === "subcounty user") {
      let locationText = userData.subcounty || "Subcounty not set";
      if (userData.county) {
        locationText += `, ${userData.county}`;
      }
      return locationText;
    }

    // For county users, show county only
    if (userRole === "county user") {
      return userData.county || "County not set";
    }

    // For admin, show the primary location or all locations
    if (userRole === "admin") {
      return userData.location || "Admin Access";
    }

    return userData.location || "Location not set";
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
              {/* Avatar */}
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

            {/* User Details */}
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
                  {userRole || "user"}
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={tw`flex-1 p-4`}>
            <View style={tw`mb-6`}>
              <Text
                style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}
              >
                Main Navigation
              </Text>

              {/* Nurse Menu */}
              {userRole === "nurse" && (
                <>
                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/home");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🏠 Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/patient_registration");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      📋 Report Stillbirth
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={handleLogout}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🚪 Logout
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Admin/County/Subcounty Menu */}
              {(userRole === "admin" ||
                userRole === "county user" ||
                userRole === "subcounty user") && (
                <>
                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/home");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🏠 Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/users");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      👥 Users
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={handleLogout}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🚪 Logout
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Fallback for unknown roles */}
              {!["nurse", "admin", "county user", "subcounty user"].includes(
                userRole
              ) && (
                <>
                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/home");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🏠 Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={handleLogout}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🚪 Logout
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomDrawer;
