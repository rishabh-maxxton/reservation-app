import { Component, OnInit  } from '@angular/core';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room, StayDetails, RoomConstraint } from '../../Interface/room-interface';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-planning-chart2',
  templateUrl: './planning-chart2.component.html',
  styleUrl: './planning-chart2.component.scss'
})
export class PlanningChart2Component implements OnInit{
  rooms:  Room[] = [];
  filteredRooms: Room[] = [];
  days: number[] = [];
  locations: string[] = [];
  selectedRoomFilter: string = 'all';
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  bookings: any[] = [];
  selectedRoomId: number | null = null;
  selectedDates: Date[] = [];
  weekdays: string[] = [];
  highlightedDates: number[] = [];
  highlightedDays: { [key: number]: Date[] } = {}; 
  isSelecting: boolean = false;
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  availability: StayDetails[] = [];
  roomConstraints: { [roomId: number]: { minStay: number, maxStay: number, arrivalDays: string[], departureDays: string[] } } = {};
  roomConstraints1: {
    [roomId: number]: Array<RoomConstraint>
  } = {};
  dateArray: Date[] = [];
  dateNumber: number[] = [];

  // currentMonthYear: string = '';
  // currentDate: Date = new Date('2024-01-01');
  // dateRange: Date[] = [];
  dateRange: { month: number, year: number, days: number[] }[] = [];

  constructor(
    private roomService: RoomServiceService,
    private router: Router,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.roomService.loadRooms().subscribe((data: Room[]) => {
      this.locations = [...new Set(data.map(room => room.locationName))];
      this.rooms = data;
      this.applyFilters();
    });

    this.generateDateRange();
    let startDate: Date = new Date('2024-07-01');
    let endDate: Date = new Date('2025-01-31');
    this.dateArray = this.generateDateArray(startDate, endDate);
    // console.log(this.dateArray);

    this.roomService.loadAvailability().subscribe((data: any[]) => {
      this.availability = data;
      this.applyFilters();
      this.extractRoomConstraints1(); // Use the updated method
    });

    this.loadBookings();
    // this.generateDaysInMonth(this.selectedYear, this.selectedMonth);
  }


  generateDateRange() {
    const startDate = new Date('2024-07-01');
    const endDate = new Date('2025-01-31');
    

    while (startDate <= endDate) {
      const year = startDate.getFullYear();
      const month = startDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const days = Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => i + 1);

      this.dateRange.push({
        month,
        year,
        days
      });

      // console.log(this.dateRange);
      // console.log(startDate.getMonth() + 1);
      startDate.setMonth(startDate.getMonth() + 1);
    }
  }

  generateDateArray(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate)); // Add the current date to the array
      // let num = Number(new Date(this.currentDate).getDate)
      // this.dateNumber.push(num)
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  
    return dates;
  }
  

  getTooltipContent(roomId: number, day: Date): string {
    // console.log("hey");
    const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth());
    
    const booking = bookings.find(b => day.getDate() >= b.startDate && day.getDate() <= b.endDate);

    if (booking) {
        const startDateFormatted = `${booking.startDate}-${this.months[day.getMonth()]}-${day.getFullYear()}`;
        const endDateFormatted = `${booking.endDate}-${this.months[day.getMonth()]}-${day.getFullYear()}`;
        // console.log(startDateFormatted, endDateFormatted)
        return `Booked by: ${booking.customerName} \nFrom: ${startDateFormatted} \n To: ${endDateFormatted}`;
    }
    return '';
  }
  
  

  // updateDaysForMonthAndYear(month: number, year: number) {
  //   this.generateDaysInMonth(year, month);
  //   this.applyFilters();
  //   this.selectedRoomId = 0;
  // }

  getRoomConstraints(roomId: number): { [key: string]: { minStay: number, maxStay: number, departureDays: string[] } } {
    const constraints = this.roomConstraints1[roomId] || [];
  
    if (!constraints) {
      return {};
    }
  
    const constraintMap: { [key: string]: { minStay: number, maxStay: number, departureDays: string[] } } = {};
  
    constraints.forEach(constraint => {
      constraint.arrivalDays.forEach(day => {
        if (!constraintMap[day]) {
          constraintMap[day] = {
            minStay: constraint.minStay,
            maxStay: constraint.maxStay,
            departureDays: constraint.departureDays
          };
        } else {
          constraintMap[day].minStay = Math.min(constraintMap[day].minStay, constraint.minStay);
          constraintMap[day].maxStay = Math.max(constraintMap[day].maxStay, constraint.maxStay);
          const allDepartureDays = new Set([...constraintMap[day].departureDays, ...constraint.departureDays]);
          constraintMap[day].departureDays = Array.from(allDepartureDays);
        }
      });
    });
    console.log(constraintMap);
    return constraintMap; // Ensure this returns an array with a single object
  }
  

  // generateDaysInMonth(year: number, month: number) {
  //   const date = new Date(year, month - 1, 1);
  //   const days = [];
  //   const weekdays = [];
  //   while (date.getMonth() === month - 1) {
  //       days.push(date.getDate());
  //       weekdays.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
  //       date.setDate(date.getDate() + 1);
  //   }
  //   this.days = days;
  //   this.weekdays = weekdays;
  // }

  // generateDaysForMonth(month: number): void {
  //   const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
  //   this.days = [];
    
  //   for (let i = 1; i <= daysInMonth; i++) {
  //     this.days.push(i);
  //   }
  // }

  formatDate(date: Date): string {
    const fullDate = new Date(date);
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
      // bookings: this.getRoomBookingsForMonth(room.roomId, this.selectedMonth)
    })).sort((a, b) => a.roomId - b.roomId);
  }

  getRoomBookingsForMonth(roomId: number, month: number): Array<{ startDate: number, endDate: number, customerName: string }> {
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
      customerName: booking.customerInfo.name,
    })).sort((a, b) => a.startDate - b.startDate);
    
  }

  // isDayBooked(roomId: number, day: number): boolean {
  //   const bookings = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
  //   // console.log(bookings);
  //   return bookings.some(booking => day >= booking.startDate && day < booking.endDate);
  // }

    // Check if the day is the start of a booking
  isStartOfBooking(roomId: number, day: Date): boolean {
    const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth()+1);
    // return bookings.some(booking => booking.startDate === day);
    // if(bookings)
    //   console.log(bookings);
    return bookings.some(booking => roomId === roomId && booking.startDate === day.getDate());
  }

  // Check if the day is the end of a booking
  isEndOfBooking(roomId: number, day: Date): boolean {
    const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth()+1);
    // return bookings.some(booking => booking.endDate === day);
    return bookings.some(booking => roomId === roomId && booking.endDate === day.getDate());
  }

