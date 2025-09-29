import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import tw from "tailwind-react-native-classnames";
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

const UnifiedReport: React.FC<UnifiedReportProps> = ({ type, onDateRangeChange }) => {
  const { reportData, isLoading, error } = useReports();
  const { previewData, isLoading: detailLoading, fetchDetailedData } = useDetailedReport();
  
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
          />
        );

      case ReportType.MONTHLY:
        return (
          <ScrollView>
            {reportData.monthly.map((monthData, index) => (
              <View key={index} style={tw`bg-purple-50 p-4 rounded-lg shadow-md mb-6`}>
                <Text style={tw`text-xl font-bold text-purple-700 mb-4 text-center`}>
                  {monthData.month}
                </Text>
                <ReportTiles
                  data={monthData}
                  title={`${monthData.month}'s Report`}
                  onTotalPress={() => handleMonthSelect(monthData.month)}
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
                showDatePicker={false}
              />
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
        onDownload={() => {
        //   TODO: IMPLEMENT DOWNLOAD HERE
          Alert.alert("Download", "Download functionality would be implemented here");
        }}
        isLoading={detailLoading}
      />
    </View>
  );
};

export default UnifiedReport;