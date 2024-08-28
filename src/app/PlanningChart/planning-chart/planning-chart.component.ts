import { Component, OnInit, Renderer2, ViewChild  } from '@angular/core';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room } from '../../Interface/room-interface';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-planning-chart',
  templateUrl: './planning-chart.component.html',
  styleUrls: ['./planning-chart.component.scss'],
  
})
export class PlanningChartComponent implements OnInit {
  rooms: any[] = [];
  stays: any[] = [];
  filteredRooms: any[] = [];
  days: number[] = [];
  locations: string[] = [];
  selectedRoomFilter: string = 'all';
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  bookings: any[] = [];
  selectedRoomId: number | null = null;
  selectedDates: number[] = [];
  weekdays: string[] = [];
  isSelecting: boolean = false;
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  availability: any[] = [];
  roomConstraints: { [roomId: number]: { minStay: number, maxStay: number, arrivalDays: string[], departureDays: string[] } } = {};
  roomConstraints1: {
    [roomId: number]: Array<{
      arrivalDays: string[],
      departureDays: string[],
      minStay: number,
      maxStay: number
    }>
  } = {};

  constructor(
    private roomService: RoomServiceService,
    private router: Router,
    private datePipe: DatePipe,
  ) {}

  getTooltipContent(roomId: number, day: number): string {
    if (this.isDayBooked(roomId, day)) {
      console.log(this.selectedMonth);
      let data = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
      return `Booked by: ${data[0].customerEmail} \n From: ${data[0].startDate}-${this.months[this.selectedMonth-1]}-${this.selectedYear} \n To: ${data[0].endDate}-${this.months[this.selectedMonth-1]}-${this.selectedYear}`;
    }
    return '';
  }

  ngOnInit(): void {
    this.roomService.loadRooms().subscribe((data: Room[]) => {
      this.locations = [...new Set(data.map(room => room.locationName))];
      this.rooms = data;
      this.applyFilters();
    });

    this.roomService.loadAvailability().subscribe((data: any[]) => {
      this.availability = data;
      this.applyFilters();
      this.extractRoomConstraints1(); // Use the updated method
    });

    this.loadBookings();
    this.generateDaysForMonth(this.selectedMonth);
    this.generateDaysInMonth(this.selectedYear, this.selectedMonth);
  }

  getRoomConstraints(roomId: number): Array<{ [key: string]: { minStay: number, maxStay: number } }> {
    const constraints = this.roomConstraints1[roomId];
  
    if (!constraints) {
      return [];
    }
  
    const constraintMap: { [key: string]: { minStay: number, maxStay: number } } = {};
  
    constraints.forEach(constraint => {
      constraint.arrivalDays.forEach(day => {
        if (!constraintMap[day]) {
          constraintMap[day] = {
            minStay: constraint.minStay,
            maxStay: constraint.maxStay
          };
        } else {
          constraintMap[day].minStay = Math.min(constraintMap[day].minStay, constraint.minStay);
          constraintMap[day].maxStay = Math.max(constraintMap[day].maxStay, constraint.maxStay);
        }
      });
    });
    // console.log(constraintMap);
  
    return [constraintMap]; // Ensure this returns an array with a single object
  }
  

  generateDaysInMonth(year: number, month: number) {
    const date = new Date(year, month - 1, 1);
    const days = [];
    const weekdays = [];
    while (date.getMonth() === month - 1) {
        days.push(date.getDate());
        weekdays.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        date.setDate(date.getDate() + 1);
    }
    this.days = days;
    this.weekdays = weekdays;
  }

  generateDaysForMonth(month: number): void {
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  formatDate(date: number): string {
    const fullDate = new Date(new Date().getFullYear(), this.selectedMonth - 1, date);
    return this.datePipe.transform(fullDate, 'yyyy-MM-dd')!;
  }

  loadBookings() {
    this.bookings = this.getBookingsFromLocalStorage();
    this.applyFilters();
  }

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

  applyFilters(): void {
    let filteredRooms = this.rooms;

    if (this.selectedRoomFilter !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.locationName === this.selectedRoomFilter);
    }

    this.filteredRooms = filteredRooms.map(room => ({
      ...room,
      bookings: this.getRoomBookingsForMonth(room.roomId, this.selectedMonth)
    })).sort((a, b) => a.roomId - b.roomId);
  }

