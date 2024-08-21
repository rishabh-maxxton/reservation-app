// import { Component, OnInit } from '@angular/core';
// import moment from 'moment';
// import { RoomServiceService } from '../../Service/room-service.service';
// import { Room } from '../../Interface/room-interface';
// import { map } from 'rxjs/operators';

// @Component({
//   selector: 'app-planning-chart',
//   templateUrl: './planning-chart.component.html',
//   styleUrls: ['./planning-chart.component.scss']
// })

// export class PlanningChartComponent implements OnInit {
//   rooms: any[] = [];
//   daysInRange: any[] = [];
//   selectedRoomFilter: string = '';
//   startDate: Date = new Date(); 
//   endDate: Date = new Date();
//   filteredRooms: any[] = [];
//   locations: string[] = [];
//   days: number[] = [];
//   bookings: any[] = [];
//   month: number = 8;
//   locationId: any = 101;

//   generateDaysForMonth(month: number): void {
//     debugger;
//     const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
//     this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//   }

//   getBookingsFromLocalStorage(): any[] {
//     const bookings = [];
    
//     for (let i = 0; i < localStorage.length; i++) {
//       const key = localStorage.key(i);
      
//       if (key && key.startsWith('booking_')) {
//         const bookingData = localStorage.getItem(key);
        
//         if (bookingData) {
//           bookings.push(JSON.parse(bookingData));
//         }
//       }
//     }
//     return bookings;
//   }

  

//   constructor(private roomService: RoomServiceService){}

//   ngOnInit() : void {
//     this.roomService.getRooms().subscribe((data: Room[]) => {
//       this.locations = [...new Set(data.map(room => room.locationName))];
//     });
//     // this.locationId = this.roomFilter1();
//     this.roomService.loadRooms(this.locationId).subscribe((data) => {
//       console.log(data);
//       this.rooms = data;
//       console.log(this.rooms);
//       console.log(this.locationId)

//     });
//     this.generateDaysForMonth(this.month);
//     // this.generateDaysInRange();
//     this.loadBookings();
//     this.locationId.valueChanges.subscribe(() => this.roomFilter1())
//     this.getBookingsFromLocalStorage();
//     const roomId = 1; 
//     this.generateDaysForMonth(this.month);
//     const bookingsForRoom = this.getRoomBookingsForMonth(roomId, this.month);

//     console.log(bookingsForRoom);
//   }

//   // Function to get booking dates for a specific room and month
//   getBookingsForRoom(roomId: number): Array<{ startDate: number, endDate: number }> {
//     return this.getRoomBookingsForMonth(roomId, this.month);
//   }

//   // Check if a particular day is within the booking dates
//   isDayBooked(roomId: number, day: number): boolean {
//     const bookings = this.getBookingsForRoom(roomId);
//     return bookings.some(booking => day >= booking.startDate && day <= booking.endDate);
//   }

//   // loadRooms(locationId: number): Observable<any[]> {
//   //   return this.http.get<any[]>(this.roomsApiUrl).pipe(
//   //     map((rooms: any[]) => rooms.filter(room => room.locationId === locationId))
//   //   );
//   // }

//   getRoomBookingsForMonth(roomId: number, month: number): Array<{ startDate: number, endDate: number }> {
//     // Step 1: Retrieve all bookings from local storage
//     const bookings = this.getBookingsFromLocalStorage();
  
//     // Step 2: Filter bookings for the specific room and month
//     const roomBookings = bookings.filter(booking => {
//       const bookingStartDate = new Date(booking.bookingInfo.stayDateFrom);
//       const bookingEndDate = new Date(booking.bookingInfo.stayDateTo);
  
//       // Filter by roomId and the booking's month
//       return booking.bookingInfo.roomNo === roomId &&
//              bookingStartDate.getMonth() === month - 1 && // month is 1-indexed
//              bookingEndDate.getMonth() === month - 1;     // month is 1-indexed
//     });
  
//     // Step 3: Create pairs of start and end date numbers
//     const bookingPairs = roomBookings.map(booking => {
//       const bookingStartDate = new Date(booking.bookingInfo.stayDateFrom);
//       const bookingEndDate = new Date(booking.bookingInfo.stayDateTo);
//       return {
//         startDate: bookingStartDate.getDate(),
//         endDate: bookingEndDate.getDate()
//       };
//     });
  
//     // Step 4: Sort the pairs by start date
//     bookingPairs.sort((a, b) => a.startDate - b.startDate);
  
//     return bookingPairs;
//   }
  

