export interface ReportData {
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
    home: number;
    facility: number;
  };
}

export interface MonthlyReportItem {
  month: string;
  total: number;
  avgWeight: number;
  sex: {
    male: number;
    female: number;
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

export interface PreviewData {
  sex: string;
  type: string;
  facility: string;
  date?: string;
  time?: string;
  weight?: string;
  motherAge?: string;
  gestationalAge?: string;
  deliveryPlace?: string;
}

export interface RawDataItem {
  id?: number;
  dateOfNotification?: string;
  date?: string;
  time?: string;
  location?: {
    name?: string;
    facilityName?: string;
  };
  facility?: string;
  facilityName?: string;
  healthFacility?: string;
  mother?: {
    age?: number;
    placeOfDelivery?: string;
  };
  babies?: Array<{
    sex?: string;
    outcome?: string;
    birthWeight?: number;
    gestationWeeks?: number;
    ageAtDeathDays?: number;
    apgarScore1min?: string;
    apgarScore5min?: string;
    apgarScore10min?: string;
    weight?: string;
    gestationalAge?: string;
    place?: string;
  }>;
  female?: string | number;
  male?: string | number;
  type?: string;
  outcome?: string;
  place?: string;
  weight?: string;
  motherAge?: string;
  gestationalAge?: string;
  deliveryPlace?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export enum ReportType {
  TODAY = 'today',
  MONTHLY = 'monthly',
  DATE_RANGE = 'dateRange'
}