  getRoomBookingsForMonth(roomId: number, month: number): Array<{ startDate: number, endDate: number, customerEmail: string }> {
    const roomBookings = this.bookings.filter(booking => {
      const bookingStartDate = new Date(booking.bookingInfo.stayDateFrom);
      const bookingEndDate = new Date(booking.bookingInfo.stayDateTo);
      return booking.bookingInfo.roomNo === roomId &&
             bookingStartDate.getMonth() === month - 1 &&
             bookingEndDate.getMonth() === month - 1;
    });

    // console.log(roomBookings);

    return roomBookings.map(booking => ({
      startDate: new Date(booking.bookingInfo.stayDateFrom).getDate(),
      endDate: new Date(booking.bookingInfo.stayDateTo).getDate(),
      customerEmail: booking.customerInfo.email,
    })).sort((a, b) => a.startDate - b.startDate);
    
  }

  isDayBooked(roomId: number, day: number): boolean {
    const bookings = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
    // console.log(bookings);
    return bookings.some(booking => day >= booking.startDate && day <= booking.endDate);

  }

  isDayAvailable(roomId: number, day: number): boolean {
    const constraints = this.roomConstraints1[roomId] || [];
    const availabilityData = this.availability.filter(item => item.roomId === roomId);
    const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
    const isValidDate = availabilityData.some(item => {
      const fromDate = new Date(item.stayDateFrom);
      const toDate = new Date(item.stayDateTo);
      return date >= fromDate && date <= toDate;
    });
    return isValidDate && !this.isDayBooked(roomId, day);
  }

