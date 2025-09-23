// Try importing the legacy version directly at the top
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import React from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
//import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import tw from "tailwind-react-native-classnames";
import * as XLSX from "xlsx";
import { BASE_URL } from "../constants/ApiConfig";
interface ReportDashboardProps {
  data?: {
    total: number;
    sex: { female?: number; male?: number };
    type: { [key: string]: number | undefined };
    deliveryPlace?: { home?: number; facility?: number };
  };
}

// Mock data for linelist - we Will use to test when API is not available
const mockLinelistData = [
  {
    id: 1,
    date: "2025-09-15",
    time: "08:30",
    facility: "Got Agulu Hospital",
    sex: "Female",
    type: "Fresh stillbirth",
    deliveryPlace: "Facility",
    weight: "2.5kg",
    motherAge: "28",
    gestationalAge: "38 weeks",
  },
  {
    id: 2,
    date: "2025-09-15",
    time: "14:45",
    facility: "Ombek Hospital",
    sex: "Male",
    type: "Macerated stillbirth",
    deliveryPlace: "Home",
    weight: "3.1kg",
    motherAge: "32",
    gestationalAge: "30 weeks",
  },
];
let linelistData;

const ReportDashboard: React.FC<ReportDashboardProps> = ({ data }) => {
  const downloadLinelistReport = async () => {
    try {
      Alert.alert("Download", "Preparing linelist report...");
      const accessToken = await AsyncStorage.getItem("access_token");

      // Using for mock data
      //const linelistData = mockLinelistData;

      const response = await fetch(`${BASE_URL}/users/user-location`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, //
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      linelistData = await response.json();

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(linelistData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stillbirth Linelist");

      // Generate buffer as base64
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Create file path
      const fileName = `stillbirth_linelist_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Use the new File System API
      const directory = FileSystem.cacheDirectory + "reports/";

      // Ensure directory exists
      try {
        const dirInfo = await FileSystem.getInfoAsync(directory);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(directory, {
            intermediates: true,
          });
        }
      } catch (dirError) {
        console.log("Directory creation error:", dirError);
      }

      const fileUri = directory + fileName;

      // Convert base64 to Uint8Array for the new API
      const binaryString = atob(wbout);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Write file using the new API approach
      try {
        // For newer Expo versions, use the File API
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (writeError) {
        console.log("Write error, trying alternative approach:", writeError);

        // Alternative approach using blob if available
        if (Platform.OS === "web") {
          // For web, create a download link
          const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        } else {
          // For mobile, try the legacy API as fallback
          const legacyFS = await import("expo-file-system/legacy");
          await legacyFS.writeAsStringAsync(fileUri, wbout, {
            encoding: legacyFS.EncodingType.Base64,
          });
        }
      }

      // Share file (download)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Download Stillbirth Linelist",
        });
      } else {
        Alert.alert("Success", "File downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      Alert.alert("Error", "Failed to download report. Please try again.");
    }
  };

  if (!data) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-gray-500 text-lg`}>
          No data available for today
        </Text>
      </View>
    );
  }

  // 🔹 Normalize backend keys
  const normalizedType = {
    fresh: data.type["fresh stillbirth"] ?? data.type["fresh"] ?? 0,
    macerated: data.type["macerated stillbirth"] ?? data.type["macerated"] ?? 0,
  };

  const deliveryPlace = {
    home: data.deliveryPlace?.home ?? 0,
    facility: data.deliveryPlace?.facility ?? 0,
  };

  // Shared card style
  const cardStyle = tw`flex-1 aspect-square bg-white m-1 p-4 rounded-lg shadow-md justify-center`;

  return (
    <View style={tw`p-4`}>
      <Text style={tw`text-lg font-bold text-purple-600 mb-4 text-center`}>
        Today's Report
      </Text>

      {/* Row 1 */}
      <View style={tw`flex-row`}>
        {/* Total Cases */}
        <TouchableOpacity style={cardStyle} onPress={downloadLinelistReport}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Total Cases
          </Text>
          <Text style={tw`text-2xl text-gray-700 text-center`}>
            {data.total || 0}
          </Text>
          <Text style={tw`text-xs text-purple-500 text-center mt-2`}>
            Tap to download linelist
          </Text>
        </TouchableOpacity>

        {/* Sex */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Sex
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            ♀ Female: {data.sex?.female || 0}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            ♂ Male: {data.sex?.male || 0}
          </Text>
        </View>
      </View>

      {/* Row 2 */}
      <View style={tw`flex-row`}>
        {/* Type */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Type
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            Fresh: {normalizedType.fresh}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            Macerated: {normalizedType.macerated}
          </Text>
        </View>

        {/* Delivery Place */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Delivery Place
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            🏠 Home: {deliveryPlace.home}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            🏥 Facility: {deliveryPlace.facility}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ReportDashboard;
