// app/users.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { router } from "expo-router";
import { UserPlusIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "tailwind-react-native-classnames";
import CustomDrawer from "../components/CustomDrawer";
import HamburgerButton from "../components/HamburgerButton";
import { BASE_URL } from "../constants/ApiConfig";

//  User type definition with roles as an array
export type Role = {
  id: number;
  name: string;
  permissions: any[];
};

export type User = {
  id: number;
  email: string;
  name: string;
  phone?: string;
  roles: Role[]; // an array
  location: {
    id: number;
    name: string;
    type: string;
  };
};

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem("role");
      setUserRole(role || "");
    };
    getUserRole();
    fetchUsers();
  }, []);

  // Update search results whenever searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    useFocusEffect(
      React.useCallback(() => {
        fetchUsers();
      }, [])
    );

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roles.some((role) => role.name.toLowerCase().includes(query)) ||
        (user.phone && user.phone.includes(query))
    );

    setFilteredUsers(filtered);
  }, [searchQuery, users]); // 👈 Runs whenever searchQuery or users change

  const fetchUsers = async () => {
    try {
      setIsFetching(true);
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found");
        setIsFetching(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/users/user-location`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        "🟣 API Users Response:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.status === 200) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);

      if (error.response?.status === 401) {
        Alert.alert("Error", "Session expired. Please login again.");
        clearAuthTokens();
        router.replace("/login");
      } else if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Failed to fetch users. Please try again.");
      }
    } finally {
      setIsFetching(false);
    }
  };

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

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleEditUser = (user: User) => {
    const roleNames = user.roles.map((r) => r.name);
    const roleIds = user.roles.map((r) => r.id);

    router.push({
      pathname: "/editstaff",
      params: {
        userId: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        roles: JSON.stringify(roleNames),
        roleIds: JSON.stringify(roleIds),
        locationId: user.location.id.toString(),
        locationName: user.location.name,
      },
    });
  };
  const handleAddUser = () => {
    router.push("/register");
  };

  // --- add this handler ---
  const handleDeleteUser = async (user: User) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem("access_token");
              if (!accessToken) {
                Alert.alert("Error", "Authentication token not found");
                return;
              }

              await axios.delete(`${BASE_URL}/users/delete/${user.id}`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              });

              Alert.alert("Success", "User deleted successfully");
              fetchUsers(); // refresh list
            } catch (error: any) {
              console.error("Error deleting user:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete user. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const formatRoles = (roles: Role[]) => {
    if (!roles || roles.length === 0) return "No role assigned";

    return roles
      .map((r) =>
        r.name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      )
      .join(", ");
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={tw`bg-white p-4 rounded-lg mb-2 border border-gray-200 ${
        selectedUser?.id === item.id ? "border-purple-500 border-2" : ""
      }`}
      onPress={() => handleUserSelect(item)}
    >
      <Text style={tw`font-bold text-gray-500`}>{item.name}</Text>
      <Text style={tw`text-gray-500 text-sm`}>{item.email}</Text>
      {item.phone && (
        <Text style={tw`text-gray-500 text-sm`}>{item.phone}</Text>
      )}
      <Text style={tw`text-purple-500 text-xs font-medium`}>
        Roles: {formatRoles(item.roles)}
      </Text>
      <Text style={tw`text-green-600 text-xs font-medium`}>
        Location: {item.location.name} ({item.location.type})
      </Text>

      <View style={tw`flex-row mt-2`}>
        {/* Edit Button */}
        <TouchableOpacity
          style={tw`flex-1 bg-purple-500 px-3 py-2 rounded mr-2 items-center`}
          onPress={() => handleEditUser(item)}
        >
          <Text style={tw`text-white text-xs font-semibold`}>Edit</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={tw`flex-1 bg-red-500 px-3 py-2 rounded items-center`}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={tw`text-white text-xs font-semibold`}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isFetching) {
    return (
      <View style={tw`flex-1 bg-gray-100 justify-center items-center`}>
        <ActivityIndicator size="large" color="#682483" />
        <Text style={tw`mt-4 text-gray-500`}>Loading users...</Text>
      </View>
    );
  }

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
            <UserPlusIcon style={tw`h-5 w-5`} color="#682483ff" />
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

      {/* Main Content */}
      <View style={tw`flex-1 p-5`}>
        <TextInput
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery} //filtering dynamically
          style={tw`border border-gray-300 rounded p-2 mb-3`}
        />
        <View style={tw`flex-1 flex-col lg:flex-row`}>
          {/* Users List */}
          <View style={tw`flex-1 mb-6 lg:mb-0 lg:mr-4`}>
            <View style={tw`flex-row justify-between items-center mb-3`}>
              {/* <Text style={tw`text-lg font-bold text-gray-500`}>
                Users List ({filteredUsers.length})
              </Text> */}
            </View>
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
              style={tw`flex-1`}
              contentContainerStyle={tw`pb-4`}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-500 mt-10`}>
                  {users.length === 0
                    ? "No users found"
                    : "No users match your search"}
                </Text>
              }
              refreshing={isFetching}
              onRefresh={fetchUsers}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={fetchUsers}
          style={[
            tw`bg-purple-500 p-4 rounded-full shadow-lg`,
            {
              position: "absolute",
              bottom: 20,
              right: 20,
            },
          ]}
        >
          <Icon name="refresh" size={20} color="#682483" />
        </TouchableOpacity>
      </View>

      {/* Custom Drawer */}
      <CustomDrawer
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        handleLogout={handleLogout}
      />
    </View>
  );
};

export default UsersScreen;
