import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
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
  date: string;
  sex: string;
  type: string;
  facility: string;
  weight: string;
  motherAge: string;
  gestationalAge: string;
  deliveryPlace: string;
}

interface ApiNotification {
  id: number;
  dateOfNotification: string;
  location: {
    name: string;
  };
  mother: {
    age: number;
    placeOfDelivery: string;
  };
  babies: Array<{
    sex: string;
    type: string;
    weight: number;
    gestationalAge: number;
  }>;
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

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

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

  // Function to fetch date range data
  const fetchDateRangeData = async (
    startDateStr: string,
    endDateStr: string
  ): Promise<ApiNotification[]> => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const locationId = await AsyncStorage.getItem("location_id");

      if (!accessToken) {
        throw new Error("User not authenticated");
      }

      if (!locationId) {
        throw new Error("Location ID not found");
      }

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const apiData = result.data || result || [];

      console.log(`Fetched ${apiData.length} records`);
      console.log("API response:", apiData);

      return apiData;
    } catch (error) {
      console.error("Error fetching date range data:", error);
      Alert.alert("Error", "Failed to fetch data for the selected date range");
      return [];
    }
  };

  // Process API data to create preview data
  const processApiData = (apiData: ApiNotification[]): PreviewData[] => {
    if (!apiData || apiData.length === 0) return [];

    const previewData: PreviewData[] = [];

    apiData.forEach((notification) => {
      // Process each baby in the notification
      notification.babies?.forEach((baby) => {
        previewData.push({
          date: notification.dateOfNotification || "",
          sex: baby.sex || "Unknown",
          type: baby.type || "Unknown",
          facility: notification.location?.name || "Unknown",
          weight: baby.weight ? `${baby.weight} kg` : "",
          motherAge: notification.mother?.age
            ? `${notification.mother.age} years`
            : "",
          gestationalAge: baby.gestationalAge
            ? `${baby.gestationalAge} weeks`
            : "",
          deliveryPlace: notification.mother?.placeOfDelivery || "Unknown",
        });
      });

      // If no babies array, create a basic entry from notification data
      if (!notification.babies || notification.babies.length === 0) {
        previewData.push({
          date: notification.dateOfNotification || "",
          sex: "Unknown",
          type: "Unknown",
          facility: notification.location?.name || "Unknown",
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

  // Load data for the selected date range
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

      const apiData = await fetchDateRangeData(startDateStr, endDateStr);
      setRawData(apiData);

      return apiData;
    } catch (error) {
      console.error("Error loading date range data:", error);
      Alert.alert("Error", "Failed to load data for the selected date range");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setIsLoading(true);

      let dataToUse: ApiNotification[] = [];

      if (rawData && rawData.length > 0) {
        dataToUse = rawData;
      } else {
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

      let dataToUse: ApiNotification[] = [];

      if (rawData && rawData.length > 0) {
        dataToUse = rawData;
      } else {
        dataToUse = await loadDateRangeData();
      }

      if (!dataToUse || dataToUse.length === 0) {
        Alert.alert("Info", "No data available to download");
        return;
      }

      // Prepare data for Excel
      const excelData = processApiData(dataToUse).map((item) => ({
        Date: item.date,
        Sex: item.sex,
        Type: item.type,
        Facility: item.facility,
        Weight: item.weight,
        "Mother's Age": item.motherAge,
        "Gestational Age": item.gestationalAge,
        "Delivery Place": item.deliveryPlace,
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stillbirth Linelist");

      // Generate buffer as base64
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Create file path
      const fileName = `stillbirth_linelist_${formatDate(
        startDate
      )}_to_${formatDate(endDate)}.xlsx`;
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
            <Text style={tw`text-xl font-bold text-purple-600`}>
              MOH 369 Preview
            </Text>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={tw`p-2`}
            >
              <Text style={tw`text-lg font-bold`}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={tw`text-gray-600 mb-4`}>
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
                        Date
                      </Text>
                      <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Sex
                      </Text>
                      {/* <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Type
                      </Text> */}
                      <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Facility
                      </Text>
                      {/* <Text
                        style={tw`flex-1 font-bold text-purple-600 text-xs`}
                      >
                        Weight
                      </Text> */}
                    </View>
                    {/* Table Rows */}
                    {previewData.map((item: PreviewData, index: number) => (
                      <View
                        key={index}
                        style={tw`flex-row p-3 border-b border-gray-100`}
                      >
                        <Text style={tw`flex-1 text-xs`}>{item.date}</Text>
                        <Text style={tw`flex-1 text-xs`}>{item.sex}</Text>
                        {/* <Text style={tw`flex-1 text-xs`}>{item.type}</Text> */}
                        <Text style={tw`flex-1 text-xs`}>{item.facility}</Text>
                        {/* <Text style={tw`flex-1 text-xs`}>{item.weight}</Text> */}
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
        <Text style={tw`text-xl font-bold text-purple-700 mb-4 text-center`}>
          MOH 369
        </Text>

        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
            Start Date
          </Text>
          <TouchableOpacity
            style={tw`border border-gray-300 p-3 rounded-lg bg-white`}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={tw`text-gray-700`}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
            End Date
          </Text>
          <TouchableOpacity
            style={tw`border border-gray-300 p-3 rounded-lg bg-white`}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={tw`text-gray-700`}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

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

        {/* Action Buttons */}
        <View style={tw`flex-row gap-3 mt-4`}>
          <TouchableOpacity
            onPress={handlePreview}
            style={tw`flex-1 bg-purple-600 py-3 rounded-lg`}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-center text-white font-semibold`}>
                Preview Data
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={downloadDateRangeReport}
            style={tw`flex-1 bg-green-600 py-3 rounded-lg`}
            disabled={isLoading}
          >
            <Text style={tw`text-center text-white font-semibold`}>
              Download Excel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Count Info */}
        {rawData.length > 0 && (
          <View style={tw`bg-purple-50 p-3 rounded-lg mt-4`}>
            <Text style={tw`text-purple-700 text-center`}>
              Found {rawData.length} notifications with {previewData.length}{" "}
              records
            </Text>
          </View>
        )}

        {/* No Data Message */}
        {rawData.length === 0 && !isLoading && (
          <View style={tw`bg-yellow-100 p-4 rounded-lg mt-4`}>
            <Text style={tw`text-yellow-700 text-center`}>
              Select a date range and click "Preview Data" to view records
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DateRangeReport;
