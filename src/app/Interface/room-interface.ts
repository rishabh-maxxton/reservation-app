export interface Room {
    roomId: number;
    locationId: number;
    locationName: string;
    roomName: string;
    pricePerDayPerPerson: number;
    numberOfPersons: number;
    stayDateFrom?: string;
    stayDateTo?: string;
    arrivalDays?: string[];
    departureDays?: string[];
    minStay?: number;
    maxStay?: number;
  }


export interface StayDetails {
  roomId: number;
  stayDateFrom: string; // ISO 8601 date string
  stayDateTo: string;   // ISO 8601 date string
  arrivalDays: string[]; // Array of day abbreviations (e.g., "MON", "FRI")
  departureDays: string[]; // Array of day abbreviations (e.g., "WED", "SUN")
  minStay: number; // Minimum number of days for the stay
  maxStay: number; // Maximum number of days for the stay
}

export interface RoomConstraint {
  arrivalDays: string[]; // Array of day abbreviations (e.g., "MON", "FRI")
  departureDays: string[]; // Array of day abbreviations (e.g., "WED", "SUN")
  minStay: number; // Minimum number of days for the stay
  maxStay: number; // Maximum number of days for the stay
}