//   loadBookings() {
//     // Loop through each room and load the bookings from localStorage
//     console.log(this.rooms);
//     this.rooms.forEach(room => {
//       const bookings = [];
//       for (let i = 0; i < localStorage.length; i++) {
//         const key = localStorage.key(i);
//         console.log(key);
//         if (key && key.startsWith('booking_')) {
//           const bookingData = JSON.parse(localStorage.getItem(key)!);
//           if (bookingData.bookingInfo.roomNo === room.roomId) {
//             bookings.push(bookingData.bookingInfo);
//           }
//         }
//       }
//       room.bookings = bookings;
//     });
//     console.log(this.rooms)
//     this.applyFilter();
//   }

//   generateDaysInRange() {
//     const start = moment(this.startDate);
//     const end = moment(this.endDate);
//     const days = [];

//     while (start.isSameOrBefore(end)) {
//       days.push(start.clone().toDate());
//       start.add(1, 'days');
//     }

//     this.daysInRange = days;
//   }

//   isDateWithinBooking(date: Date, booking: any): boolean {
//     const bookingStart = moment(booking.stayDateFrom);
//     const bookingEnd = moment(booking.stayDateTo);
//     return moment(date).isBetween(bookingStart, bookingEnd, null, '[]');
//   }

//   // getBookingStatusClass(booking: any): string {
//   //   // Implement logic to return a class based on booking status
//   //   // For example: return 'new' for new bookings, 'confirmed' for confirmed, etc.
//   // }

//   applyFilter() {
//     if (this.selectedRoomFilter === 'all') {
//       this.filteredRooms = this.rooms;
//       console.log(this.filteredRooms);
//     } else {
//       this.filteredRooms = this.rooms.filter(room => room.roomId === this.selectedRoomFilter);
//       console.log(this.filteredRooms);
//     }
//   }


//   roomFilter1(): void{
//     console.log(this.selectedRoomFilter);
//     if(this.selectedRoomFilter === "Sunset Beach Resort"){
//       this.locationId = 101;
//       console.log(this.locationId);
//     }
//     else this.locationId = 102;
//     console.log(this.locationId);
//   }

//   onDateRangeChanged(newStartDate: Date, newEndDate: Date) {
//     this.startDate = newStartDate;
//     this.endDate = newEndDate;
//     this.generateDaysInRange();
//   }
// }

// import { Component, OnInit } from '@angular/core';
// import moment from 'moment';
// import { RoomServiceService } from '../../Service/room-service.service';
// import { Room } from '../../Interface/room-interface';

// @Component({
//   selector: 'app-planning-chart',
//   templateUrl: './planning-chart.component.html',
//   styleUrls: ['./planning-chart.component.scss']
// })

// export class PlanningChartComponent implements OnInit {
//   rooms: any[] = [];
//   filteredRooms: any[] = [];
//   days: number[] = [];
//   locations: string[] = [];
//   selectedRoomFilter: string = 'all';
//   selectedMonth: number = new Date().getMonth() + 1; // Default to current month
//   bookings: any[] = [];

//   constructor(private roomService: RoomServiceService) {}

//   ngOnInit(): void {
//     this.roomService.loadRooms().subscribe((data: Room[]) => {
//       this.locations = [...new Set(data.map(room => room.locationName))];
//       this.rooms = data;
//       this.applyFilters();
//     });
    
//     this.loadBookings();
//     this.generateDaysForMonth(this.selectedMonth);
//   }

//   // Function to generate days in the selected month
//   generateDaysForMonth(month: number): void {
//     const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
//     this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//   }

//   // Function to load bookings from local storage
//   loadBookings() {
//     this.bookings = this.getBookingsFromLocalStorage();
//     this.applyFilters();
//   }

//   // Get bookings from local storage
//   getBookingsFromLocalStorage(): any[] {
//     const bookings = [];
//     for (let i = 0; i < localStorage.length; i++) {
//       const key = localStorage.key(i);
//       if (key && key.startsWith('booking_')) {
//         const bookingData = localStorage.getItem(key);
//         if (bookingData) {
//           bookings.push(JSON.parse(bookingData));
//         }
//       }
//     }
//     return bookings;
//   }

//   // Apply filters for location and month
//   applyFilters(): void {
//     let filteredRooms = this.rooms;

//     if (this.selectedRoomFilter !== 'all') {
//       filteredRooms = filteredRooms.filter(room => room.locationName === this.selectedRoomFilter);
//     }

//     this.filteredRooms = filteredRooms.map(room => ({
//       ...room,
//       bookings: this.getRoomBookingsForMonth(room.roomId, this.selectedMonth)
//     }));
//   }

