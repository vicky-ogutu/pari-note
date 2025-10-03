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

  // Parse "September 2025" -> { year: 2025, month: 8 }
  const parseMonthString = (monthString: string) => {
    const [monthName, yearStr] = monthString.split(" ");
    const year = parseInt(yearStr, 10);
    const month = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-based
    return { year, month };
  };

  // Get first and last day of a given month
  const getMonthDates = (year: number, month: number) => {
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
    return { startDate, endDate };
  };

  const fetchMonthlyDetailedData = async (year: number, month: number) => {
    try {
      setDataLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      const locationId = await AsyncStorage.getItem("location_id");

      if (!locationId) {
        console.log("No location ID available");
        return [];
      }

      const { startDate, endDate } = getMonthDates(year, month);

      const response = await fetch(
        `${BASE_URL}/notifications/stillbirths/${locationId}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 204 || response.status === 404) {
        console.log("No data found for monthly");
        return [];
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        "Monthly API Success - Raw response:",
        JSON.stringify(result, null, 2)
      );
      console.log(
        `Requesting monthly data for ${year}-${
          month + 1
        }: ${startDate} → ${endDate}, location ${locationId}`
      );

      // Handle different response structures
      const rawData = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.monthly)
        ? result.monthly
        : [];

      console.log(`Processed ${rawData.length} records for monthly data`);
      return rawData;
    } catch (err) {
      console.error("Monthly fetch error:", err);
      return [];
    } finally {
      setDataLoading(false);
    }
  };

  const preparePreviewData = (rawData: any[]): PreviewData[] => {
    if (!rawData || rawData.length === 0) {
      console.log("No raw data available for preview");
      return [];
    }

    return rawData.flatMap((item: any) => {
      // Handle cases where there might be multiple babies
      if (item.babies && item.babies.length > 0) {
        return item.babies.map((baby: any) => ({
          sex: baby.sex || "Unknown",
          type: baby.outcome || "Unknown",
          facility: item.location?.name || "Unknown",
          date: item.dateOfNotification || "",
          weight: baby.weight || "",
          motherAge: item.motherAge || "",
          gestationalAge: item.gestationalAge || "",
        }));
      }

      // Fallback for items without babies array
      return [
        {
          sex: item.sex || "Unknown",
          type: item.type || item.outcome || "Unknown",
          facility: item.location?.name || item.facility || "Unknown",
          date: item.dateOfNotification || item.date || "",
          weight: item.weight || "",
          motherAge: item.motherAge || "",
          gestationalAge: item.gestationalAge || "",
        },
      ];
    });
  };

  // Process API response data to match our expected format
  const processApiData = (apiData: any[]): MonthlyTileData[] => {
    if (!apiData || apiData.length === 0) {
      console.log("No API data to process");
      return [];
    }

    return apiData.map((monthData: any) => {
      console.log("Processing month data:", JSON.stringify(monthData, null, 2));

      // Handle different response structures
      const sexData = monthData.sex || {};
      const typeData = monthData.type || {};
      const placeData = monthData.place || {};

      return {
        month: monthData.month || "Unknown Month",
        total: monthData.total || 0,
        avgWeight: monthData.avgWeight || 0,
        sex: {
          female: typeof sexData === "object" ? sexData.female || 0 : 0,
          male: typeof sexData === "object" ? sexData.male || 0 : 0,
        },
        type: {
          fresh:
            typeof typeData === "object"
              ? typeData.fresh || typeData["fresh stillbirth"] || 0
              : 0,
          macerated: typeof typeData === "object" ? typeData.macerated || 0 : 0,
        },
        place: {
          home: typeof placeData === "object" ? placeData.home || 0 : 0,
          facility: typeof placeData === "object" ? placeData.facility || 0 : 0,
        },
      };
    });
  };

  // Initialize tile data from props or fetch data
  useEffect(() => {
    const initializeData = async () => {
      // If we have prop data, use it
      if (propData && propData.length > 0) {
        console.log("Using prop data for monthly report");
        const monthlyTileData: MonthlyTileData[] = propData.map(
          (monthData) => ({
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
          })
        );
        setTileData(monthlyTileData);
      } else {
        // If no prop data, try to fetch monthly data
        console.log("No prop data, attempting to fetch monthly data");
        try {
          setDataLoading(true);
          const accessToken = await AsyncStorage.getItem("access_token");
          const locationId = await AsyncStorage.getItem("location_id");

          if (!accessToken || !locationId) {
            console.log("No auth token or location ID available");
            return;
          }

          // Fetch summary data for all months
          const response = await fetch(
            `${BASE_URL}/notifications/stillbirths/summary/${locationId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log(
              "Monthly summary API response:",
              JSON.stringify(result, null, 2)
            );

            if (result.monthly && Array.isArray(result.monthly)) {
              const processedData = processApiData(result.monthly);
              setTileData(processedData);
            }
          }
        } catch (error) {
          console.error("Error fetching monthly summary:", error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    initializeData();
  }, [propData]);

  const handleTotalPress = async (monthData: {
    month: string;
    total?: number;
  }) => {
    if (!monthData.total || monthData.total === 0) {
      Alert.alert("Info", `No data available for ${monthData.month}`);
      return;
    }

    try {
      setLoading(true);
      setSelectedMonth(monthData.month);

      const { year, month } = parseMonthString(monthData.month);
      const rawData = await fetchMonthlyDetailedData(year, month);

      console.log(`Fetched ${rawData.length} detailed records for preview`);

      if (rawData.length > 0) {
        const previewData = preparePreviewData(rawData);
        console.log(`Prepared ${previewData.length} preview items`);
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

      const { year, month } = parseMonthString(monthString);
      const rawData = await fetchMonthlyDetailedData(year, month);

      if (!rawData || rawData.length === 0) {
        Alert.alert("Info", `No data available for ${monthString}`);
        return;
      }

      const excelData = rawData.flatMap((item: any) => {
        if (item.babies && item.babies.length > 0) {
          return item.babies.map((baby: any) => ({
            Sex: baby.sex || "Unknown",
            Type: baby.outcome || "Unknown",
            Facility: item.location?.name || "Unknown",
            Date: item.dateOfNotification || "",
            Weight: baby.weight || "",
            "Mother Age": item.motherAge || "",
            "Gestational Age": item.gestationalAge || "",
          }));
        }
        return [
          {
            Sex: item.sex || "Unknown",
            Type: item.type || item.outcome || "Unknown",
            Facility: item.location?.name || item.facility || "Unknown",
            Date: item.dateOfNotification || item.date || "",
            Weight: item.weight || "",
            "Mother Age": item.motherAge || "",
            "Gestational Age": item.gestationalAge || "",
          },
        ];
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Monthly Stillbirth Linelist");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      const { startDate, endDate } = getMonthDates(year, month);
      const fileName = `monthly_stillbirth_linelist_${startDate}_to_${endDate}.xlsx`;
      const directory = FileSystem.cacheDirectory + "reports/";

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
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Download Monthly Stillbirth Linelist",
        });
      } else {
        Alert.alert("Success", "Monthly report downloaded successfully!");
      }

      setPreviewVisible(false);
    } catch (error) {
      console.error("Error downloading monthly report:", error);
      Alert.alert(
        "Error",
        "Failed to download monthly report. Please try again."
      );
    }
  };

  // Use tileData if available, otherwise use processed propData
  const displayData = tileData.length > 0 ? tileData : [];

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
            <Text style={tw`text-lg font-bold text-purple-600`}>
              MOH 369 - {selectedMonth}
            </Text>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={tw`p-2`}
            >
              <Text style={tw`text-2xl font-bold`}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={tw`text-gray-600 mb-4  text-purple-600`}>
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

      {/* <Text style={tw`text-2xl font-bold text-purple-700 mb-6 text-center`}>
        Monthly Stillbirth Reports
      </Text> */}

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
                tw`flex-1 bg-white m-1 p-4 rounded-lg shadow-md justify-center`,
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
            <View
              style={tw`flex-1 bg-white m-1 p-4 rounded-lg shadow-md justify-center`}
            >
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
            <View
              style={tw`flex-1 bg-white m-1 p-4 rounded-lg shadow-md justify-center`}
            >
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
            <View
              style={tw`flex-1 bg-white m-1 p-4 rounded-lg shadow-md justify-center`}
            >
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

          {/* Average Weight Row */}
          {/* <View style={tw`mt-2`}>
            <View style={tw`bg-white m-1 p-4 rounded-lg shadow-md justify-center`}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
              >
                Average Weight
              </Text>
              <Text style={tw`text-xl text-gray-700 text-center`}>
                {monthData.avgWeight ? `${monthData.avgWeight}g` : 'N/A'}
              </Text>
            </View>
          </View> */}
        </View>
      ))}
    </ScrollView>
  );
};

export default MonthlyReport;