  isMinStayBooked(roomId: number, day: number): boolean {
    const constraints1 = this.getRoomConstraints(roomId);
    const minStay1 = constraints1[0][this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())]?.minStay;
    // console.log(minStay1);
    // if(minStay1){
    //   console.log(day+minStay1);
    // }
    return true;
  }

  isArrivalDay(roomId: number, day: number): boolean {
    const constraints = this.roomConstraints1[roomId] || [];
    const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
    const dayOfWeekString = this.getDayOfWeekString(date.getDay());
    
    

    return constraints.some(constraint => 
      constraint.arrivalDays.includes(dayOfWeekString) &&
      this.isDayAvailable(roomId, day) && this.isMinStayBooked(roomId, day)
    );
  }

  isDepartureDay(roomId: number, day: number): boolean {
    const constraints = this.roomConstraints1[roomId] || [];
    const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
    const dayOfWeekString = this.getDayOfWeekString(date.getDay());
    return constraints.some(constraint => 
      constraint.departureDays.includes(dayOfWeekString)
    );
  }

  getDayOfWeekString(dayIndex: number): string {
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return weekdays[dayIndex];
  }

  onLocationFilterChange(): void {
    this.applyFilters();
  }

  onMonthFilterChange(): void {
    this.generateDaysForMonth(this.selectedMonth);
    this.applyFilters();
  }

  extractRoomConstraints(): void {
    this.roomConstraints = this.availability.reduce((acc, curr) => {
      const roomId = curr.roomId;
      if (!acc[roomId]) {
        acc[roomId] = {
          minStay: curr.minStay,
          maxStay: curr.maxStay,
          arrivalDays: curr.arrivalDays,
          departureDays: curr.departureDays
        };
      }
      return acc;
    }, {} as { [roomId: number]: { minStay: number, maxStay: number, arrivalDays: string[], departureDays: string[] } });
    console.log(this.roomConstraints);
  }

  extractRoomConstraints1(): void {
    this.roomConstraints1 = this.availability.reduce((acc, curr) => {
      const roomId = curr.roomId;
      if (!acc[roomId]) {
        acc[roomId] = [];
      }
      acc[roomId].push({
        arrivalDays: curr.arrivalDays,
        departureDays: curr.departureDays,
        minStay: curr.minStay,
        maxStay: curr.maxStay
      });
      return acc;
    }, {} as { [roomId: number]: Array<{ arrivalDays: string[], departureDays: string[], minStay: number, maxStay: number }> });

    console.log(this.roomConstraints1);
  }

  startSelection(roomId: number, day: number) {
    if (!this.isArrivalDay(roomId, day) || this.isDayBooked(roomId, day)) return;

    this.isSelecting = true;
    this.selectedRoomId = roomId;
    this.selectedDates = [day];
    this.applySelectionConstraints(roomId, day);
    this.extractRoomConstraints1();
  }

  continueSelection(roomId: number, day: number) {
    if (!this.isDayAvailable(roomId, day) || this.isDayBooked(roomId, day)) return;
  
    if (this.isSelecting && roomId === this.selectedRoomId) {
      let lastDate = this.selectedDates[this.selectedDates.length - 1];
      console.log(this.selectedDates);
      let newDateRange = [...this.selectedDates];
      const constraints = this.getRoomConstraints(roomId);
  
      console.log('Constraints:', constraints); 
      console.log('Day of Week:', this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDates[0]).getDay()));
  
      if (constraints.length > 0) {
        const constraintForDay = constraints[0][this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())];
        console.log('Constraint For Day:', constraintForDay);
        const start = constraints[0][this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDates[0]).getDay())];
        console.log(start);

          if (day > lastDate) {
            // Extends selection to the right
            while (newDateRange.length < start.maxStay && day > lastDate) {
              lastDate++;
              if (day >= lastDate) {
                if (this.isDayAvailable(roomId, lastDate) && !this.isDayBooked(roomId, lastDate)) {
                  newDateRange.push(lastDate);
                }else{
                  break;
                }
              }else{
                break;
              }
            }
            this.selectedDates = newDateRange;
          } else if (day < lastDate) {
            // Extend selection to the left
            while (newDateRange.length > start.minStay && day < lastDate) {
              lastDate--;
              if (day <= lastDate) {
                  newDateRange = newDateRange.filter(d => d !== lastDate + 1);
              } else {
                break;
              }
            }
            this.selectedDates = newDateRange;
          }
      } else {
        console.warn('No constraints available for room:', roomId); // Edge case
      }
    }
  }
  

  endSelection(roomId: number, day: number) {
    if (!this.isDayAvailable(roomId, day) || this.isDayBooked(roomId, day)) return;
    this.isSelecting = false;
    // this.applySelectionConstraints(roomId, day);
  }

  applySelectionConstraints(roomId: number, day: number) {
    const constraints = this.getRoomConstraints(roomId);

    if (this.selectedDates.length < constraints[0][this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())]?.minStay) {
      // Ensure at least minStay number of days are selected
      while (this.selectedDates.length < constraints[0][this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())]?.minStay) {
        let lastDate = this.selectedDates[this.selectedDates.length - 1];
        
        if (lastDate < this.days.length && !this.isDayBooked(roomId, lastDate + 1) && this.isDayAvailable(roomId, lastDate + 1)) {
            this.selectedDates.push(lastDate + 1);
        } else {
          break;
        }
      }
    } else if (this.selectedDates.length > constraints[0][this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())]?.maxStay) {
      // Ensure no more than maxStay number of days are selected
      this.selectedDates = this.selectedDates.slice(0, constraints[0][this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())]?.maxStay);
    }
    console.log(this.roomConstraints1)
  }

  isPartOfBookedRange(roomId: string, day: number): boolean {
    return this.bookings.some(booking =>
      booking.roomId === roomId && day >= booking.startDate && day <= booking.endDate
    );
  }

  getBookingRangeColspan(roomId: string, day: number): number {
    const booking = this.bookings.find(booking =>
      booking.roomId === roomId && day === booking.startDate
    );

    if (booking) {
      return booking.endDate - booking.startDate + 1;
    }
    return 1;
  }

  getPrice(roomid: any) {
    console.log(this.rooms);
    const roomObj = this.rooms.filter(data => data.roomId == roomid);
    console.log(roomObj);
    return roomObj[0].pricePerDayPerPerson;
  }

  getWeekday(date: number): string {
    const selectedDate = new Date(this.selectedYear, this.selectedMonth - 1, date);
    const weekdays = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
    return weekdays[selectedDate.getDay()];
  }

  bookRoom(room: any, stayDateFrom: string, stayDateTo: string) {
    console.log(room);
    let price = this.getPrice(room);
    console.log(stayDateFrom, stayDateTo)
    this.router.navigate(['/form'], {
      state: {
        room: {
          roomId: room,
          roomName: room.roomName,
          stayDateFrom: stayDateFrom,
          stayDateTo: stayDateTo,
          pricePerDayPerPerson: price,
          minStay: room.minStay,
          maxStay: room.maxStay,
          guestCapacity: room.numberOfPersons
        }
      }
    });
    console.log(this.rooms);
  }
}

















