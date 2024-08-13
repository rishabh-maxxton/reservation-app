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