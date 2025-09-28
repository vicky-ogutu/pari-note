// app/users.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { UserPlusIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
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
  roles: Role[]; // <-- now it's an array
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

  // Search users by name, email, or role
  const searchUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    setIsLoading(true);

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roles.some((role) => role.name.toLowerCase().includes(query)) ||
        (user.phone && user.phone.includes(query))
    );

    setFilteredUsers(filtered);
    setIsLoading(false);

    if (filtered.length === 0) {
      Alert.alert("Info", "No users found matching your search");
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleEditUser = (user: User) => {
    const primaryRole = user.roles[0]; // pick first role for now

    router.push({
      pathname: "/editstaff",
      params: {
        userId: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: primaryRole?.name || "",
        roleId: primaryRole?.id?.toString() || "",
        locationId: user.location.id.toString(),
        locationName: user.location.name,
      },
    });
  };

  const handleAddUser = () => {
    router.push("/register");
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

      <TouchableOpacity
        style={tw`bg-purple-500 px-3 py-1 rounded mt-2 self-start`}
        onPress={() => handleEditUser(item)}
      >
        <Text style={tw`text-white text-xs`}>Edit</Text>
      </TouchableOpacity>
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
        {/* Search Section */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-bold mb-3 text-gray-500`}>
            Search Users
          </Text>
          <View style={tw`flex-row`}>
            <TextInput
              style={tw`flex-1 bg-white p-3 text-gray-500 rounded-l border border-gray-300`}
              placeholder="Search by name, email, role, or phone"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchUsers}
            />
            <TouchableOpacity
              style={tw`bg-purple-500 p-3 rounded-r`}
              onPress={searchUsers}
            >
              <Text style={tw`text-white`}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`flex-1 flex-col lg:flex-row`}>
          {/* Users List */}
          <View style={tw`flex-1 mb-6 lg:mb-0 lg:mr-4`}>
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={tw`text-lg font-bold text-gray-500`}>
                Users List ({filteredUsers.length})
              </Text>
              <TouchableOpacity onPress={fetchUsers} style={tw`p-2`}>
                <Icon name="refresh" size={20} color="#682483" />
              </TouchableOpacity>
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

          {/* User Details */}
          {selectedUser && (
            <View style={tw`flex-1 bg-white p-5 rounded-lg`}>
              <Text style={tw`text-lg font-bold mb-4 text-gray-500`}>
                User Details
              </Text>

              <Text style={tw`text-gray-500 mb-2`}>
                <Text style={tw`font-bold`}>Name:</Text> {selectedUser.name}
              </Text>
              <Text style={tw`text-gray-500 mb-2`}>
                <Text style={tw`font-bold`}>Email:</Text> {selectedUser.email}
              </Text>
              {selectedUser.phone && (
                <Text style={tw`text-gray-500 mb-2`}>
                  <Text style={tw`font-bold`}>Phone:</Text> {selectedUser.phone}
                </Text>
              )}
              <Text style={tw`text-gray-500 mb-2`}>
                <Text style={tw`font-bold`}>Roles:</Text>{" "}
                {formatRoles(selectedUser.roles)}
              </Text>
              <Text style={tw`text-gray-500 mb-4`}>
                <Text style={tw`font-bold`}>Location:</Text>{" "}
                {selectedUser.location.name} ({selectedUser.location.type})
              </Text>

              <TouchableOpacity
                style={tw`bg-purple-500 px-4 py-2 rounded mb-2`}
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
        {!selectedUser && filteredUsers.length > 0 && (
          <View style={tw`bg-yellow-100 p-4 rounded-lg mt-6`}>
            <Text style={tw`text-yellow-800 text-center`}>
              💡 Select a user to view details or click the Edit button to
              modify user information
            </Text>
          </View>
        )}
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
