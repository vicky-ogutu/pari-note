// // components/CustomDrawer.tsx
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
  const { userRoles, canAccess } = usePermissions();
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

  // Function to get primary role for display
  const getPrimaryRole = (): string => {
    if (userRoles.length === 0) return "user";
    return userRoles[0];
  };

  // Function to determine location display text based on user role
  const getLocationDisplayText = () => {
    if (!userData) return "Location not set";

    const primaryRole = getPrimaryRole();

    // For nurses (facility users), show facility, subcounty, and county
    if (primaryRole === "nurse") {
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
    // Bypass permission check for patient_registration
    if (screen === "patient_registration" || canAccess(screen)) {
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
                  {getPrimaryRole().replace("_", " ")}
                </Text>
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

              {/* Report Stillbirth - Now accessible to all roles */}
              <TouchableOpacity
                style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                onPress={() => handleNavigation("patient_registration")}
              >
                <Text style={tw`text-gray-500 font-medium ml-2`}>
                  📋 Report Stillbirth
                </Text>
              </TouchableOpacity>

              {/* User Management - County/Subcounty users only */}
              {canAccess("users") && (
                <TouchableOpacity
                  style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                  onPress={() => handleNavigation("users")}
                >
                  <Text style={tw`text-gray-500 font-medium ml-2`}>
                    👥 Users
                  </Text>
                </TouchableOpacity>
              )}

              {/* Register - County/Subcounty users only */}
              {canAccess("register") && (
                <TouchableOpacity
                  style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                  onPress={() => handleNavigation("register")}
                >
                  <Text style={tw`text-gray-500 font-medium ml-2`}>
                    📝 Register
                  </Text>
                </TouchableOpacity>
              )}

              {/* Logout - Always visible */}
              <TouchableOpacity
                style={tw`flex-row items-center p-3 rounded-lg mb-2`}
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

// // components/CustomDrawer.tsx
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { Modal, Text, TouchableOpacity, View } from "react-native";
// import tw from "tailwind-react-native-classnames";
// import { ScreenName } from "../components/permissions";
// import { usePermissions } from "../components/usePermissions";

// interface DrawerProps {
//   drawerVisible: boolean;
//   setDrawerVisible: (visible: boolean) => void;
//   handleLogout: () => void;
// }

// interface UserData {
//   name: string;
//   location: string;
//   email?: string;
//   subcounty?: string;
//   county?: string;
// }

// const CustomDrawer: React.FC<DrawerProps> = ({
//   drawerVisible,
//   setDrawerVisible,
//   handleLogout,
// }) => {
//   const router = useRouter();
//   const { userRoles, canAccess } = usePermissions();
//   const [userData, setUserData] = useState<UserData | null>(null);

//   // Fetch user data from AsyncStorage
//   const fetchUserData = async () => {
//     try {
//       const name = await AsyncStorage.getItem("user_name");
//       const location = await AsyncStorage.getItem("location_name");
//       const email = await AsyncStorage.getItem("user_email");
//       const subcounty = await AsyncStorage.getItem("subcounty_name");
//       const county = await AsyncStorage.getItem("county_name");

//       if (name || location) {
//         setUserData({
//           name: name || "Unknown User",
//           location: location || "Unknown Location",
//           email: email || undefined,
//           subcounty: subcounty || undefined,
//           county: county || undefined,
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching user data from AsyncStorage:", error);
//     }
//   };

//   useEffect(() => {
//     if (drawerVisible) {
//       fetchUserData();
//     }
//   }, [drawerVisible]);

//   // Function to get avatar initials
//   const getAvatarInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase())
//       .slice(0, 2)
//       .join("");
//   };

//   // Function to get primary role for display
//   const getPrimaryRole = (): string => {
//     if (userRoles.length === 0) return "user";
//     return userRoles[0];
//   };

//   // Function to determine location display text based on user role
//   const getLocationDisplayText = () => {
//     if (!userData) return "Location not set";

//     const primaryRole = getPrimaryRole();

//     // For nurses (facility users), show facility, subcounty, and county
//     if (primaryRole === "nurse") {
//       let locationText = userData.location || "Facility not set";
//       if (userData.subcounty) {
//         locationText += `, ${userData.subcounty}`;
//       }
//       if (userData.county) {
//         locationText += `, ${userData.county}`;
//       }
//       return locationText;
//     }

//     // For subcounty users, show subcounty and county
//     if (primaryRole === "subcounty_user") {
//       let locationText = userData.subcounty || "Subcounty not set";
//       if (userData.county) {
//         locationText += `, ${userData.county}`;
//       }
//       return locationText;
//     }

//     // For county users, show county only
//     if (primaryRole === "county_user") {
//       return userData.county || "County not set";
//     }

//     return userData.location || "Location not set";
//   };

//   // Handle navigation - NO PERMISSION CHECKS
//   const handleNavigation = (screen: ScreenName) => {
//     setDrawerVisible(false);
//     router.push(`/${screen}`);
//   };

//   return (
//     <Modal
//       visible={drawerVisible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={() => setDrawerVisible(false)}
//     >
//       <TouchableOpacity
//         style={tw`flex-1 bg-black bg-opacity-50`}
//         onPress={() => setDrawerVisible(false)}
//         activeOpacity={1}
//       >
//         <View style={tw`w-64 h-full bg-white`}>
//           {/* Header with User Info */}
//           <View style={tw`p-5 bg-purple-500`}>
//             <View style={tw`flex-row items-center mb-3`}>
//               <View
//                 style={tw`w-12 h-12 bg-purple-300 rounded-full items-center justify-center mr-3`}
//               >
//                 {userData?.name ? (
//                   <Text style={tw`text-purple-800 font-bold text-lg`}>
//                     {getAvatarInitials(userData.name)}
//                   </Text>
//                 ) : (
//                   <Text style={tw`text-purple-800 font-bold text-lg`}>👤</Text>
//                 )}
//               </View>
//               <View style={tw`flex-1`}>
//                 <Text style={tw`text-white text-lg font-bold`}>
//                   {userData?.name || "Loading..."}
//                 </Text>
//                 {userData?.email && (
//                   <Text style={tw`text-purple-200 text-xs`}>
//                     {userData.email}
//                   </Text>
//                 )}
//               </View>
//             </View>

//             <View style={tw`bg-purple-400 rounded-lg p-3`}>
//               <View style={tw`flex-row items-center mb-1`}>
//                 <Text style={tw`text-white text-xs`}>
//                   {getLocationDisplayText()}
//                 </Text>
//               </View>
//               <View style={tw`flex-row items-center`}>
//                 <Text
//                   style={tw`text-purple-200 text-xs font-semibold capitalize`}
//                 >
//                   {getPrimaryRole().replace("_", " ")}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Navigation Menu - ALL ITEMS VISIBLE TO EVERYONE */}
//           <View style={tw`flex-1 p-4`}>
//             <View style={tw`mb-6`}>
//               <Text
//                 style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}
//               >
//                 Main Navigation
//               </Text>

//               {/* Dashboard - Everyone can access */}
//               <TouchableOpacity
//                 style={tw`flex-row items-center p-3 rounded-lg mb-2`}
//                 onPress={() => handleNavigation("home")}
//               >
//                 <Text style={tw`text-gray-500 font-medium ml-2`}>
//                   🏠 Dashboard
//                 </Text>
//               </TouchableOpacity>

//               {/* Report Stillbirth - Everyone can access */}
//               <TouchableOpacity
//                 style={tw`flex-row items-center p-3 rounded-lg mb-2`}
//                 onPress={() => handleNavigation("patient_registration")}
//               >
//                 <Text style={tw`text-gray-500 font-medium ml-2`}>
//                   📋 Report Stillbirth
//                 </Text>
//               </TouchableOpacity>

//               {/* Users - Everyone can access */}
//               {/* <TouchableOpacity
//                 style={tw`flex-row items-center p-3 rounded-lg mb-2`}
//                 onPress={() => handleNavigation("users")}
//               >
//                 <Text style={tw`text-gray-500 font-medium ml-2`}>👥 Users</Text>
//               </TouchableOpacity> */}

//               {/* Register - Everyone can access */}
//               {/* <TouchableOpacity
//                 style={tw`flex-row items-center p-3 rounded-lg mb-2`}
//                 onPress={() => handleNavigation("register")}
//               >
//                 <Text style={tw`text-gray-500 font-medium ml-2`}>
//                   📝 Register
//                 </Text>
//               </TouchableOpacity> */}

//               {/* Logout - Always visible */}
//               <TouchableOpacity
//                 style={tw`flex-row items-center p-3 rounded-lg mb-2`}
//                 onPress={handleLogout}
//               >
//                 <Text style={tw`text-gray-500 font-medium ml-2`}>
//                   🚪 Logout
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// export default CustomDrawer;
