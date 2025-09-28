// Try importing the legacy version directly at the top
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

interface ReportDashboardProps {
  data?: {
    total: number;
    sex: { female?: number; male?: number };
    type: { [key: string]: number | undefined };
    place?: { home?: number; facility?: number };
  };
}

interface PreviewData {
  sex: string;
  type: string;
  facility: string;
  female: string;
  male: string;
  date?: string;
  time?: string;
  place?: string;
  weight?: string;
  motherAge?: string;
  gestationalAge?: string;
}

interface RawDataItem {
  female?: string | number;
  male?: string | number;
  type?: string;
  facility?: string;
  place?: string;
  date?: string;
  time?: string;
  weight?: string;
  motherAge?: string;
  gestationalAge?: string;
  // Add fields that match the API response structure
  location?: {
    name?: string;
    facilityName?: string;
  };
  babies?: any[];
  dateOfNotification?: string;
  outcome?: string;
  sex?: string;
  healthFacility?: string;
  facilityName?: string;
}

interface TileData {
  total: number;
  sex: { female: number; male: number };
  type: { fresh: number; macerated: number };
  place: { home: number; facility: number };
  rawData?: RawDataItem[];
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({
  data: propData,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [loading, setLoading] = useState(false);
  const [tileData, setTileData] = useState<TileData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>("");

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Load location name on component mount
  useEffect(() => {
    const loadLocationName = async () => {
      try {
        const name = await AsyncStorage.getItem("location_name");
        if (name) {
          setLocationName(name);
        }
      } catch (error) {
        console.error("Error loading location name:", error);
      }
    };
    loadLocationName();
  }, []);

  // Function to fetch today's data
  const fetchTodayData = async (): Promise<RawDataItem[]> => {
    try {
      setDataLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      const today = getTodayDate();
      const locationId = await AsyncStorage.getItem("location_id");

      if (!locationId) {
        Alert.alert("Error", "Location ID not found");
        return [];
      }

      const response = await fetch(
        `${BASE_URL}/notifications/stillbirths/records/${locationId}?startDate=${today}&endDate=${today}`,
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
      console.log("Full API Response:", JSON.stringify(result, null, 2)); // Detailed log

      const rawData: RawDataItem[] = result.data || result || [];

      console.log("Raw data length:", rawData.length);
      if (rawData.length > 0) {
        console.log(
          "First item structure:",
          JSON.stringify(rawData[0], null, 2)
        );
      }

      // Process the raw data to create tile data
      const processedData = processRawData(rawData);
      setTileData({
        ...processedData,
        rawData,
      });

      return rawData;
    } catch (error) {
      console.error("Error fetching today's data:", error);
      Alert.alert("Error", "Failed to fetch today's data. Please try again.");
      return [];
    } finally {
      setDataLoading(false);
    }
  };

  // Process raw data to create tile statistics
  const processRawData = (rawData: any[]): Omit<TileData, "rawData"> => {
    // Flatten the data if it has babies array
    const flattenedData = rawData.flatMap((item) => {
      if (item.babies && item.babies.length > 0) {
        return item.babies.map((baby: any) => ({
          ...item,
          ...baby,
          sex: baby.sex,
          type: baby.outcome || baby.type,
        }));
      }
      return item;
    });

    console.log("Flattened data for processing:", flattenedData); // Debug log

    const total = flattenedData.length;

    // Calculate sex distribution
    const sex = {
      female: flattenedData.filter(
        (item) =>
          item.sex === "Female" || (item.female && Number(item.female) > 0)
      ).length,
      male: flattenedData.filter(
        (item) => item.sex === "Male" || (item.male && Number(item.male) > 0)
      ).length,
    };

    // Calculate type distribution
    const type = {
      fresh: flattenedData.filter(
        (item) =>
          item.type?.toLowerCase().includes("fresh") ||
          item.type === "fresh" ||
          item.outcome?.toLowerCase().includes("fresh")
      ).length,
      macerated: flattenedData.filter(
        (item) =>
          item.type?.toLowerCase().includes("macerated") ||
          item.type === "macerated" ||
          item.outcome?.toLowerCase().includes("macerated")
      ).length,
    };

    // Calculate delivery place distribution
    const place = {
      home: flattenedData.filter(
        (item) =>
          item.place?.toLowerCase().includes("home") || item.place === "home"
      ).length,
      facility: flattenedData.filter(
        (item) =>
          item.place?.toLowerCase().includes("facility") ||
          item.facility ||
          item.place === "facility"
      ).length,
    };

    return { total, sex, type, place };
  };

  // Function to prepare preview data - properly handle API response structure
  const preparePreviewData = (rawData: any[]): PreviewData[] => {
    console.log("Raw data for preview:", rawData); // Debug log

    return rawData.flatMap((item: any) => {
      // Extract facility name - try different possible fields
      let facilityName = "Unknown";

      // Try different possible facility field names from API
      if (item.facility) {
        facilityName = item.facility;
      } else if (item.location && typeof item.location === "object") {
        facilityName =
          item.location.name || item.location.facilityName || "Unknown";
      } else if (item.healthFacility) {
        facilityName = item.healthFacility;
      } else if (item.facilityName) {
        facilityName = item.facilityName;
      }

      console.log("Facility extracted:", facilityName, "from item:", item); // Debug log

      // Handle cases where there might be multiple babies
      if (item.babies && item.babies.length > 0) {
        return item.babies.map((baby: any) => ({
          sex:
            baby.sex ||
            (baby.female ? "Female" : baby.male ? "Male" : "Unknown"),
          type: baby.outcome || baby.type || "Unknown",
          facility: facilityName,
          female: baby.sex === "Female" ? "1" : baby.female ? "1" : "",
          male: baby.sex === "Male" ? "1" : baby.male ? "1" : "",
          date: item.dateOfNotification || item.date || "",
          time: item.time || "",
          place: item.place || baby.place || "",
          weight: baby.weight || "",
          motherAge: item.motherAge || "",
          gestationalAge: baby.gestationalAge || "",
        }));
      }

      // For items without babies array
      return [
        {
          sex:
            item.sex ||
            (item.female ? "Female" : item.male ? "Male" : "Unknown"),
          type: item.outcome || item.type || "Unknown",
          facility: facilityName,
          female: item.female?.toString() || "",
          male: item.male?.toString() || "",
          date: item.dateOfNotification || item.date || "",
          time: item.time || "",
          place: item.place || "",
          weight: item.weight || "",
          motherAge: item.motherAge || "",
          gestationalAge: item.gestationalAge || "",
        },
      ];
    });
  };

  // Create mock raw data based on tile statistics for preview/download when using propData
  const createMockRawDataFromStats = (
    stats: Omit<TileData, "rawData">
  ): RawDataItem[] => {
    const mockData: RawDataItem[] = [];

    // Add female entries
    for (let i = 0; i < stats.sex.female; i++) {
      mockData.push({
        female: 1,
        male: 0,
        type: i < stats.type.fresh ? "fresh" : "macerated",
        facility: "Facility",
        place: i < stats.place.home ? "home" : "facility",
        date: getTodayDate(),
      });
    }

    // Add male entries
    for (let i = 0; i < stats.sex.male; i++) {
      mockData.push({
        female: 0,
        male: 1,
        type: i + stats.sex.female < stats.type.fresh ? "fresh" : "macerated",
        facility: "Facility",
        place: i + stats.sex.female < stats.place.home ? "home" : "facility",
        date: getTodayDate(),
      });
    }

    return mockData;
  };

  // Fetch data on component mount if not provided via props
  useEffect(() => {
    if (propData) {
      // If data is provided via props, use it to set tileData
      const stats: Omit<TileData, "rawData"> = {
        total: propData.total || 0,
        sex: {
          female: propData.sex?.female || 0,
          male: propData.sex?.male || 0,
        },
        type: {
          fresh:
            propData.type?.["fresh stillbirth"] ??
            propData.type?.["fresh"] ??
            0,
          macerated:
            propData.type?.["macerated stillbirth"] ??
            propData.type?.["macerated"] ??
            0,
        },
        place: {
          home: propData.place?.home || 0,
          facility: propData.place?.facility || 0,
        },
      };
      const mockRawData = createMockRawDataFromStats(stats);
      setTileData({
        ...stats,
        rawData: mockRawData,
      });
    } else {
      // If no props provided, fetch data from API
      fetchTodayData();

      // 🔄 Auto-refresh every 60 seconds
      const interval = setInterval(() => {
        fetchTodayData();
      }, 60000);

      // Clear interval on unmount
      return () => clearInterval(interval);
    }
  }, [propData]);

  const handleTotalPress = async () => {
    try {
      setLoading(true);
      let rawData: RawDataItem[] = [];

      // If we have tileData with rawData, use it
      if (tileData?.rawData) {
        rawData = tileData.rawData;
      } else if (propData) {
        // If we have propData but no rawData, create mock data
        const stats: Omit<TileData, "rawData"> = {
          total: propData.total || 0,
          sex: {
            female: propData.sex?.female || 0,
            male: propData.sex?.male || 0,
          },
          type: {
            fresh:
              propData.type?.["fresh stillbirth"] ??
              propData.type?.["fresh"] ??
              0,
            macerated:
              propData.type?.["macerated stillbirth"] ??
              propData.type?.["macerated"] ??
              0,
          },
          place: {
            home: propData.place?.home || 0,
            facility: propData.place?.facility || 0,
          },
        };
        rawData = createMockRawDataFromStats(stats);
      } else {
        // Otherwise, fetch fresh data
        rawData = await fetchTodayData();
      }

      if (rawData && rawData.length > 0) {
        const previewData = preparePreviewData(rawData);
        setPreviewData(previewData);
        setPreviewVisible(true);
      } else {
        Alert.alert("Info", "No data available for today");
      }
    } catch (error) {
      console.error("Error preparing preview:", error);
      Alert.alert("Error", "Failed to load preview data");
    } finally {
      setLoading(false);
    }
  };

  const downloadLinelistReport = async () => {
    try {
      Alert.alert("Download", "Preparing linelist report...");
      let rawData: RawDataItem[] = [];

      // Use the same data that was used for preview
      if (tileData?.rawData && tileData.rawData.length > 0) {
        rawData = tileData.rawData;
      } else if (propData) {
        // If we have propData but no rawData, create mock data
        const stats: Omit<TileData, "rawData"> = {
          total: propData.total || 0,
          sex: {
            female: propData.sex?.female || 0,
            male: propData.sex?.male || 0,
          },
          type: {
            fresh:
              propData.type?.["fresh stillbirth"] ??
              propData.type?.["fresh"] ??
              0,
            macerated:
              propData.type?.["macerated stillbirth"] ??
              propData.type?.["macerated"] ??
              0,
          },
          place: {
            home: propData.place?.home || 0,
            facility: propData.place?.facility || 0,
          },
        };
        rawData = createMockRawDataFromStats(stats);
      } else {
        // Fallback: fetch fresh data
        rawData = await fetchTodayData();
      }

      if (!rawData || rawData.length === 0) {
        Alert.alert("Info", "No data available to download");
        return;
      }

      // Prepare data for Excel
      const excelData = rawData.flatMap((item: any) => {
        // Extract facility name same as above
        let facilityName = "Unknown";
        if (item.facility) {
          facilityName = item.facility;
        } else if (item.location && typeof item.location === "object") {
          facilityName =
            item.location.name || item.location.facilityName || "Unknown";
        } else if (item.healthFacility) {
          facilityName = item.healthFacility;
        } else if (item.facilityName) {
          facilityName = item.facilityName;
        }

        if (item.babies && item.babies.length > 0) {
          return item.babies.map((baby: any) => ({
            Sex:
              baby.sex ||
              (baby.female ? "Female" : baby.male ? "Male" : "Unknown"),
            Type: baby.outcome || baby.type || "Unknown",
            Facility: facilityName,
            Date: item.dateOfNotification || item.date || "",
            Time: item.time || "",
            "Delivery Place": item.place || baby.place || "",
            Weight: baby.weight || "",
            "Mother's Age": item.motherAge || "",
            "Gestational Age": baby.gestationalAge || "",
          }));
        }

        return [
          {
            Sex:
              item.sex ||
              (item.female ? "Female" : item.male ? "Male" : "Unknown"),
            Type: item.outcome || item.type || "Unknown",
            Facility: facilityName,
            Date: item.dateOfNotification || item.date || "",
            Time: item.time || "",
            "Delivery Place": item.place || "",
            Weight: item.weight || "",
            "Mother's Age": item.motherAge || "",
            "Gestational Age": item.gestationalAge || "",
          },
        ];
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stillbirth Linelist");

      // Generate buffer as base64
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Create file path
      const fileName = `stillbirth_linelist_${getTodayDate()}.xlsx`;
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

      // Close preview after download
      setPreviewVisible(false);
    } catch (error) {
      console.error("Error downloading report:", error);
      Alert.alert("Error", "Failed to download report. Please try again.");
    }
  };

  // Show loading only when we're actually loading data and don't have props
  if (dataLoading && !propData) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={tw`mt-2 text-gray-600`}>Loading today's data...</Text>
      </View>
    );
  }

  // Only show "No data" if we have no data
  if (!tileData && !propData) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-gray-500 text-lg`}>
          No data available for today
        </Text>
      </View>
    );
  }

  // Use propData directly if tileData is not set yet but we have props
  const displayData =
    tileData ||
    (propData
      ? {
          total: propData.total || 0,
          sex: {
            female: propData.sex?.female || 0,
            male: propData.sex?.male || 0,
          },
          type: {
            fresh:
              propData.type?.["fresh stillbirth"] ??
              propData.type?.["fresh"] ??
              0,
            macerated:
              propData.type?.["macerated stillbirth"] ??
              propData.type?.["macerated"] ??
              0,
          },
          place: {
            home: propData.place?.home || 0,
            facility: propData.place?.facility || 0,
          },
          rawData: [],
        }
      : null);

  if (!displayData) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-gray-500 text-lg`}>
          No data available for today
        </Text>
      </View>
    );
  }

