export interface Room {
    filter(arg0: (room: any) => boolean): Room;
    roomId: number;
    locationId: number;
    locationName: string;
    roomName: string;
    pricePerDayPerPerson: number;
    guestCapacity: number;
    stayDateFrom?: string;
    stayDateTo?: string;
    bookDateFrom?: string;
    bookDateTo?: string;
    arrivalDays?: string[];
    departureDays?: string[];
    minDeviation?: number;
    maxDeviation?: number;
    minStay?: number;
    maxStay?: number;
  }


export interface StayDetails {
  roomId: number;
  stayDateFrom: string; 
  stayDateTo: string;   
  arrivalDays: string[]; 
  departureDays: string[]; 
  minStay: number; 
  maxStay: number;
  bookDateFrom: string;
  bookDateTo: string;
  minDeviation: number;
  maxDeviation: number;
}

export interface RoomConstraint {
  arrivalDays: string[]; 
  departureDays: string[]; 
  minStay: number; 
  maxStay: number; 
  minDeviation: number;
  maxDeviation: number;
}