isMiddleCell(roomId: number, day: Date): boolean {
  const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth()+1);
  for (const booking of bookings) {
      // Check if the day is between the start and end of the booking
      if (roomId === roomId && day.getDate() > booking.startDate && day.getDate() < booking.endDate) {
          return true;
      }
  }
  return false;
}


  isDayAvailable(roomId: number, day: Date): boolean {
    const availabilityData = this.availability.filter(item => item.roomId === roomId);
    const date = day;
    // console.log(day.getDate());
    const isValidDate = availabilityData.some(item => {
      const fromDate = new Date(item.stayDateFrom );
      const toDate = new Date(item.stayDateTo);
      return date >= fromDate && date <= toDate;
    });

    const inputDate = moment(date);
    const today = moment().startOf('day');
    // if(inputDate.isBefore(today) ? { invalidDate: true } : null)
    //   return false;
    
    return isValidDate;
    // return isValidDate && !this.isMiddleCell(roomId, day);
  }


  // isMinStayBooked(roomId: number, day: number): boolean {
  //   const constraints1 = this.getRoomConstraints(roomId);
  //   const minStay1 = constraints1[this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())]?.minStay;
  //   // console.log(minStay1);
  //   // if(minStay1){
  //   //   console.log(day+minStay1);
  //   // }
  //   return true;
  // }



  isArrivalDay(roomId: number, day: Date): boolean {
    const constraints = this.roomConstraints1[roomId] || [];
    const date = day;
    const dayOfWeekString = this.getDayOfWeekString(date.getDay());

    return constraints.some(constraint => 
      constraint.arrivalDays.includes(dayOfWeekString) &&
      this.isDayAvailable(roomId, day) && !this.isStartOfBooking(roomId, day)
    );
  }

  // isDepartureDay(roomId: number, day: number): boolean {
  //   const constraints = this.roomConstraints1[roomId] || [];
  //   const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
  //   const dayOfWeekString = this.getDayOfWeekString(date.getDay());
  //   return constraints.some(constraint => 
  //     constraint.departureDays.includes(dayOfWeekString)
  //   );
  // }

  getDayOfWeekString(dayIndex: number): string {
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return weekdays[dayIndex];
  }

  onLocationFilterChange(): void {
    this.applyFilters();
  }

  // onMonthFilterChange(): void {
  //   // this.generateDaysForMonth(this.selectedMonth);
  //   // this.applyFilters();
  //   this.updateDaysForMonthAndYear(this.selectedMonth, this.selectedYear);
    
  // }

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
    // console.log(this.roomConstraints);
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
    }, {} as { [roomId: number]: Array<RoomConstraint> });
    // console.log(this.roomConstraints1);
  }

  getDepartureDaysForRange(roomId: number, startDay: Date, departureDays: string[], maxStay: number): Date[] {
    console.log('Departure Days:', departureDays);
  
    // const daysInMonth = this.getDaysInMonth(this.selectedMonth, this.selectedYear);
    const daysInMonth = new Date(startDay.getFullYear(), startDay.getMonth(), 0).getDate();
    console.log('Days in Month:', daysInMonth);
  
    const validDepartureDays: Date[] = [];

  // Iterate over all days in the month
  // for (let day = startDay.getDate(); day <= startDay.getDate() + maxStay; day++) {
  //   const weekday = this.getWeekday(day);
  //   if (departureDays.includes(weekday) && !this.isEndOfBooking(roomId, day) && !this.isMiddleCell(roomId, day)) {
  //     validDepartureDays.push(day);
  //   }
  // }
  for (let i = 0; i < maxStay; i++) {
    const day = new Date(startDay);
    day.setDate(startDay.getDate() + i);
    
    // Check if the day is within the month
    if (day.getDate() > daysInMonth) break; // Stop if day exceeds days in the month

    const weekday = this.getWeekday(day);
    if (departureDays.includes(weekday) && !this.isEndOfBooking(roomId, day) && !this.isMiddleCell(roomId, day)) {
      validDepartureDays.push(day);
    }
  }

  console.log('Departure Days:', departureDays);
  console.log('Days in Month:', daysInMonth);
  console.log('Valid Departure Days:', validDepartureDays);

  return validDepartureDays;
  }
  

  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  highlightDepartureDays(roomId: number, day: Date) {
    // Get constraints for the selected room
    const constraints = this.getRoomConstraints(roomId);
    const dayOfWeekString = this.getDayOfWeekString(day.getDay());
    const constraintForDay = constraints[dayOfWeekString];
    const departureDays = constraintForDay.departureDays;
  
    // Get days to highlight based on constraints
    const daysToHighlight = this.getDepartureDaysForRange(roomId, this.selectedDates[0], departureDays, constraintForDay.maxStay);
  
    // Set highlighted days for the specific room
    this.highlightedDays[roomId] = daysToHighlight;
  }
  

  startSelection(roomId: number, day: Date) {
    if (!this.isArrivalDay(roomId, day) || this.isStartOfBooking(roomId, day) || this.isMiddleCell(roomId, day)) return;
    console.log(new Date(day.getFullYear(), day.getMonth(), day.getDate()));
    this.isSelecting = true;
    this.selectedRoomId = roomId;
    this.selectedDates = [day];
    this.applySelectionConstraints(roomId, day);
    this.extractRoomConstraints1();
    this.highlightDepartureDays(roomId, day);
  }
  

 

  continueSelection(roomId: number, day: Date) {
    if (!this.isDayAvailable(roomId, day) || this.isEndOfBooking(roomId, day) || this.isMiddleCell(roomId, day)) return;
    
    if (this.isSelecting && roomId === this.selectedRoomId) {
      let lastDate = this.selectedDates[this.selectedDates.length - 1];
      let newDateRange = [...this.selectedDates];
      const constraints = this.getRoomConstraints(roomId);
      console.log(constraints);
      if (constraints) {
        const start = constraints[this.getDayOfWeekString(new Date(day.getFullYear(), day.getMonth(), this.selectedDates[0].getDate()).getDay())];
        // console.log('Constraint For Day:',start);

          if (day > lastDate) {
            while (newDateRange.length < start.maxStay+1 && day > lastDate) {
              lastDate.setDate(lastDate.getDate() + 1);
              // lastDate++;
              if (day >= lastDate) {
                if (this.isDayAvailable(roomId, lastDate) && !this.isEndOfBooking(roomId, day) && !this.isMiddleCell(roomId, day)) {
                  newDateRange.push(lastDate);
                }else{
                  break;
                }
              }else{
                break;
              }
            }
            this.selectedDates = newDateRange;
            console.log(this.selectedDates)
          } else if (day < lastDate) {
            while (newDateRange.length > start.minStay && day < lastDate) {
              lastDate.setDate(lastDate.getDate() - 1);
              // lastDate--;
              if (day <= lastDate) {
                  // newDateRange = newDateRange.filter(d => d !== lastDate + 1);
                  newDateRange = newDateRange.filter(d => d.getDate() !== lastDate.getDate() + 1);
              } else {
                break;
              }
            }
            this.selectedDates = newDateRange;
          }
      } else {
        console.warn('No constraints available for room:', roomId);
      }
      console.log(this.selectedDates);
    }
  }

  endSelection(roomId: number, day: Date) {
    if (!this.isDayAvailable(roomId, day) || this.isEndOfBooking(roomId, day) || this.isMiddleCell(roomId, day)) {
      return;
    }
  
    // Get the constraints for the specified room
    const roomConstraints = this.getRoomConstraints(roomId);
    const constraintForDay = roomConstraints[this.getDayOfWeekString(this.selectedDates[0].getDay())]
    

    console.log(constraintForDay, day.toString());
  
    if (!constraintForDay) {
      // If no constraints are defined for the day, proceed with the selection
      this.isSelecting = false;
      this.bookRoom(this.selectedRoomId, this.formatDate(this.selectedDates[0]), this.formatDate(this.selectedDates[this.selectedDates.length - 1]));
      this.applySelectionConstraints(roomId, day);
      return;
    }

    let lastDay = this.getDayOfWeekString(day.getDay())
  
    // Check if the selected day is a valid departure day
    const isDepartureDayValid = constraintForDay.departureDays.includes(lastDay);
    console.log(isDepartureDayValid);
  
    if (isDepartureDayValid) {
      // If valid, apply the selection constraints
      this.isSelecting = false;
      this.bookRoom(this.selectedRoomId, this.formatDate(this.selectedDates[0]), this.formatDate(this.selectedDates[this.selectedDates.length - 1]));
      this.applySelectionConstraints(roomId, day);
      this.highlightedDays[roomId] = [];
    } else {
      // If not valid, prevent selection and possibly show a message
      this.snackBar.open('The selected day is not a valid departure day.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      this.isSelecting = false;
      this.selectedRoomId = 0;
      this.highlightedDays[roomId] = [];
    }
  }
  

  applySelectionConstraints(roomId: number, day: Date) {
    const constraints = this.getRoomConstraints(roomId);
    const minStayOfDate = constraints[this.getDayOfWeekString(day.getDay())]?.minStay + 1;
    const maxStayOfDate = constraints[this.getDayOfWeekString(day.getDay())]?.maxStay + 1;
    if (this.selectedDates.length < minStayOfDate) {
      while (this.selectedDates.length < minStayOfDate ) {
        let lastDate = this.selectedDates[this.selectedDates.length - 1];
        let nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 1);
        if(this.isEndOfBooking(roomId, nextDate) || this.isMiddleCell(roomId, nextDate)){
          this.selectedRoomId = 0;
        }
        // console.log(this.isDayBooked(roomId, lastDate+1));
        // if (lastDate < this.days.length && !this.isEndOfBooking(roomId, nextDate) && !this.isMiddleCell(roomId, nextDate) && this.isDayAvailable(roomId, nextDate)) {
        if (!this.isEndOfBooking(roomId, nextDate) && !this.isMiddleCell(roomId, nextDate) && this.isDayAvailable(roomId, nextDate)) {
            // console.log(this.isDayBooked(roomId, lastDate+1));
            // console.log("YoYo", lastDate+1);
            this.selectedDates.push(new Date(nextDate));
        } else {
          break;
        }
      }
    }
    //  else if (this.selectedDates.length > maxStayOfDate) {
    //   this.selectedDates = this.selectedDates.slice(0, constraints[this.getDayOfWeekString(new Date(this.selectedYear, this.selectedMonth - 1, day).getDay())]?.maxStay);
    // }
  }

  isPartOfBookedRange(roomId: number, day: Date): boolean {
    return this.bookings.some(booking =>
      booking.roomId === roomId && day.getDate() >= booking.startDate && day.getDate() <= booking.endDate
    );
  }

  // getBookingRangeColspan(roomId: number, day: number): number {
  //   const booking = this.bookings.find(booking =>
  //     booking.roomId === roomId && day === booking.startDate
  //   );

  //   if (booking) {
  //     return booking.endDate - booking.startDate + 1;
  //   }
  //   return 1;
  // }

  getDataOfRoom(roomid: number) {
    const roomObj = this.rooms.filter(data => data.roomId == roomid);
    return roomObj[0];
  }

  getWeekday(date: Date): string {
    const selectedDate = date;
    // const weekdays = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return weekdays[selectedDate.getDay()];
  }

  bookRoom(room: any, stayDateFrom: string, stayDateTo: string) {
    console.log("kasndkaskdlkasnd");
    let data = this.getDataOfRoom(room);
    console.log(stayDateFrom, stayDateTo , "yoyoyoyo");
    const constraints = this.getRoomConstraints(room);
    console.log(constraints);
    console.log(this.getRoomConstraints(2))
    const date = new Date(stayDateFrom);
    // const day = date.getDate();
    const start = constraints[this.getWeekday(date)];
    console.log(start); 
    this.router.navigate(['/form'], {
      state: {
        room: {
          roomId: room,
          stayDateFrom: stayDateFrom,
          stayDateTo: stayDateTo,
          pricePerDayPerPerson: data.pricePerDayPerPerson,
          minStay: start.minStay,
          maxStay: start.maxStay,
          guestCapacity: data.guestCapacity
        }
      }
    });
  }

}
