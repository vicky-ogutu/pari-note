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
  /** Get access token from storage */
  static async getAccessToken(): Promise<string> {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");
    return token;
  }

  /** Get location id from storage */
  static async getLocationId(): Promise<string> {
    const locationId = await AsyncStorage.getItem("location_id");
    if (!locationId) throw new Error("Location ID not found");
    return locationId;
  }

  /** Fetch summarized report (today + monthly) */
  static async fetchReportData(
    locationId: string
  ): Promise<{ today: ReportData; monthly: MonthlyReportItem[] }> {
    const accessToken = await this.getAccessToken();

    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];

    const response = await fetch(
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

    const result = await response.json();

    // Normalize today's type mapping (e.g. "fresh stillbirth" -> "fresh")
    if (result.today?.type) {
      const normalizedType: Record<string, number> = { fresh: 0, macerated: 0 };
      for (const key of Object.keys(result.today.type)) {
        if (key.toLowerCase().includes("fresh")) {
          normalizedType.fresh += result.today.type[key];
        } else if (key.toLowerCase().includes("macerated")) {
          normalizedType.macerated += result.today.type[key];
        }
      }
      result.today.type = normalizedType;
    }

    return result;
  }

  /** Fetch detailed/raw records within a date range */
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

  /** Get start & end dates for a given month string */
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

    const monthIndex = monthMap[monthName.toLowerCase()];
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

  /** Get today's date */
  static getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  /** Process raw data (used in date range reports) */
  static processRawData(rawData: RawDataItem[]): ReportData {
    const flattenedData = rawData?.flatMap((item: any) => {
      if (item.babies && item.babies.length > 0) {
        return item.babies.map((baby: any) => ({
          ...item,
          sex: baby.sex,
          type: baby.outcome || baby.type,
          place: baby.place || item.place || item.deliveryPlace,
        }));
      }
      return {
        ...item,
        sex:
          item.sex || (item.female ? "female" : item.male ? "male" : undefined),
        type: item.outcome || item.type,
        place: item.place || item.deliveryPlace,
      };
    });

    const total = flattenedData.length;

    const sex = {
      female: flattenedData.filter(
        (d: any) => d?.sex?.toLowerCase() === "female"
      ).length,
      male: flattenedData.filter((d: any) => d?.sex?.toLowerCase() === "male")
        .length,
    };

    const type = {
      fresh: flattenedData.filter(
        (d: any) =>
          d.type?.toLowerCase().includes("fresh") ||
          d.outcome?.toLowerCase().includes("fresh")
      ).length,
      macerated: flattenedData.filter(
        (d: any) =>
          d.type?.toLowerCase().includes("macerated") ||
          d.outcome?.toLowerCase().includes("macerated")
      ).length,
    };

    const place = {
      home: flattenedData.filter(
        (d: any) =>
          d.place?.toLowerCase() === "home" ||
          d.deliveryPlace?.toLowerCase() === "home"
      ).length,
      facility: flattenedData.filter(
        (d: any) =>
          d.place?.toLowerCase() === "facility" ||
          d.place?.toLowerCase().includes("facility") ||
          d.deliveryPlace?.toLowerCase().includes("facility")
      ).length,
    };

    return { total, sex, type, place };
  }

  /** Prepare preview data (used in UI tables/lists) */
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
          sex:
            (item as any).sex ||
            (item.female ? "Female" : item.male ? "Male" : "Unknown"),
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
