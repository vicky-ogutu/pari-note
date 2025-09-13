// app/users.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "tailwind-react-native-classnames";
import HamburgerButton from "../components/HamburgerButton";

// User type definition - make sure to export it so it can be used in other files
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
};

// Hardcoded user data
const HARDCODED_USERS: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@htrh.com",
    phone: "+254712345678",
    role: "doctor",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@htrh.com",
    phone: "+254723456789",
    role: "nurse",
  },
  {
    id: "3",
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.j@htrh.com",
    phone: "+254734567890",
    role: "admin",
  },
  {
    id: "4",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.w@htrh.com",
    phone: "+254745678901",
    role: "data_clerk",
  },
  {
    id: "5",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.b@htrh.com",
    phone: "+254756789012",
    role: "viewer",
  },
  {
    id: "6",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.d@htrh.com",
    phone: "+254767890123",
    role: "nurse",
  },
  {
    id: "7",
    firstName: "David",
    lastName: "Wilson",
    email: "david.w@htrh.com",
    phone: "+254778901234",
    role: "doctor",
  },
  {
    id: "8",
    firstName: "Jennifer",
    lastName: "Taylor",
    email: "jennifer.t@htrh.com",
    phone: "+254789012345",
    role: "nurse",
  },
];

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>(HARDCODED_USERS);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(HARDCODED_USERS);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

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

  // Search users by phone number
  const searchUsersByPhone = () => {
    if (!searchPhone.trim()) {
      setFilteredUsers(users);
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const filtered = users.filter((user) => user.phone.includes(searchPhone));
      setFilteredUsers(filtered);
      setIsLoading(false);

      if (filtered.length === 0) {
        Alert.alert("Info", "No users found with that phone number");
      }
    }, 500);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleEditUser = (user: User) => {
    // Navigate to the edit screen with the user data
    router.push({
      pathname: "/editstaff",
      params: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  };

  const handleAddUser = () => {
    router.push("/register");
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={tw`bg-white p-4 rounded-lg mb-2 border border-gray-200 ${
        selectedUser?.id === item.id ? "border-blue-500 border-2" : ""
      }`}
      onPress={() => handleUserSelect(item)}
    >
      <Text style={tw`font-bold text-gray-800`}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={tw`text-gray-600 text-sm`}>{item.email}</Text>
      <Text style={tw`text-gray-600 text-sm`}>{item.phone}</Text>
      <Text style={tw`text-blue-600 text-xs font-medium`}>
        Role: {item.role}
      </Text>

      <TouchableOpacity
        style={tw`bg-blue-600 px-3 py-1 rounded mt-2 self-start`}
        onPress={() => handleEditUser(item)}
      >
        <Text style={tw`text-white text-xs`}>Edit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View
        style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}
      >
        <HamburgerButton
          onPress={() => setDrawerVisible(true)}
          position="relative"
        />

        <Text style={tw`text-xl font-bold text-purple-500`}>
          User Management
        </Text>
        <TouchableOpacity onPress={handleAddUser}>
          <Text>
            <Icon name="person-add" size={36} color="#682483ff" />
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View
          style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-10`}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Main Content - Using View instead of ScrollView */}
      <View style={tw`flex-1 p-5`}>
        {/* Search Section */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-bold mb-3`}>
            Search Users by Phone Number
          </Text>
          <View style={tw`flex-row`}>
            <TextInput
              style={tw`flex-1 bg-white p-3 rounded-l border border-gray-300`}
              placeholder="Enter phone number"
              value={searchPhone}
              onChangeText={setSearchPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={tw`bg-purple-500 p-3 rounded-r`}
              onPress={searchUsersByPhone}
            >
              <Text style={tw`text-white`}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`flex-1 flex-col lg:flex-row`}>
          {/* Users List - Using FlatList directly without ScrollView wrapper */}
          <View style={tw`flex-1 mb-6 lg:mb-0 lg:mr-4`}>
            <Text style={tw`text-lg font-bold mb-3`}>
              Users List ({filteredUsers.length})
            </Text>
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              style={tw`flex-1`}
              contentContainerStyle={tw`pb-4`}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-500 mt-10`}>
                  No users found
                </Text>
              }
            />
          </View>

          {/* User Details - Simplified since editing is now on a separate screen */}
          {selectedUser && (
            <View style={tw`flex-1 bg-white p-5 rounded-lg`}>
              <Text style={tw`text-lg font-bold mb-4`}>User Details</Text>

              <Text style={tw`text-gray-800 mb-2`}>
                <Text style={tw`font-bold`}>Name:</Text>{" "}
                {selectedUser.firstName} {selectedUser.lastName}
              </Text>
              <Text style={tw`text-gray-800 mb-2`}>
                <Text style={tw`font-bold`}>Email:</Text> {selectedUser.email}
              </Text>
              <Text style={tw`text-gray-800 mb-2`}>
                <Text style={tw`font-bold`}>Phone:</Text> {selectedUser.phone}
              </Text>
              <Text style={tw`text-gray-800 mb-4`}>
                <Text style={tw`font-bold`}>Role:</Text> {selectedUser.role}
              </Text>

              <TouchableOpacity
                style={tw`purple-500 px-4 py-2 rounded mb-2`}
                onPress={() => handleEditUser(selectedUser)}
              >
                <Text style={tw`text-white text-center`}>Edit User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-red-500 px-4 py-2 rounded`}
                onPress={() =>
                  Alert.alert(
                    "Info",
                    "Delete functionality would be implemented here"
                  )
                }
              >
                <Text style={tw`text-white text-center`}>Delete User</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notice */}
        {!selectedUser && (
          <View style={tw`bg-yellow-100 p-4 rounded-lg mt-6`}>
            <Text style={tw`text-yellow-800 text-center`}>
              💡 Select a user to view details or click the Edit button to
              modify user information
            </Text>
          </View>
        )}
      </View>

      {/* Drawer */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 bg-black bg-opacity-50`}
          onPress={() => setDrawerVisible(false)}
        >
          <View style={tw`w-64 h-full bg-white`}>
            <View style={tw`p-5 bg-purple-500`}>
              <Text style={tw`text-white text-lg font-bold`}>
                PeriNote Menu
              </Text>
            </View>

            <View style={tw`flex-1 p-4`}>
              <View style={tw`mb-6`}>
                <Text
                  style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}
                >
                  Main Navigation
                </Text>

                {userRole === "nurse" && (
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

                    {/* Report Stillbirth */}
                    <TouchableOpacity
                      style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                      onPress={() => {
                        setDrawerVisible(false);
                        router.push("/patient_registration");
                      }}
                    >
                      <Text style={tw`text-gray-700 font-medium ml-2`}>
                        📋 Report Stillbirth
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
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default UsersScreen;
