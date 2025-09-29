// app/home.tsx
import DateRangeReport from "@/components/DateRangeReport";
import UnifiedReport from "@/components/UnifiedReport";
import { ReportType } from "@/types/reports";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { FilePenIcon, UserPlusIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "tailwind-react-native-classnames";
import CustomDrawer from "../components/CustomDrawer";
import HamburgerButton from "../components/HamburgerButton";
import MonthlyReport from "../components/MonthlyReport";
import ReportDashboard from "../components/today_report";
import { usePermissions } from "../components/usePermissions";
import { BASE_URL } from "../constants/ApiConfig";
import { FormData } from "./types";

// Define interface for the API response
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
  place: {
    facility: number;
    home: number;
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
  // dummy data for test
];

const HomeScreen = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "monthly" | "dateRange">(
    "today"
  );
  const [reportData, setReportData] = useState<StillbirthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the permissions
  const {
    userRoles,
    canAccess,
  } = usePermissions();


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
    } finally {
      setIsLoading(false);
    }
  };

  // NO PERMISSION CHECKS - Everyone can add users
  const handleAddUser = () => {
    if (userRoles.length == 1 && userRoles.includes('nurse')) {
      router.push("/patient_registration");
    } else {
      router.push("/register");
    }
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
        "roles",
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

  const handleRefresh = () => {
    fetchReportData();
  };

  // Everyone can see all reports
  const canSeeMonthlyReports = () => true;
  const canSeeDateRangeReports = () => true;

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === "today") {
      return <ReportDashboard data={reportData?.today} />;
    } else if (activeTab === "monthly") {
      return <MonthlyReport data={reportData?.monthly || []} />;
    } else if (activeTab === "dateRange") {
      return <DateRangeReport />;
    }
    return null;
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
        <Text style={tw`text-2xl font-bold text-purple-500`}>MOH 369</Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={handleAddUser}>
            {userRoles?.includes("nurse") ? (
              <FilePenIcon color="#682483ff" />
              
            ) : (
              <UserPlusIcon size={36} color="#682483ff" />
            )}
            </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation - Everyone can see all tabs */}
      <View style={tw`flex-row bg-white border-b border-gray-200`}>
        <TouchableOpacity
          style={tw`flex-1 py-3 ${activeTab === ReportType.TODAY ? "border-b-2 border-purple-500" : ""}`}
          onPress={() => setActiveTab(ReportType.TODAY)}
        >
          <Text style={tw`text-center font-semibold ${activeTab === ReportType.TODAY ? "text-purple-500" : "text-gray-500"}`}>
            Today's Report
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-1 py-3 ${activeTab === ReportType.MONTHLY ? "border-b-2 border-purple-500" : ""}`}
          onPress={() => setActiveTab(ReportType.MONTHLY)}
        >
          <Text style={tw`text-center font-semibold ${activeTab === ReportType.MONTHLY ? "text-purple-500" : "text-gray-500"}`}>
            Monthly Report
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-1 py-3 ${activeTab === ReportType.DATE_RANGE ? "border-b-2 border-purple-500" : ""}`}
          onPress={() => setActiveTab(ReportType.DATE_RANGE)}
        >
          <Text style={tw`text-center font-semibold ${activeTab === ReportType.DATE_RANGE ? "text-purple-500" : "text-gray-500"}`}>
            Date Range
          </Text>
        </TouchableOpacity>
      </View>


      {/* Main Content */}
      <UnifiedReport type={activeTab} />
      {/* <ScrollView
        contentContainerStyle={tw`p-4`}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#682483ff"]}
          />
        }
      >
        {renderContent()}
      </ScrollView> */}

      {/* Drawer */}
      <CustomDrawer
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        handleLogout={handleLogout}
      />

      {/* Floating Refresh Button */}
      <TouchableOpacity
        onPress={handleRefresh}
        style={[
          tw`absolute bg-purple-600 rounded-full p-4 shadow-lg`,
          {
            bottom: 40,
            right: 20,
            elevation: 5,
          },
        ]}
      >
        <Icon name="refresh" size={28} color="#fff" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;
