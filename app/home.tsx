import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { BASE_URL } from "../constants/ApiConfig";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "tailwind-react-native-classnames";
import HamburgerButton from "../components/HamburgerButton";
import MonthlyReport from "../components/MonthlyReport";
import ReportDashboard from "../components/today_report";
import { FormData } from "./types";

// Define interface for the API response
// Update your interfaces to match the API response
interface TodayReport {
  total: number;
  sex: {
    female?: number;
    male?: number;
  };
  type: {
    stillbirth?: number;
    fresh?: number;
    macerated?: number;
  };
}

interface MonthlyReportItem {
  month: string;
  total: number;
  avgWeight: number;
  sex: {
    male: number;
    female: number;
  };
  type: {
    fresh: number;
    macerated: number;
  };
  place: {
    facility: number;
    home: number;
  };
}

interface StillbirthReport {
  today: TodayReport;
  monthly: MonthlyReportItem[];
}

export const mockStillbirthData: FormData[] = [
  // ... (keep your existing mock data for raw data display if needed)
];

const HomeScreen = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "monthly">("today");
  const [userRole, setUserRole] = useState<string>("");
  const [reportData, setReportData] = useState<StillbirthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem("role");
      setUserRole(role || "");
    };
    getUserRole();
  }, []);

  // Fetch report data when component mounts or activeTab changes
  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = await AsyncStorage.getItem("access_token");
      const locationId = await AsyncStorage.getItem("location_id");

      console.log("Access Token:", accessToken ? "Exists" : "Missing");
      console.log("Location ID:", locationId);

      if (!accessToken) {
        throw new Error("User not logged in");
      }

      if (!locationId) {
        throw new Error("Location ID not found");
      }

      console.log(
        "Fetching from URL:",
        `${BASE_URL}/notifications/stillbirths/${locationId}`
      );

      const response = await fetch(
        `${BASE_URL}/notifications/stillbirths/${locationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries([...response.headers])
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StillbirthReport = await response.json();
      console.log("API Response Data:", JSON.stringify(data, null, 2));
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    router.push("/register");
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
        onPress: async () => {
          await clearAuthTokens();
          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  // Refresh data function
  const handleRefresh = () => {
    fetchReportData();
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-purple-100`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={tw`flex-row justify-between items-center p-3 bg-white border-b border-gray-300`}
      >
        <HamburgerButton
          onPress={() => setDrawerVisible(true)}
          position="relative"
        />
        <Text style={tw`text-2xl font-bold text-purple-500`}>PeriNote</Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={handleRefresh} style={tw`mr-3`}>
            <Icon name="refresh" size={24} color="#682483ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddUser}>
            <Icon name="person-add" size={36} color="#682483ff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={tw`flex-row bg-white border-b border-gray-200`}>
        <TouchableOpacity
          style={tw`flex-1 py-3 ${
            activeTab === "today" ? "border-b-2 border-purple-500" : ""
          }`}
          onPress={() => setActiveTab("today")}
        >
          <Text
            style={tw`text-center font-semibold ${
              activeTab === "today" ? "text-purple-500" : "text-gray-500"
            }`}
          >
            Today's Report
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-1 py-3 ${
            activeTab === "monthly" ? "border-b-2 border-purple-500" : ""
          }`}
          onPress={() => setActiveTab("monthly")}
        >
          <Text
            style={tw`text-center font-semibold ${
              activeTab === "monthly" ? "text-purple-500" : "text-gray-500"
            }`}
          >
            Monthly Report
          </Text>
        </TouchableOpacity>
      </View>

      {/* Load Indicator */}
      {isLoading && (
        <View
          style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-10`}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={tw`bg-red-100 p-3 mx-4 mt-4 rounded-lg`}>
          <Text style={tw`text-red-700 text-center`}>{error}</Text>
        </View>
      )}

      {/* No Data Message */}
      {!isLoading && !error && !reportData && (
        <View style={tw`bg-yellow-100 p-3 mx-4 mt-4 rounded-lg`}>
          <Text style={tw`text-yellow-700 text-center`}>
            No data available. Pull to refresh.
          </Text>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={tw`p-4`}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#682483ff"]}
          />
        }
      >
        {activeTab === "today" ? (
          <ReportDashboard data={reportData?.today} />
        ) : (
          <MonthlyReport
            data={reportData?.monthly || []}
            rawData={mockStillbirthData} // This can be kept for detailed view if needed
          />
        )}
      </ScrollView>

      {/* Drawer */}
      {/* Enhanced Drawer */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={tw`flex-1`}>
          <TouchableOpacity
            style={tw`flex-1 bg-black bg-opacity-50`}
            onPress={() => setDrawerVisible(false)}
            activeOpacity={1}
          />

          <View
            style={tw`absolute left-0 top-0 h-full w-72 bg-white shadow-xl`}
          >
            <View style={tw`p-6 bg-purple-600`}>
              <Text style={tw`text-white text-xl font-bold`}>PeriNote</Text>
              <Text style={tw`text-purple-100 text-sm mt-1`}>
                Stillbirth Notification System
              </Text>
            </View>

            <ScrollView style={tw`flex-1 p-4`}>
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

                {(userRole === "admin" ||
                  userRole === "county user" ||
                  userRole === "subcounty user") && (
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

                    {/* Register */}
                    <TouchableOpacity
                      style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                      onPress={() => {
                        setDrawerVisible(false);
                        router.push("/register");
                      }}
                    >
                      <Text style={tw`text-gray-700 font-medium ml-2`}>
                        📝 Register User
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
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;