// import { Component, OnInit, Renderer2 } from '@angular/core';
// import { RoomServiceService } from '../../Service/room-service.service';
// import { Room } from '../../Interface/room-interface';
// import { Router } from '@angular/router';
// import { DatePipe } from '@angular/common';

// @Component({
//   selector: 'app-planning-chart',
//   templateUrl: './planning-chart.component.html',
//   styleUrls: ['./planning-chart.component.scss']
// })

// export class PlanningChartComponent implements OnInit {
//   rooms: any[] = [];
//   stays: any[] = [];
//   filteredRooms: any[] = [];
//   days: number[] = [];
//   locations: string[] = [];
//   selectedRoomFilter: string = 'all';
//   selectedMonth: number = new Date().getMonth() + 1;
//   selectedYear: number = new Date().getFullYear();
//   bookings: any[] = [];
//   selectedRoomId: number | null = null;
//   selectedDates: number[] = [];
//   weekdays: string[] = [];
//   isSelecting: boolean = false;
//   months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//   availability: any[] = [];
//   roomConstraints: { [roomId: number]: { minStay: number, maxStay: number, arrivalDays: string[], departureDays: string[] } } = {};
//   roomConstraints1: {
//     [roomId: number]: Array<{
//       arrivalDays: string[],
//       departureDays: string[],
//       minStay: number,
//       maxStay: number
//     }>
//   } = {};

//   constructor(private roomService: RoomServiceService, private router: Router, private datePipe: DatePipe, private renderer: Renderer2) {}

//   ngOnInit(): void {
//     this.roomService.loadRooms().subscribe((data: Room[]) => {
//       this.locations = [...new Set(data.map(room => room.locationName))];
//       this.rooms = data;
//       this.applyFilters();
//     });

//     this.roomService.loadAvailability().subscribe((data: any[]) => {
//       this.availability = data;
//       this.applyFilters();
//       this.extractRoomConstraints();
//       // this.extractRoomConstraints1();
//     });
    
//     this.loadBookings();
//     this.generateDaysForMonth(this.selectedMonth);
//     this.generateDaysInMonth(this.selectedYear, this.selectedMonth);
    
//   }

//   getRoomConstraints(roomId: number): Array<{ [key: string]: { minStay: number, maxStay: number } }> {
//     const constraints = this.roomConstraints1[roomId];
    
//     if (!constraints) {
//       return [];
//     }
  
//     const constraintMap: { [key: string]: { minStay: number, maxStay: number } } = {};
  
//     constraints.forEach(constraint => {
//       constraint.arrivalDays.forEach(day => {
//         // Initialize or update the minStay and maxStay for the day
//         if (!constraintMap[day]) {
//           constraintMap[day] = {
//             minStay: constraint.minStay,
//             maxStay: constraint.maxStay
//           };
//         } else {
//           // Update minStay to the minimum and maxStay to the maximum
//           constraintMap[day].minStay = Math.min(constraintMap[day].minStay, constraint.minStay);
//           constraintMap[day].maxStay = Math.max(constraintMap[day].maxStay, constraint.maxStay);
//         }
//       });
//     });
  
//     // Convert the map to the required array format
//     return Object.keys(constraintMap).map(day => ({
//       [day]: constraintMap[day]
//     }));
//   }

//   generateDaysInMonth(year: number, month: number) {
//     const date = new Date(year, month - 1, 1);
//     const days = [];
//     const weekdays = [];
//     while (date.getMonth() === month - 1) {
//         days.push(date.getDate());
//         weekdays.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
//         date.setDate(date.getDate() + 1);
//     }
//     this.days = days;
//     this.weekdays = weekdays;
//     // console.log(weekdays)
//   }

//   generateDaysForMonth(month: number): void {
//     const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
//     this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//   }

//   formatDate(date: number): string {
//     const fullDate = new Date(new Date().getFullYear(), this.selectedMonth - 1, date);
//     return this.datePipe.transform(fullDate, 'yyyy-MM-dd')!;
//   }

//   loadBookings() {
//     this.bookings = this.getBookingsFromLocalStorage();
//     this.applyFilters();
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

