import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import * as XLSX from "xlsx";
import { BASE_URL } from "../constants/ApiConfig";

interface DateRangeReportProps {}

interface PreviewData {
  sex: string;
  type: string;
  facility: string;
  date: string;
  weight: string;
  motherAge: string;
  gestationalAge: string;
  deliveryPlace: string;
}

interface ApiNotification {
  id: number;
  dateOfNotification: string;
  location: { name: string };
  mother: {
    age: number;
    placeOfDelivery: string;
    typeOfDelivery?: string;
  };
  babies: Array<{
    sex: string;
    outcome: string;
    birthWeight: number;
    gestationWeeks: number;
    ageAtDeathDays?: number;
    apgarScore1min?: string;
    apgarScore5min?: string;
    apgarScore10min?: string;
  }>;
}

interface StatsData {
  total: number;
  sex: {
    female: number;
    male: number;
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

const DateRangeReport: React.FC<DateRangeReportProps> = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [rawData, setRawData] = useState<ApiNotification[]>([]);
  const [statsData, setStatsData] = useState<StatsData>({
    total: 0,
    sex: { female: 0, male: 0 },
    type: { fresh: 0, macerated: 0 },
    place: { facility: 0, home: 0 },
  });

  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const determineStillbirthType = (baby: any): string => {
    if (baby.outcome?.toLowerCase() === "live birth") return "Live birth";

    if (baby.outcome?.toLowerCase() === "stillbirth") {
      if (baby.ageAtDeathDays !== undefined && baby.ageAtDeathDays > 0) {
        return "Macerated";
      }
      if (baby.apgarScore1min || baby.apgarScore5min || baby.apgarScore10min) {
        return "Fresh";
      }
      return "Fresh";
    }

    return baby.outcome || "Unknown";
  };

  const fetchDateRangeData = async (
    startDateStr: string,
    endDateStr: string
  ): Promise<ApiNotification[]> => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const locationId = await AsyncStorage.getItem("location_id");

      if (!accessToken) throw new Error("User not authenticated");
      if (!locationId) throw new Error("Location ID not found");

      // Try the detailed records endpoint
      const response = await fetch(
        `${BASE_URL}/notifications/stillbirths/records/${locationId}?startDate=${startDateStr}&endDate=${endDateStr}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        // If records endpoint fails, try the main endpoint
        console.log("Records endpoint failed, trying main endpoint...");
        const mainResponse = await fetch(
          `${BASE_URL}/notifications/stillbirths/${locationId}?startDate=${startDateStr}&endDate=${endDateStr}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!mainResponse.ok) {
          throw new Error(`HTTP error! status: ${mainResponse.status}`);
        }

        const mainResult = await mainResponse.json();
        console.log("Main endpoint response:", mainResult);

        // If we only get stats data, return empty array for detailed records
        return [];
      }

      const result = await response.json();
      console.log("Records API Response:", result);

