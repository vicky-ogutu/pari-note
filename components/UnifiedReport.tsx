import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import * as XLSX from "xlsx";
import { useDetailedReport, useReports } from "../hooks/useReports";
import { ReportService } from "../services/reportService";
import { DateRange, ReportType } from "../types/reports";
import DateRangePicker from "./DateRangePicker";
import ReportPreview from "./ReportPreview";
import ReportTiles from "./ReportTiles";

interface UnifiedReportProps {
  type: ReportType;
  onDateRangeChange?: (dateRange: DateRange) => void;
}

const UnifiedReport: React.FC<UnifiedReportProps> = ({
  type,
  onDateRangeChange,
}) => {
  const { reportData, isLoading, error } = useReports();
  const {
    previewData,
    isLoading: detailLoading,
    fetchDetailedData,
  } = useDetailedReport();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: ReportService.getTodayDate(),
    endDate: ReportService.getTodayDate(),
  });

  const handleDateRangeSelect = (range: DateRange) => {
    setDateRange(range);
    setShowDatePicker(false);
    onDateRangeChange?.(range);

    if (type === ReportType.DATE_RANGE) {
      fetchDetailedData(range);
    }
  };

  const handleMonthSelect = async (month: string) => {
    setSelectedMonth(month);
    try {
      const monthRange = ReportService.getMonthDates(month);
      await fetchDetailedData(monthRange);
      setShowPreview(true);
    } catch (error) {
      Alert.alert("Error", "Failed to load monthly data");
    }
  };

  const handleTodayPreview = async () => {
    const today = ReportService.getTodayDate();
    const todayRange = { startDate: today, endDate: today };
    await fetchDetailedData(todayRange);
    setShowPreview(true);
  };

  // Download functionality
  const downloadReport = async () => {
    try {
      if (!previewData || previewData.length === 0) {
        Alert.alert("Info", "No data available to download");
        return;
      }

      Alert.alert("Download", "Preparing report for download...");

      let fileName = "";
      let sheetName = "";

      // Determine file name and sheet name based on report type
      switch (type) {
        case ReportType.TODAY:
          const today = ReportService.getTodayDate();
          fileName = `today_stillbirth_report_${today}.xlsx`;
          sheetName = "Today's Report";
          break;

        case ReportType.MONTHLY:
          fileName = `monthly_stillbirth_report_${selectedMonth.replace(
            " ",
            "_"
          )}.xlsx`;
          sheetName = `${selectedMonth} Report`;
          break;

        case ReportType.DATE_RANGE:
          fileName = `stillbirth_report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;
          sheetName = "Date Range Report";
          break;
      }

      // Process data for Excel
      const excelData = previewData.flatMap((item: any) => {
        if (item.babies && item.babies.length > 0) {
          return item.babies.map((baby: any) => ({
            Sex: baby.sex || "Unknown",
            Type: baby.outcome || "Unknown",
            Facility: item.location?.name || "Unknown",
            Date: item.dateOfNotification || "",
            Weight: baby.weight || "",
            "Mother Age": item.motherAge || "",
            "Gestational Age": item.gestationalAge || "",
            "Delivery Place": item.deliveryPlace || "",
            "Notification Date": item.dateOfNotification || "",
            "Birth Date": item.birthDate || "",
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
            "Delivery Place": item.deliveryPlace || "",
            "Notification Date": item.dateOfNotification || "",
            "Birth Date": item.birthDate || "",
          },
        ];
      });

      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate file
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Save file
      const directory = FileSystem.cacheDirectory + "reports/";

      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const fileUri = directory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: `Download ${sheetName}`,
        });
      } else {
        Alert.alert(
          "Success",
          `Report downloaded successfully!\nFile: ${fileName}`
        );
      }

      setShowPreview(false);
    } catch (error) {
      console.error("Error downloading report:", error);
      Alert.alert("Error", "Failed to download report. Please try again.");
    }
  };

  const downloadMonthlyReportDirect = async (month: string) => {
    try {
      Alert.alert("Download", `Preparing report for ${month}...`);

      const monthRange = ReportService.getMonthDates(month);
      await fetchDetailedData(monthRange);

      // Wait for previewData to update (since fetchDetailedData likely updates previewData via state)
      if (!previewData || previewData.length === 0) {
        Alert.alert("Info", `No data available for ${month}`);
        return;
      }

      // Set the data and trigger download
      setSelectedMonth(month);
      await downloadReport();
    } catch (error) {
      console.error("Error downloading monthly report:", error);
      Alert.alert(
        "Error",
        "Failed to download monthly report. Please try again."
      );
    }
  };

  const downloadTodayReportDirect = async () => {
    try {
      Alert.alert("Download", "Preparing today's report...");

      const today = ReportService.getTodayDate();
      const todayRange = { startDate: today, endDate: today };
      await fetchDetailedData(todayRange);

      if (!previewData || previewData.length === 0) {
        Alert.alert("Info", "No data available for today");
        return;
      }

      await downloadReport();
    } catch (error) {
      console.error("Error downloading today's report:", error);
      Alert.alert(
        "Error",
        "Failed to download today's report. Please try again."
      );
    }
  };

  const downloadDateRangeReportDirect = async () => {
    try {
      Alert.alert("Download", "Preparing date range report...");

      if (!dateRange.startDate || !dateRange.endDate) {
        Alert.alert("Error", "Please select a date range first");
        return;
      }

      await fetchDetailedData(dateRange);

      if (!previewData || previewData.length === 0) {
        Alert.alert("Info", "No data available for the selected date range");
        return;
      }

      await downloadReport();
    } catch (error) {
      console.error("Error downloading date range report:", error);
      Alert.alert(
        "Error",
        "Failed to download date range report. Please try again."
      );
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <ActivityIndicator size="large" color="#6D28D9" />
          <Text style={tw`mt-2 text-gray-600`}>Loading report data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={tw`bg-red-100 p-4 rounded-lg m-4`}>
          <Text style={tw`text-red-700 text-center`}>{error}</Text>
        </View>
      );
    }

    if (!reportData) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-gray-500 text-lg`}>No data available</Text>
        </View>
      );
    }

    switch (type) {
      case ReportType.TODAY:
        return (
          <ReportTiles
            data={reportData.today}
            title="Today's Report"
            onTotalPress={handleTodayPreview}
            showDatePicker={false}
            onDownload={downloadTodayReportDirect}
          />
        );

      case ReportType.MONTHLY:
        return (
          <ScrollView>
            {reportData.monthly.map((monthData, index) => (
              <View
                key={index}
                style={tw`bg-purple-50 p-4 rounded-lg shadow-md mb-6`}
              >
                {/* <Text
                  style={tw`text-xl font-bold text-purple-700 mb-4 text-center`}
                >
                  {monthData.month}
                </Text> */}
                <ReportTiles
                  data={monthData}
                  title={`${monthData.month}'s Report`}
                  onTotalPress={() => handleMonthSelect(monthData.month)}
                  onDownload={() =>
                    downloadMonthlyReportDirect(monthData.month)
                  }
                  showDatePicker={false}
                />
              </View>
            ))}
          </ScrollView>
        );

      case ReportType.DATE_RANGE:
        return (
          <View style={tw`bg-white p-4 rounded-lg shadow-md`}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={tw`bg-purple-600 py-3 rounded-lg mb-4`}
            >
              <Text style={tw`text-center text-white font-semibold`}>
                Select Date Range
              </Text>
            </TouchableOpacity>

            <Text style={tw`text-center text-gray-600 mb-4`}>
              {dateRange.startDate} to {dateRange.endDate}
            </Text>

            {previewData.length > 0 && (
              <ReportTiles
                data={ReportService.processRawData(previewData as any)}
                title="Selected Date Range"
                onTotalPress={() => setShowPreview(true)}
                onDownload={downloadDateRangeReportDirect}
                showDatePicker={false}
              />
            )}

            {previewData.length === 0 &&
              dateRange.startDate !== dateRange.endDate && (
                <TouchableOpacity
                  onPress={downloadDateRangeReportDirect}
                  style={tw`bg-green-600 py-3 rounded-lg mt-4`}
                >
                  <Text style={tw`text-center text-white font-semibold`}>
                    Download Date Range Report
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={tw`flex-1`}>
      {renderContent()}

      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateRangeSelect={handleDateRangeSelect}
        initialRange={dateRange}
      />

      <ReportPreview
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        previewData={previewData}
        title={
          type === ReportType.TODAY
            ? "Today's Report"
            : type === ReportType.MONTHLY
            ? selectedMonth
            : `Date Range: ${dateRange.startDate} to ${dateRange.endDate}`
        }
        onDownload={downloadReport}
        isLoading={detailLoading}
      />
    </View>
  );
};

export default UnifiedReport;
