import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import tw from "tailwind-react-native-classnames";
import { BASE_URL } from "../constants/ApiConfig";

interface DateRangeReportProps {}

const DateRangeReport: React.FC<DateRangeReportProps> = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchDateRangeData = async (startDate: string, endDate: string) => {
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
        `${BASE_URL}/reports/linelist?startDate=${startDate}&endDate=${endDate}&locationId=${locationId}`,
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching date range data:", error);
      Alert.alert("Error", "Failed to fetch data for the selected date range");
      return [];
    }
  };

  // Simple CSV generator as a fallback
  const generateCSV = (data: any[]): string => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    );

    return [headers, ...rows].join("\n");
  };

  const downloadDateRangeReport = async () => {
    if (startDate > endDate) {
      Alert.alert("Error", "Start date cannot be after end date");
      return;
    }

    try {
      setIsLoading(true);

      const linelistData = await fetchDateRangeData(
        formatDate(startDate),
        formatDate(endDate)
      );

      if (linelistData.length === 0) {
        Alert.alert("Info", "No data available for the selected date range");
        return;
      }

      // Try to use xlsx if available, otherwise fallback to CSV
      let fileUri: string;
      let fileName: string;
      let mimeType: string;

      try {
        // Dynamic import to avoid bundling issues
        const XLSX = await import("xlsx");

        const ws = XLSX.utils.json_to_sheet(linelistData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          `Stillbirths ${formatDate(startDate)} to ${formatDate(endDate)}`
        );

        fileName = `stillbirths_${formatDate(startDate)}_to_${formatDate(
          endDate
        )}.xlsx`;
        const directoryUri = FileSystem.documentDirectory;
        fileUri = `${directoryUri}${fileName}`;
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (xlsxError) {
        console.log("XLSX failed, falling back to CSV", xlsxError);

        // Fallback to CSV
        const csvData = generateCSV(linelistData);
        fileName = `stillbirths_${formatDate(startDate)}_to_${formatDate(
          endDate
        )}.csv`;
        const directoryUri = FileSystem.documentDirectory;
        fileUri = `${directoryUri}${fileName}`;
        mimeType = "text/csv";

        await FileSystem.writeAsStringAsync(fileUri, csvData, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: "Download Date Range Report",
        });
      } else {
        Alert.alert("Success", `Report saved as ${fileName}`);
      }
    } catch (error) {
      console.error("Error downloading date range report:", error);
      Alert.alert("Error", "Failed to generate report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
      <Text style={tw`text-xl font-bold text-purple-700 mb-4 text-center`}>
        MOH 369 Date Range Report
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

      <TouchableOpacity
        style={tw`bg-purple-600 p-2 rounded-lg shadow-md ${
          isLoading ? "opacity-50" : ""
        }`}
        onPress={downloadDateRangeReport}
        disabled={isLoading}
      >
        <Text style={tw`text-white text-lg font-semibold text-center`}>
          {isLoading ? "Generating Report..." : "📊 Generate Custom Report"}
        </Text>
        <Text style={tw`text-purple-100 text-sm text-center mt-1`}>
          Export data from {formatDate(startDate)} to {formatDate(endDate)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DateRangeReport;
