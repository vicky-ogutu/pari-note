import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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

interface PreviewData {
  sex: string;
  type: string;
  facility: string;
  date?: string;
  weight?: string;
  motherAge?: string;
  gestationalAge?: string;
  deliveryPlace?: string;
}

interface RawDataItem {
  female?: string | number;
  male?: string | number;
  type?: string;
  facility?: string;
  deliveryPlace?: string;
  date?: string;
  time?: string;
  weight?: string;
  motherAge?: string;
  gestationalAge?: string;
}

interface MonthlyTileData {
  month: string;
  total: number;
  avgWeight: number;
  sex: { male: number; female: number };
  type: { fresh: number; macerated: number };
  place: { home: number; facility: number };
  rawData?: RawDataItem[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ data: propData }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [tileData, setTileData] = useState<MonthlyTileData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Function to get month dates from month string (e.g., "January 2024")
  // Function to get month dates from month string (e.g., "September 2025")
  const getMonthDates = (monthString: string) => {
    try {
      const [monthName, yearStr] = monthString.split(" ");
      const year = parseInt(yearStr);

      // Create a map of month names to month indices (0-11)
      const monthMap: { [key: string]: number } = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
      };

      const monthLower = monthName.toLowerCase();
      const monthIndex = monthMap[monthLower];

      if (monthIndex === undefined) {
        throw new Error(`Invalid month name: ${monthName}`);
      }

      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0);

