import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import * as XLSX from "xlsx";
import { BASE_URL } from "../constants/ApiConfig";

interface MonthlyReportProps {
  data: {
    month: string;
    total?: number;
    avgWeight?: number;
    sex?: { male?: number; female?: number };
    type?: { fresh?: number; macerated?: number };
    place?: { home?: number; facility?: number };
  }[];
}

// Mock data for monthly linelist - replace with actual API call later
const mockMonthlyLinelistData = [
  {
    id: 1,
    date: "2024-01-15",
    facility: "Main Hospital",
    sex: "Female",
    type: "Fresh",
    deliveryPlace: "Facility",
    weight: "2.5kg",
    motherAge: "28",
    gestationalAge: "38 weeks",
  },
  {
    id: 2,
    date: "2024-01-20",
    facility: "Main Hospital",
    sex: "Male",
    type: "Macerated",
    deliveryPlace: "Home",
    weight: "3.1kg",
    motherAge: "32",
    gestationalAge: "40 weeks",
  },
  {
    id: 3,
    date: "2024-02-05",
    facility: "Clinic A",
    sex: "Female",
    type: "Fresh",
    deliveryPlace: "Facility",
    weight: "2.8kg",
    motherAge: "25",
    gestationalAge: "39 weeks",
  },
  // Add more mock data as needed
];

const MonthlyReport: React.FC<MonthlyReportProps> = ({ data }) => {
  const downloadMonthlyLinelistReport = async () => {
    try {
      Alert.alert("Download", "Preparing monthly linelist report...");

      // Fetch monthly linelist data from API
      let linelistData;
      try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const accessToken = await AsyncStorage.getItem("access_token");

        const response = await fetch(
          `${BASE_URL}/reports/monthly-linelist?year=${year}`,
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

        linelistData = await response.json();
      } catch (error) {
        console.error("Error fetching monthly linelist data:", error);
        // test mock data if API fails
        //linelistData = mockMonthlyLinelistData;
        Alert.alert("Info", "- Network connection failed");
      }

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(linelistData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Monthly Stillbirth Linelist");

      // Generate buffer as array buffer
      const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      // Create file name
      const fileName = `monthly_stillbirth_linelist_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      if (Platform.OS === "web") {
        // For web - use blob download
        const blob = new Blob([wbout], {
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
        Alert.alert("Success", "Monthly report downloaded successfully!");
        return;
      }

      // For mobile - try different approaches
      try {
        // Approach 1: Try using the DocumentDirectory
        const directoryUri = FileSystem.documentDirectory;
        const fileUri = `${directoryUri}${fileName}`;

        // Convert array buffer to base64
        const base64String = arrayBufferToBase64(wbout);

        await FileSystem.writeAsStringAsync(fileUri, base64String, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Download Monthly Stillbirth Linelist",
          });
        } else {
          Alert.alert("Success", "Monthly report saved successfully!");
        }
      } catch (mobileError) {
        console.log("Mobile file save error:", mobileError);
        Alert.alert(
          "Error",
          "Could not save monthly report. Please try again."
        );
      }
    } catch (error) {
      console.error("Error downloading monthly report:", error);
      Alert.alert(
        "Error",
        "Failed to download monthly report. Please try again."
      );
    }
  };

  // Helper function to convert array buffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  if (!data || data.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-gray-500 text-lg`}>No monthly data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`p-4`}>
      <Text style={tw`text-2xl font-bold text-purple-700 mb-6 text-center`}>
        Monthly Stillbirth Reports
      </Text>

      {/* Download Button */}
      <TouchableOpacity
        style={tw`bg-purple-600 p-4 rounded-lg mb-6 shadow-md`}
        onPress={downloadMonthlyLinelistReport}
      >
        <Text style={tw`text-white text-lg font-semibold text-center`}>
          📊 Download Monthly Linelist
        </Text>
        <Text style={tw`text-purple-200 text-sm text-center mt-1`}>
          Export all monthly data to Excel
        </Text>
      </TouchableOpacity>

      {/* Monthly Reports List */}
      {data.map((monthData, index) => (
        <View key={index} style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
          {/* Month Header */}
          <Text style={tw`text-xl font-bold text-purple-700 mb-3 text-center`}>
            {monthData.month}
          </Text>

          <View style={tw`flex-row flex-wrap justify-between`}>
            {/* Total Cases */}
            <View style={tw`w-1/2 p-2`}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 text-center`}
              >
                Total
              </Text>
              <Text style={tw`text-2xl text-gray-700 text-center`}>
                {monthData.total || 0}
              </Text>
            </View>

            {/* Average Weight */}
            <View style={tw`w-1/2 p-2`}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 text-center`}
              >
                Avg Weight
              </Text>
              <Text style={tw`text-2xl text-gray-700 text-center`}>
                {monthData.avgWeight ? `${monthData.avgWeight}kg` : "N/A"}
              </Text>
            </View>

            {/* Sex Distribution */}
            <View style={tw`w-1/2 p-2`}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 text-center`}
              >
                Sex
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                ♀ {monthData.sex?.female || 0}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                ♂ {monthData.sex?.male || 0}
              </Text>
            </View>

            {/* Type Distribution */}
            <View style={tw`w-1/2 p-2`}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 text-center`}
              >
                Type
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                Fresh: {monthData.type?.fresh || 0}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                Macerated: {monthData.type?.macerated || 0}
              </Text>
            </View>

            {/* Delivery Place */}
            <View style={tw`w-full p-2 mt-2`}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 text-center`}
              >
                Delivery Place
              </Text>
              <View style={tw`flex-row justify-around mt-1`}>
                <View style={tw`items-center`}>
                  <Text style={tw`text-gray-700`}>🏠</Text>
                  <Text style={tw`text-gray-700`}>
                    {monthData.place?.home || 0}
                  </Text>
                </View>
                <View style={tw`items-center`}>
                  <Text style={tw`text-gray-700`}>🏥</Text>
                  <Text style={tw`text-gray-700`}>
                    {monthData.place?.facility || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default MonthlyReport;