//   // Filter bookings by room and month
//   getRoomBookingsForMonth(roomId: number, month: number): Array<{ startDate: number, endDate: number }> {
//     const roomBookings = this.bookings.filter(booking => {
//       const bookingStartDate = new Date(booking.bookingInfo.stayDateFrom);
//       const bookingEndDate = new Date(booking.bookingInfo.stayDateTo);
//       return booking.bookingInfo.roomNo === roomId &&
//              bookingStartDate.getMonth() === month - 1 &&
//              bookingEndDate.getMonth() === month - 1;
//     });

//     return roomBookings.map(booking => ({
//       startDate: new Date(booking.bookingInfo.stayDateFrom).getDate(),
//       endDate: new Date(booking.bookingInfo.stayDateTo).getDate()
//     })).sort((a, b) => a.startDate - b.startDate);
//   }

//   // Check if a particular day is within the booking dates
//   isDayBooked(roomId: number, day: number): boolean {
//     const bookings = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
//     return bookings.some(booking => day >= booking.startDate && day <= booking.endDate);
//   }

//   // Update filters on change
//   onLocationFilterChange(): void {
//     this.applyFilters();
//   }

//   onMonthFilterChange(): void {
//     this.generateDaysForMonth(this.selectedMonth);
//     this.applyFilters();
//   }
// }



import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room } from '../../Interface/room-interface';

@Component({
  selector: 'app-planning-chart',
  templateUrl: './planning-chart.component.html',
  styleUrls: ['./planning-chart.component.scss']
})

export class PlanningChartComponent implements OnInit {
  rooms: any[] = [];
  filteredRooms: any[] = [];
  days: number[] = [];
  locations: string[] = [];
  selectedRoomFilter: string = 'all';
  selectedMonth: number = new Date().getMonth() + 1; // Default to current month
  bookings: any[] = [];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private roomService: RoomServiceService) {}

  ngOnInit(): void {
    this.roomService.loadRooms().subscribe((data: Room[]) => {
      this.locations = [...new Set(data.map(room => room.locationName))];
      this.rooms = data;
      this.applyFilters();
    });
    
    this.loadBookings();
    this.generateDaysForMonth(this.selectedMonth);
  }

  // Function to generate days in the selected month
  generateDaysForMonth(month: number): void {
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  // Function to load bookings from local storage
  loadBookings() {
    this.bookings = this.getBookingsFromLocalStorage();
    this.applyFilters();
  }

  // Get bookings from local storage
  getBookingsFromLocalStorage(): any[] {
    const bookings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('booking_')) {
        const bookingData = localStorage.getItem(key);
        if (bookingData) {
          bookings.push(JSON.parse(bookingData));
        }
      }
    }
    return bookings;
  }

  // Apply filters for location and month, and sort rooms by roomId
  applyFilters(): void {
    let filteredRooms = this.rooms;

    if (this.selectedRoomFilter !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.locationName === this.selectedRoomFilter);
    }

    this.filteredRooms = filteredRooms.map(room => ({
      ...room,
      bookings: this.getRoomBookingsForMonth(room.roomId, this.selectedMonth)
    })).sort((a, b) => a.roomId - b.roomId);  // Sorting rooms by roomId
  }

  // Filter bookings by room and month
  getRoomBookingsForMonth(roomId: number, month: number): Array<{ startDate: number, endDate: number }> {
    const roomBookings = this.bookings.filter(booking => {
      const bookingStartDate = new Date(booking.bookingInfo.stayDateFrom);
      const bookingEndDate = new Date(booking.bookingInfo.stayDateTo);
      return booking.bookingInfo.roomNo === roomId &&
             bookingStartDate.getMonth() === month - 1 &&
             bookingEndDate.getMonth() === month - 1;
    });

    return roomBookings.map(booking => ({
      startDate: new Date(booking.bookingInfo.stayDateFrom).getDate(),
      endDate: new Date(booking.bookingInfo.stayDateTo).getDate()
    })).sort((a, b) => a.startDate - b.startDate);
  }

  // Check if a particular day is within the booking dates
  isDayBooked(roomId: number, day: number): boolean {
    const bookings = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
    return bookings.some(booking => day >= booking.startDate && day <= booking.endDate);
  }

  // Update filters on change
  onLocationFilterChange(): void {
    this.applyFilters();
  }

  onMonthFilterChange(): void {
    this.generateDaysForMonth(this.selectedMonth);
    this.applyFilters();
  }
}