//   applyFilters(): void {
//     let filteredRooms = this.rooms;

//     if (this.selectedRoomFilter !== 'all') {
//       filteredRooms = filteredRooms.filter(room => room.locationName === this.selectedRoomFilter);
//     }

//     this.filteredRooms = filteredRooms.map(room => ({
//       ...room,
//       bookings: this.getRoomBookingsForMonth(room.roomId, this.selectedMonth)
//     })).sort((a, b) => a.roomId - b.roomId);
//   }

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

//   isDayBooked(roomId: number, day: number): boolean {
//     const bookings = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
//     return bookings.some(booking => day >= booking.startDate && day <= booking.endDate);
//   }

//   isDayAvailable(roomId: number, day: number): boolean {
//     const constraints = this.roomConstraints[roomId] || { arrivalDays: [] };
//     const availabilityData = this.availability.filter(item => item.roomId === roomId);
//     const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
//     const isValidDate = availabilityData.some(item => {
//       const fromDate = new Date(item.stayDateFrom);
//       const toDate = new Date(item.stayDateTo);
//       return date >= fromDate && date <= toDate;
//     });
//     return isValidDate && !this.isDayBooked(roomId, day);
//   }

//   isArrivalDay(roomId: number, day: number): boolean {
//     const constraints = this.roomConstraints[roomId] || { arrivalDays: [] };
//     const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
//     const dayOfWeekString = this.getDayOfWeekString(date.getDay());
//     return constraints.arrivalDays.includes(dayOfWeekString) && this.isDayAvailable(roomId, day);
//   }


//   isDepartureDay(roomId: number, day: number): boolean {
//     const constraints = this.roomConstraints[roomId] || [];
//     const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
//     const dayOfWeekString = this.getDayOfWeekString(date.getDay());
//     return constraints.departureDays.includes(dayOfWeekString);
    
//   }

//   getDayOfWeekString(dayIndex: number): string {
//     const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
//     return weekdays[dayIndex];
//   }

//   onLocationFilterChange(): void {
//     this.applyFilters();
//   }

//   onMonthFilterChange(): void {
//     this.generateDaysForMonth(this.selectedMonth);
//     this.applyFilters();
//   }

//   extractRoomConstraints(): void {
//     this.roomConstraints = this.availability.reduce((acc, curr) => {
//       const roomId = curr.roomId;
//       if (!acc[roomId]) {
//         acc[roomId] = {
//           minStay: curr.minStay,
//           maxStay: curr.maxStay,
//           arrivalDays: curr.arrivalDays,
//           departureDays: curr.departureDays
//         };
//       }
//       return acc;
//     }, {} as { [roomId: number]: { minStay: number, maxStay: number, arrivalDays: string[], departureDays: string[] } });
//     console.log(this.roomConstraints);
//   }

//   extractRoomConstraints1(): void {
//     // Initialize roomConstraints1 with an empty array for each room ID
//     this.roomConstraints1 = this.availability.reduce((acc, curr) => {
//       const roomId = curr.roomId;
//       if (!acc[roomId]) {
//         acc[roomId] = []; // Initialize an empty array for the roomId
//       }
  
//       // Push the new constraint into the array for the roomId
//       acc[roomId].push({
//         arrivalDays: curr.arrivalDays,
//         departureDays: curr.departureDays,
//         minStay: curr.minStay,
//         maxStay: curr.maxStay
//       });
  
//       return acc;
//     }, {} as { [roomId: number]: Array<{ arrivalDays: string[], departureDays: string[], minStay: number, maxStay: number }> });
  
//     console.log(this.roomConstraints1);
//   }
  

  
  

//   startSelection(roomId: number, day: number) {
//     if (!this.isArrivalDay(roomId, day) || this.isDayBooked(roomId, day)) return;

//     this.isSelecting = true;
//     this.selectedRoomId = roomId;
//     this.selectedDates = [day];
//     this.applySelectionConstraints(roomId, day);
//     this.extractRoomConstraints1();
    
//   }

//   continueSelection(roomId: number, day: number) {
//     if (!this.isDayAvailable(roomId, day) || this.isDayBooked(roomId, day)) return;
  