      return result.data || result || [];
    } catch (error) {
      console.error("Error fetching date range data:", error);
      Alert.alert("Error", "Failed to fetch data for the selected date range");
      return [];
    }
  };

  const fetchStatsData = async (
    startDateStr: string,
    endDateStr: string
  ): Promise<StatsData | null> => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const locationId = await AsyncStorage.getItem("location_id");

      if (!accessToken) throw new Error("User not authenticated");
      if (!locationId) throw new Error("Location ID not found");

      const response = await fetch(
        `${BASE_URL}/notifications/stillbirths/${locationId}?startDate=${startDateStr}&endDate=${endDateStr}`,

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
      console.log("Full API Response:", JSON.stringify(result, null, 2));

      // For date range queries, we should use the monthly data
      if (result.monthly && result.monthly.length > 0) {
        console.log("Monthly data found:", result.monthly);

        // Since we're querying a date range, use the first monthly entry
        const monthlyData = result.monthly[0];

        const stats: StatsData = {
          total: monthlyData.total || 0,
          sex: {
            female: monthlyData.sex?.female || 0,
            male: monthlyData.sex?.male || 0,
          },
          type: {
            fresh: monthlyData.type?.fresh || 0,
            macerated: monthlyData.type?.macerated || 0,
          },
          place: {
            facility: monthlyData.place?.facility || 0,
            home: monthlyData.place?.home || 0,
          },
        };

        console.log("Processed stats from monthly data:", stats);
        return stats;
      }

      // Fallback to today's data if no monthly data (for today's queries)
      if (result.today) {
        console.log("Using today's data as fallback:", result.today);

        const stats: StatsData = {
          total: result.today.total || 0,
          sex: {
            female: result.today.sex?.female || 0,
            male: result.today.sex?.male || 0,
          },
          type: {
            // Handle the "fresh stillbirth" key name difference
            fresh:
              result.today.type?.["fresh stillbirth"] ||
              result.today.type?.fresh ||
              0,
            macerated: result.today.type?.macerated || 0,
          },
          place: {
            facility: result.today.place?.facility || 0,
            home: result.today.place?.home || 0,
          },
        };

        console.log("Processed stats from today's data:", stats);
        return stats;
      }

      console.log("No data found in response");
      return null;
    } catch (error) {
      console.error("Error fetching stats data:", error);
      Alert.alert("Error", "Failed to fetch stats data");
      return null;
    }
  };

  const processApiData = (apiData: ApiNotification[]): PreviewData[] => {
    if (!apiData || apiData.length === 0) return [];

    const previewData: PreviewData[] = [];

    apiData.forEach((notification) => {
      notification.babies?.forEach((baby) => {
        const stillbirthType = determineStillbirthType(baby);

        previewData.push({
          sex: baby.sex || "Unknown",
          type: stillbirthType,
          facility: notification.location?.name || "Unknown",
          date: notification.dateOfNotification || "",
          weight: baby.birthWeight ? `${baby.birthWeight} g` : "",
          motherAge: notification.mother?.age
            ? `${notification.mother.age} years`
            : "",
          gestationalAge: baby.gestationWeeks
            ? `${baby.gestationWeeks} weeks`
            : "",
          deliveryPlace: notification.mother?.placeOfDelivery || "Unknown",
        });
      });

      if (!notification.babies || notification.babies.length === 0) {
        previewData.push({
          sex: "Unknown",
          type: "Unknown",
          facility: notification.location?.name || "Unknown",
          date: notification.dateOfNotification || "",
          weight: "",
          motherAge: notification.mother?.age
            ? `${notification.mother.age} years`
            : "",
          gestationalAge: "",
          deliveryPlace: notification.mother?.placeOfDelivery || "Unknown",
        });
      }
    });

    return previewData;
  };

  const loadDateRangeData = async (): Promise<ApiNotification[]> => {
    if (startDate > endDate) {
      Alert.alert("Error", "Start date cannot be after end date");
      return [];
    }

    try {
      setIsLoading(true);
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      console.log(`Loading data from ${startDateStr} to ${endDateStr}`);

      // Fetch stats data
      const stats = await fetchStatsData(startDateStr, endDateStr);
      if (stats) {
        setStatsData(stats);
      }

      // Fetch detailed data for preview/download
      const apiData = await fetchDateRangeData(startDateStr, endDateStr);
      setRawData(apiData);

      return apiData; // Always return the data
    } catch (error) {
      console.error("Error loading date range data:", error);
      Alert.alert("Error", "Failed to load data for the selected date range");
      return []; // Return empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setIsLoading(true);

      // If we don't have raw data, load it first
      let dataToUse: ApiNotification[] = rawData;

      if (!dataToUse || dataToUse.length === 0) {
        dataToUse = await loadDateRangeData();
      }

      if (dataToUse && dataToUse.length > 0) {
        const processedData = processApiData(dataToUse);
        setPreviewData(processedData);
        setPreviewVisible(true);
      } else {
        Alert.alert("Info", "No data available for the selected date range");
      }
    } catch (error) {
      console.error("Error preparing preview:", error);
      Alert.alert("Error", "Failed to load preview data");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDateRangeReport = async () => {
    if (startDate > endDate) {
      Alert.alert("Error", "Start date cannot be after end date");
      return;
    }

    try {
      Alert.alert("Download", "Preparing date range report...");

      // If we don't have raw data, load it first
      let dataToUse: ApiNotification[] = rawData;

      if (!dataToUse || dataToUse.length === 0) {
        dataToUse = await loadDateRangeData();
      }

      if (!dataToUse || dataToUse.length === 0) {
        Alert.alert("Info", "No data available to download");
        return;
      }

      const excelData = processApiData(dataToUse).map((item) => ({
        Sex: item.sex,
        Type: item.type,
        Facility: item.facility,
        Date: item.date,
        Weight: item.weight,
        "Mother's Age": item.motherAge,
        "Gestational Age": item.gestationalAge,
        "Delivery Place": item.deliveryPlace,
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stillbirth Linelist");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      const fileName = `stillbirth_linelist_${formatDate(
        startDate
      )}_to_${formatDate(endDate)}.xlsx`;
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
          dialogTitle: "Download Stillbirth Linelist",
        });
      } else {
        Alert.alert("Success", "File downloaded successfully!");
      }

      setPreviewVisible(false);
    } catch (error) {
      console.error("Error downloading report:", error);
      Alert.alert("Error", "Failed to download report. Please try again.");
    }
  };

  // Load data when component mounts
  useEffect(() => {
    const loadDataOnMount = async () => {
      console.log("Component mounted, loading initial data...");
      await loadDateRangeData();
    };

    loadDataOnMount();
  }, []);

  // Load data when dates change
  useEffect(() => {
    const loadDataOnDateChange = async () => {
      if (startDate && endDate) {
        console.log("Dates changed, loading data...");
        await loadDateRangeData();
      }
    };

    loadDataOnDateChange();
  }, [startDate, endDate]);

  // Shared card style - equal sizes for all tiles
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
            <Text style={tw`text-lg font-bold text-purple-600`}>MOH 369</Text>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={tw`p-2`}
            >
              <Text style={tw`text-lg font-bold`}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={tw`text-gray-600 mb-4 text-purple-600`}>
            Showing data from {formatDate(startDate)} to {formatDate(endDate)}
          </Text>

          {isLoading ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <ActivityIndicator size="large" color="#6D28D9" />
              <Text style={tw`mt-2 text-gray-600`}>Loading preview...</Text>
            </View>
          ) : (
            <>
              <ScrollView style={tw`flex-1 mb-4`}>
                {previewData.length > 0 ? (
                  <View style={tw`border border-gray-200 rounded-lg`}>
                    {/* Table Header */}
                    <View
                      style={tw`flex-row bg-purple-100 p-3 border-b border-gray-200`}
                    >
                      <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Sex
                      </Text>
                      <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Type
                      </Text>
                      <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Facility
                      </Text>
                      <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Date
                      </Text>
                    </View>
                    {/* Rows */}
                    {previewData.map((item: PreviewData, index: number) => (
                      <View
                        key={index}
                        style={tw`flex-row p-3 border-b border-gray-100`}
                      >
                        <Text style={tw`flex-1 text-xs`}>{item.sex}</Text>
                        <Text style={tw`flex-1 text-xs`}>{item.type}</Text>
                        <Text style={tw`flex-1 text-xs`}>{item.facility}</Text>
                        <Text style={tw`flex-1 text-xs`}>{item.date}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={tw`text-center text-gray-500 py-8`}>
                    No data available for the selected date range
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
                  onPress={downloadDateRangeReport}
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

      <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
        {/* <Text style={tw`text-xl font-bold text-purple-700 mb-4 text-center`}>
          MOH 369 - Date Range Report
        </Text> */}

        {/* Two Date Pickers */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
            Select Date Range
          </Text>
          <View style={tw`flex-row gap-3`}>
            {/* Start Date Picker */}
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs text-purple-600 mb-1`}>Start Date</Text>
              <TouchableOpacity
                style={tw`border border-gray-300 p-3 rounded-lg bg-white`}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={tw`text-purple-600 text-center`}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* End Date Picker */}
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs text-gray-600 mb-1`}>End Date</Text>
              <TouchableOpacity
                style={tw`border border-gray-300 p-3 rounded-lg bg-white`}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={tw`text-gray-700 text-center`}>
                  {formatDate(endDate)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleStartDateChange}
            maximumDate={endDate}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleEndDateChange}
            minimumDate={startDate}
            maximumDate={new Date()}
          />
        )}

        {/* Stats Tiles */}
        <View style={tw`mt-4`}>
          {/* Row 1 - Total Cases and Sex Distribution */}
          <View style={tw`flex-row mb-2`}>
            {/* Total Cases - Clickable for preview */}
            <TouchableOpacity
              style={[cardStyle, statsData.total === 0 && tw`opacity-50`]}
              onPress={handlePreview}
              disabled={statsData.total === 0}
            >
              <Text
                style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
              >
                Total Cases
              </Text>
              <Text style={tw`text-2xl text-gray-700 text-center`}>
                {statsData.total}
              </Text>
              <Text style={tw`text-xs text-purple-500 text-center mt-2`}>
                {statsData.total > 0
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
                ♀ Female: {statsData.sex.female}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                ♂ Male: {statsData.sex.male}
              </Text>
            </View>
          </View>

          {/* Row 2 - Type and Delivery Place */}
          <View style={tw`flex-row`}>
            {/* Type */}
            <View style={cardStyle}>
              <Text
                style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
              >
                Type
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                Fresh: {statsData.type.fresh}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                Macerated: {statsData.type.macerated}
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
                🏠 Home: {statsData.place.home}
              </Text>
              <Text style={tw`text-gray-700 text-center`}>
                🏥 Facility: {statsData.place.facility}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DateRangeReport;
