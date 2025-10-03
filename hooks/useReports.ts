import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { ReportService } from "../services/reportService";
import { DateRange, MonthlyReportItem, PreviewData, RawDataItem, ReportData } from "../types/reports";

interface UseReportsReturn {
  reportData: { today: ReportData; monthly: MonthlyReportItem[] } | null;
  isLoading: boolean;
  error: string | null;
  refreshReports: () => Promise<void>;
}

export const useReports = (): UseReportsReturn => {
  const [reportData, setReportData] = useState<{ today: ReportData; monthly: MonthlyReportItem[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const locationId = await ReportService.getLocationId();
      const data = await ReportService.fetchReportData(locationId);
      setReportData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch report data";
      setError(errorMessage);
      console.error("Error fetching report data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return {
    reportData,
    isLoading,
    error,
    refreshReports: fetchReportData,
  };
};

interface UseDetailedReportReturn {
  rawData: RawDataItem[];
  previewData: PreviewData[];
  isLoading: boolean;
  error: string | null;
  fetchDetailedData: (dateRange: DateRange) => Promise<void>;
  clearData: () => void;
}

export const useDetailedReport = (): UseDetailedReportReturn => {
  const [rawData, setRawData] = useState<RawDataItem[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetailedData = async (dateRange: DateRange) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const locationId = await ReportService.getLocationId();
      const data = await ReportService.fetchDetailedData(dateRange, locationId);
      
      setRawData(data);
      setPreviewData(ReportService.preparePreviewData(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch detailed data";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setRawData([]);
    setPreviewData([]);
    setError(null);
  };

  return {
    rawData,
    previewData,
    isLoading,
    error,
    fetchDetailedData,
    clearData,
  };
};