  // Shared card style
  const cardStyle = tw`flex-1 aspect-square bg-white m-1 p-4 rounded-lg shadow-md justify-center`;

  return (
    <View style={tw`p-4`}>
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
            Showing data for {getTodayDate()} - Location:{" "}
            {locationName || "Unknown"}
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
                        <Text style={tw`flex-1`}>{item.facility}</Text>
                        <Text style={tw`flex-1`}>{item.date}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={tw`text-center text-gray-500 py-8`}>
                    No data available for the selected criteria
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
                  onPress={downloadLinelistReport}
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

      {/* Row 1 */}
      <View style={tw`flex-row`}>
        {/* Total Cases */}
        <TouchableOpacity style={cardStyle} onPress={handleTotalPress}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Total Cases
          </Text>
          <Text style={tw`text-2xl text-gray-700 text-center`}>
            {displayData.total || 0}
          </Text>
          <Text style={tw`text-xs text-purple-500 text-center mt-2`}>
            Tap to preview and download linelist
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
            ♀ Female: {displayData.sex.female || 0}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            ♂ Male: {displayData.sex.male || 0}
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
            Fresh: {displayData.type.fresh}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            Macerated: {displayData.type.macerated}
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
            🏠 Home: {displayData.place.home}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            🏥 Facility: {displayData.place.facility}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ReportDashboard;