      return {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      };
    } catch (error) {
      console.error("Error parsing month:", error);
      // Return current month as fallback
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      };
    }
  };

  // Function to fetch monthly detailed data
  const fetchMonthlyDetailedData = async (
    monthString: string
  ): Promise<RawDataItem[]> => {
    try {
      setDataLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      const locationId = await AsyncStorage.getItem("location_id");

      if (!accessToken) {
        throw new Error("User not authenticated");
      }

      if (!locationId) {
        throw new Error("Location ID not found");
      }

      // Get dates for the selected month
      const { startDate, endDate } = getMonthDates(monthString);

      console.log(
        `Fetching data for ${monthString}: ${startDate} to ${endDate}`
      );

      const response = await fetch(
        //`${BASE_URL}/notifications/stillbirths/records/${locationId}?startDate=${startDate}&endDate=${endDate}`,
        `${BASE_URL}/notifications/stillbirths/${locationId}?startDate=${startDate}&endDate=${endDate}`,

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

      const result = await response.json();
      console.log(`Raw data for ${monthString}:`, result);
      return result.data || result || [];
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      Alert.alert("Error", "Failed to fetch monthly data. Please try again.");
      return [];
    } finally {
      setDataLoading(false);
    }
  };

  // Function to prepare preview data
  // const preparePreviewData = (rawData: RawDataItem[]): PreviewData[] => {
  //   return rawData.map((item: RawDataItem) => ({
  //     sex: item.female ? "Female" : item.male ? "Male" : "Unknown",
  //     type: item.type || "Unknown",
  //     facility: item.facility || "Unknown",
  //     date: item.date || "",
  //     weight: item.weight || "",
  //     motherAge: item.motherAge || "",
  //     gestationalAge: item.gestationalAge || "",
  //     deliveryPlace: item.deliveryPlace || "",
  //   }));
  // };
  // Function to prepare preview data

  const preparePreviewData = (rawData: any[]): PreviewData[] => {
    return rawData.flatMap((item: any) => {
      // Handle cases where there might be multiple babies
      if (item.babies && item.babies.length > 0) {
        return item.babies.map((baby: any) => ({
          sex: baby.sex || "Unknown",
          type: baby.outcome || "Unknown", // Use baby's outcome as Type
          facility: item.location?.name || "Unknown",
          date: item.dateOfNotification || "",
        }));
      }

      // Fallback for items without babies array
      return [
        {
          sex: "Unknown",
          type: "Unknown",
          facility: item.location?.name || "Unknown",
          date: item.dateOfNotification || "",
        },
      ];
    });
  };
  // Initialize tile data from props
  useEffect(() => {
    if (propData && propData.length > 0) {
      const monthlyTileData: MonthlyTileData[] = propData.map((monthData) => ({
        month: monthData.month,
        total: monthData.total || 0,
        avgWeight: monthData.avgWeight || 0,
        sex: {
          female: monthData.sex?.female || 0,
          male: monthData.sex?.male || 0,
        },
        type: {
          fresh: monthData.type?.fresh || 0,
          macerated: monthData.type?.macerated || 0,
        },
        place: {
          home: monthData.place?.home || 0,
          facility: monthData.place?.facility || 0,
        },
      }));

      setTileData(monthlyTileData);
    }
  }, [propData]);

  const handleTotalPress = async (monthData: {
    month: string;
    total?: number;
  }) => {
    // Don't proceed if there's no data for this month
    if (!monthData.total || monthData.total === 0) {
      Alert.alert("Info", `No data available for ${monthData.month}`);
      return;
    }

    try {
      setLoading(true);
      setSelectedMonth(monthData.month);

      // Fetch detailed data for the selected month
      const rawData = await fetchMonthlyDetailedData(monthData.month);

      if (rawData && rawData.length > 0) {
        const previewData = preparePreviewData(rawData);
        setPreviewData(previewData);
        setPreviewVisible(true);
      } else {
        Alert.alert(
          "Info",
          `No detailed data available for ${monthData.month}`
        );
      }
    } catch (error) {
      console.error("Error preparing preview:", error);
      Alert.alert("Error", "Failed to load preview data");
    } finally {
      setLoading(false);
    }
  };

  const downloadMonthlyReport = async (monthString: string) => {
    try {
      Alert.alert("Download", `Preparing report for ${monthString}...`);

      // Fetch fresh data for the month
      const rawData = await fetchMonthlyDetailedData(monthString);

      if (!rawData || rawData.length === 0) {
        Alert.alert("Info", `No data available for ${monthString}`);
        return;
      }

      // Prepare data for Excel - using the same order: sex, type, facility, date
      const excelData = rawData.flatMap((item: any) => {
        if (item.babies && item.babies.length > 0) {
          return item.babies.map((baby: any) => ({
            Sex: baby.sex || "Unknown",
            Type: baby.outcome || "Unknown", // Baby's outcome as Type
            Facility: item.location?.name || "Unknown",
            Date: item.dateOfNotification || "",
          }));
        }
        return [
          {
            Sex: "Unknown",
            Type: "Unknown",
            Facility: item.location?.name || "Unknown",
            Date: item.dateOfNotification || "",
          },
        ];
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Monthly Stillbirth Linelist");

      // Generate buffer
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Create file name
      const { startDate, endDate } = getMonthDates(monthString);
      const fileName = `monthly_stillbirth_linelist_${startDate}_to_${endDate}.xlsx`;
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

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share file (download)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Download Monthly Stillbirth Linelist",
        });
      } else {
        Alert.alert("Success", "Monthly report downloaded successfully!");
      }

      // Close preview after download
      setPreviewVisible(false);
    } catch (error) {
      console.error("Error downloading monthly report:", error);
      Alert.alert(
        "Error",
        "Failed to download monthly report. Please try again."
      );
    }
  };

  // Use propData directly if tileData is not set yet but we have props
  const displayData = tileData.length > 0 ? tileData : propData || [];

  if (dataLoading && displayData.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={tw`mt-2 text-gray-600`}>Loading monthly data...</Text>
      </View>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-gray-500 text-lg`}>No monthly data available</Text>
      </View>
    );
  }

  // Shared card style - matching Today's Report
  const cardStyle = tw`flex-1 aspect-square bg-white m-1 p-4 rounded-lg shadow-md justify-center`;

  return (
    <ScrollView style={tw`p-4`}>
      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={tw`flex-1 p-4 bg-white`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-sm font-bold text-purple-600`}>
              MOH 369 - {selectedMonth}
            </Text>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={tw`p-2`}
            >
              <Text style={tw`text-lg font-bold`}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={tw`text-gray-600 mb-4`}>
            Showing data for {selectedMonth}
          </Text>

          {loading ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <ActivityIndicator size="large" color="#6D28D9" />
              <Text style={tw`mt-2 text-gray-600`}>Loading preview...</Text>
            </View>
          ) : (
            <>
              <ScrollView style={tw`flex-1 mb-4`}>
                {previewData.length > 0 ? (
                  <View style={tw`border border-gray-200 rounded-lg`}>
                    {/* Table Header
                    <View
                      style={tw`flex-row bg-purple-100 p-3 border-b border-gray-200`}
                    >
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Date
                      </Text>
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Sex
                      </Text>
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Type
                      </Text>
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Facility
                      </Text>
                    </View> */}
                    {/* Table Header */}
                    <View
                      style={tw`flex-row bg-purple-100 p-3 border-b border-gray-200`}
                    >
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Sex
                      </Text>
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Type
                      </Text>
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Facility
                      </Text>
                      <Text style={tw`flex-1 font-bold text-purple-600`}>
                        Date
                      </Text>
                    </View>
                    {/* Table Rows */}
                    {previewData.map((item: PreviewData, index: number) => (
                      <View
                        key={index}
                        style={tw`flex-row p-3 border-b border-gray-100`}
                      >
                        <Text style={tw`flex-1`}>{item.sex}</Text>
                        <Text style={tw`flex-1`}>{item.type}</Text>
                        <Text style={tw`flex-1 text-xs`}>{item.facility}</Text>
                        <Text style={tw`flex-1 text-xs`}>{item.date}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={tw`text-center text-gray-500 py-8`}>
                    No data available for {selectedMonth}
                  </Text>
                )}
              </ScrollView>

              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => setPreviewVisible(false)}
                  style={tw`flex-1 bg-gray-300 py-3 rounded-lg`}
                >
                  <Text style={tw`text-center text-gray-700 font-semibold`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => downloadMonthlyReport(selectedMonth)}
                  style={tw`flex-1 bg-purple-600 py-3 rounded-lg`}
                >
                  <Text style={tw`text-center text-white font-semibold`}>
                    Download Full Report
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      <Text style={tw`text-2xl font-bold text-purple-700 mb-6 text-center`}>
        Monthly Stillbirth Reports
      </Text>

      {/* Monthly Reports List */}
      {displayData.map((monthData, index) => (
        <View
          key={index}
          style={tw`bg-purple-50 p-4 rounded-lg shadow-md mb-6`}
        >
          {/* Month Header */}
          <Text style={tw`text-xl font-bold text-purple-700 mb-4 text-center`}>
            {monthData.month}
          </Text>

          {/* Row 1 - Total Cases and Sex Distribution */}
          <View style={tw`flex-row mb-2`}>
            {/* Total Cases - Clickable for preview */}
            <TouchableOpacity
              style={[
                cardStyle,
                (!monthData.total || monthData.total === 0) && tw`opacity-50`,
              ]}
              onPress={() => handleTotalPress(monthData)}
              disabled={!monthData.total || monthData.total === 0}
            >
              <Text
                style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
              >
                Total Cases
              </Text>
              <Text style={tw`text-2xl text-gray-700 text-center`}>
                {monthData.total || 0}
              </Text>
              <Text style={tw`text-xs text-purple-500 text-center mt-2`}>
                {monthData.total && monthData.total > 0
                  ? "Tap to preview and download linelist"
                  : "No data available"}
              </Text>
            </TouchableOpacity>

            {/* Sex Distribution */}
            <View style={cardStyle}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
              >
                Sex
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                ♀ Female: {monthData.sex?.female || 0}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                ♂ Male: {monthData.sex?.male || 0}
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
                Fresh: {monthData.type?.fresh || 0}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                Macerated: {monthData.type?.macerated || 0}
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
                🏠 Home: {monthData.place?.home || 0}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                🏥 Facility: {monthData.place?.facility || 0}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default MonthlyReport;