//     if (this.isSelecting && roomId === this.selectedRoomId) {
//       let lastDate = this.selectedDates[this.selectedDates.length - 1];
//       let newDateRange = [...this.selectedDates];
//       const constraints = this.roomConstraints[roomId] || { minStay: 1, maxStay: 30, departureDays: [] };
      
  
//       if (day > lastDate) {
//         // Extend selection to the right
//         while (newDateRange.length < constraints.maxStay && day > lastDate) {
//           lastDate++;
//           if (day >= lastDate) {
//             if (this.isDepartureDay(roomId, lastDate)) {
//               newDateRange.push(lastDate);
//               break; // Stop extending if reaching a departure day
//             } else if (this.isDayAvailable(roomId, lastDate)) {
//               newDateRange.push(lastDate);
//             } else {
//               break;
//             }
//           } else {
//             break;
//           }
//         }
//         this.selectedDates = newDateRange;
//       } else if (day < lastDate) {
//         // Extend selection to the left
//         while (newDateRange.length > constraints.minStay && day < lastDate) {
//           lastDate--;
//           if (day <= lastDate) {
//             if (this.isDepartureDay(roomId, lastDate + 1)) {
//               newDateRange = newDateRange.filter(d => d !== lastDate + 1);
//               break; // Stop if reaching a departure day
//             } else {
//               newDateRange = newDateRange.filter(d => d !== lastDate + 1);
//             }
//           } else {
//             break;
//           }
//         }
//         this.selectedDates = newDateRange;
//       }
//     }
//   }

  
  

//   endSelection(roomId: number, day: number) {
//     if (!this.isDayAvailable(roomId, day) || this.isDayBooked(roomId, day)) return;
//     this.isSelecting = false;
//     this.applySelectionConstraints(roomId, day);
//   }
  

//   applySelectionConstraints(roomId: number, day: number) {
//     const constraints = this.roomConstraints[roomId] || { minStay: 1, maxStay: 30, arrivalDays: [], departureDays: [] };

//     if (this.selectedDates.length < constraints.minStay) {
//       // Ensure at least minStay number of days are selected
//       while (this.selectedDates.length < constraints.minStay) {
//         let lastDate = this.selectedDates[this.selectedDates.length - 1];
//         if (lastDate < this.days.length && !this.isDayBooked(roomId, lastDate + 1) && this.isDayAvailable(roomId, lastDate + 1)) {
//             this.selectedDates.push(lastDate + 1);
//         } else {
//           break;
//         }
//       }
//     } else if (this.selectedDates.length > constraints.maxStay) {
//       // Ensure no more than maxStay number of days are selected
//       this.selectedDates = this.selectedDates.slice(0, constraints.maxStay);
//     }
//     console.log(this.roomConstraints)
//   }


//   isPartOfBookedRange(roomId: string, day: number): boolean {
//     return this.bookings.some(booking =>
//       booking.roomId === roomId && day >= booking.startDate && day <= booking.endDate
//     );
//   }

//   getBookingRangeColspan(roomId: string, day: number): number {
//     const booking = this.bookings.find(booking =>
//       booking.roomId === roomId && day === booking.startDate
//     );

//     if (booking) {
//       return booking.endDate - booking.startDate + 1;
//     }
//     return 1;
//   }

//   getPrice(roomid: any) {
//     console.log(this.rooms);
//     const roomObj = this.rooms.filter(data => data.roomId == roomid);
//     console.log(roomObj);
//     return roomObj[0].pricePerDayPerPerson;
//   }

//   getWeekday(date: number): string {
//     const selectedDate = new Date(this.selectedYear, this.selectedMonth - 1, date);
//     const weekdays = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
//     return weekdays[selectedDate.getDay()];
//   }

//   bookRoom(room: any, stayDateFrom: string, stayDateTo: string) {
//     console.log(room);
//     let price = this.getPrice(room);
//     console.log(stayDateFrom, stayDateTo)
//     this.router.navigate(['/form'], {
//       state: {
//         room: {
//           roomId: room,
//           roomName: room.roomName,
//           stayDateFrom: stayDateFrom,
//           stayDateTo: stayDateTo,
//           pricePerDayPerPerson: price,
//           minStay: room.minStay,
//           maxStay: room.maxStay,
//           guestCapacity: room.numberOfPersons
//         }
//       }
      
//     });
//     console.log(this.rooms);
//   }
// }


