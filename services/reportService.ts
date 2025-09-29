import {
  DateRange,
  MonthlyReportItem,
  PreviewData,
  RawDataItem,
  ReportData,
} from "@/types/reports";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConfig";

export class ReportService {
  static async getAccessToken(): Promise<string> {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");
    return token;
  }

  static async getLocationId(): Promise<string> {
    const locationId = await AsyncStorage.getItem("location_id");
    if (!locationId) throw new Error("Location ID not found");
    return locationId;
  }

  static async fetchReportData(
    locationId: string
  ): Promise<{ today: ReportData; monthly: MonthlyReportItem[] }> {
    const accessToken = await this.getAccessToken();

    // const startDate = "2025-09-01";
    // const today = "2025-09-29";
    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];

    const response = await fetch(
      //`${BASE_URL}/notifications/stillbirths/${locationId}`,
      `${BASE_URL}/notifications/stillbirths/${locationId}/?startDate=${startDate}&endDate=${today}`,
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

    return await response.json();
  }

  static async fetchDetailedData(
    dateRange: DateRange,
    locationId: string
  ): Promise<RawDataItem[]> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${BASE_URL}/notifications/stillbirths/records/${locationId}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
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
    return result.data || result || [];
  }

  static getMonthDates(monthString: string): DateRange {
    const [monthName, yearStr] = monthString.split(" ");
    const year = parseInt(yearStr);

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
  }

  static getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  static processRawData(rawData: RawDataItem[]): ReportData {
    const flattenedData = rawData?.flatMap((item) => {
      if (item.babies && item.babies.length > 0) {
        return item.babies.map((baby) => ({
          ...item,
          ...baby,
          sex: baby.sex,
          type: baby.outcome,
        }));
      }
      return item;
    });

    const total = flattenedData.length;

    const sex = {
      female: flattenedData.filter(
        (item) => item?.female && Number(item.female) > 0
      ).length,
      male: flattenedData.filter((item) => item?.male && Number(item.male) > 0)
        .length,
    };

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

    const place = {
      home: flattenedData.filter((item) => item.place === "home").length,
      facility: flattenedData.filter(
        (item) =>
          item.place?.toLowerCase().includes("facility") ||
          item.facility ||
          item.place === "facility"
      ).length,
    };

    return { total, sex, type, place };
  }

  static preparePreviewData(rawData: RawDataItem[]): PreviewData[] {
    return rawData.flatMap((item) => {
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
        return item.babies.map((baby) => ({
          sex: baby.sex || "Unknown",
          type: baby.outcome || "Unknown",
          facility: facilityName,
          date: item.dateOfNotification || item.date || "",
          time: item.time || "",
          weight: baby.weight || baby.birthWeight?.toString() || "",
          motherAge: item.mother?.age?.toString() || item.motherAge || "",
          gestationalAge:
            baby.gestationalAge || baby.gestationWeeks?.toString() || "",
          deliveryPlace:
            baby.place || item.mother?.placeOfDelivery || item.place || "",
        }));
      }

      return [
        {
          sex: item.female ? "Female" : item.male ? "Male" : "Unknown",
          type: item.outcome || item.type || "Unknown",
          facility: facilityName,
          date: item.dateOfNotification || item.date || "",
          time: item.time || "",
          weight: item.weight || "",
          motherAge: item.motherAge || "",
          gestationalAge: item.gestationalAge || "",
          deliveryPlace: item.deliveryPlace || item.place || "",
        },
      ];
    });
  }
}
