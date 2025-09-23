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
  //facility: string;
  email?: string;
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
      const facility = await AsyncStorage.getItem("user_facility");
      const email = await AsyncStorage.getItem("user_email");

      if (name || location) {
        setUserData({
          name: name || "Unknown User",
          location: location || "Unknown Location",
          email: email || undefined,
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
                {/* <Text style={tw`text-purple-200 text-xs font-semibold mr-2`}>
                  
                </Text> */}
                <Text style={tw`text-white text-xs`}>
                  {userData?.location || "Location not set"}
                </Text>
              </View>
              {/* <View style={tw`flex-row items-center`}>
                <Text style={tw`text-purple-200 text-xs font-semibold mr-2`}>🏥</Text>
                <Text style={tw`text-white text-xs`}>
                  {userData?.facility || "Facility not set"}
                </Text>
              </View> */}
            </View>

            {/* <Text style={tw`text-white text-lg font-bold mt-3`}>
              MOH 369 Register
            </Text> */}
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
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomDrawer;
