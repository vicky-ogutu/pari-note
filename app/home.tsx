import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { BASE_URL } from "../constants/ApiConfig";

import { FilePenIcon, UserPlusIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
interface StillbirthReport {
  today: {
    total: number;
    sex: {
      female: number;
      male?: number;
    };
    type: {
      stillbirth: number;
      fresh?: number;
      macerated?: number;
    };
  };
  monthly: Array<{
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
  }>;
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

      if (!accessToken) {
        throw new Error("User not logged in");
      }

      if (!locationId) {
        throw new Error("Location ID not found");
      }

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StillbirthReport = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      // Don't set any mock data - keep reportData as null
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    router.push("/patient_registration");
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
    <View style={tw`flex-1 bg-purple-100`}>
      {/* Header */}
      <View
        style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}
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
            {userRole === 'admin' ? (<UserPlusIcon size={36} color="#682483ff" />) : (<FilePenIcon color="#682483ff" />)}
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
      {/* ... (keep your existing drawer code) */}
    </View>
  );
};

export default HomeScreen;
