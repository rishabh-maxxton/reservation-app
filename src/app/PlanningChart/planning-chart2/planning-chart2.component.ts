import { AfterViewInit, Component, OnInit  } from '@angular/core';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room, StayDetails, RoomConstraint } from '../../Interface/room-interface';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-planning-chart2',
  templateUrl: './planning-chart2.component.html',
  styleUrl: './planning-chart2.component.scss'
})
export class PlanningChart2Component implements OnInit{
  rooms:  Room[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date('2024-10-30');
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
  dateRange: { month: number, year: number, days: number[] }[] = [];

  constructor(
    private roomService: RoomServiceService,
    private router: Router,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  ngOnInit(): void {
    this.roomService.loadRooms().subscribe((data: Room[]) => {
      this.locations = [...new Set(data.map(room => room.locationName))];
      this.rooms = data;
      this.applyFilters();
    });

    this.generateDateRange();
    this.dateArray = this.generateDateArray(this.startDate, this.endDate);

    this.roomService.loadAvailability().subscribe((data: any[]) => {
      this.availability = data;
      this.applyFilters();
      this.extractRoomConstraints1();
    });
    this.loadBookings();
  }

  generateDateRange() {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    
    this.dateRange = [];
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
      startDate.setMonth(startDate.getMonth() + 1);
    }
  }

  generateDateArray(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    // console.log(dates);
    const currentDate = new Date(startDate);
    currentDate.setHours(5, 30, 0, 0);
    while (currentDate <= new Date(endDate)) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(5, 30, 0, 0);
    }
    return dates;
  }

  updateDateArrayAndRange(): void {
    this.dateArray = this.generateDateArray(this.startDate, this.endDate);
    // console.log(this.dateArray);
    // console.log(this.startDate, this.endDate);
    this.generateDateRange();
    // console.log(this.dateRange);
  }

  onStartDateChange(): void {
    this.updateDateArrayAndRange();
  }

  onEndDateChange(): void {
    this.updateDateArrayAndRange();
  }

  getTooltipContent(roomId: number, day: Date): string {
    const bookings = this.getAllBookings(roomId);
    // const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth() + 1);
    const dayStr = day.toISOString().split('T')[0];
    const booking = bookings.find(b => dayStr >= b.startDate.toISOString().split('T')[0] && dayStr <= b.endDate.toISOString().split('T')[0]);

    if (booking) {
        const startDateFormatted = `${booking.startDate.getDate()}-${this.months[day.getMonth() ]}-${day.getFullYear()}`;
        const endDateFormatted = `${booking.endDate.getDate()}-${this.months[day.getMonth() ]}-${day.getFullYear()}`;
        return ` Booked by: ${booking.customerName} \nFrom: ${startDateFormatted} \nTo: ${endDateFormatted} \nNo. of Guests: ${booking.totalGuests} \nStatus: ${booking.status}`;
    }
    return '';
  }

  getUserName(roomId: number, day: Date): string {
    const bookings = this.getAllBookings(roomId);
    const dayStr = day.toISOString().split('T')[0];
    const booking = bookings.find(b => dayStr >= b.startDate.toISOString().split('T')[0] && dayStr <= b.endDate.toISOString().split('T')[0]);
    if(booking){
      // console.log(booking.customerName);
      return booking.customerName;
    }
    return '';
  }
  

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
          // console.log(constraintMap[day].maxStay);
          const allDepartureDays = new Set([...constraintMap[day].departureDays, ...constraint.departureDays]);
          constraintMap[day].departureDays = Array.from(allDepartureDays);
        }
      });
    });
    return constraintMap;
  }

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

  // getRoomBookingsForMonth(roomId: number, month: number): Array<{ roomId: number, startDate: number, endDate: number, customerName: string, status: string, totalGuests: number }> {
  //   const roomBookings = this.bookings.filter(booking => {
  //     const bookingStartDate = new Date(booking.bookingInfo.stayDateFrom);
  //     const bookingEndDate = new Date(booking.bookingInfo.stayDateTo);
  //     return booking.bookingInfo.roomNo === roomId &&
  //            bookingStartDate.getMonth() === month - 1 &&
  //            bookingEndDate.getMonth() === month - 1;
  //   });
  //   return roomBookings.map(booking => ({
  //     roomId: roomId,
  //     startDate: new Date(booking.bookingInfo.stayDateFrom).getDate(),
  //     endDate: new Date(booking.bookingInfo.stayDateTo).getDate(),
  //     customerName: booking.customerInfo.name,
  //     status: booking.bookingInfo.status,
  //     totalGuests: booking.bookingInfo.totalGuests
  //   })).sort((a, b) => a.startDate - b.startDate);
  // }

  getAllBookings(roomId: number): Array<{ roomId: number, startDate: Date, endDate: Date, customerName: string, status: string, totalGuests: number }> {
    const roomBookings = this.bookings.filter(booking => {
      const bookingStartDate = new Date(booking.bookingInfo.stayDateFrom);
      const bookingEndDate = new Date(booking.bookingInfo.stayDateTo);
      // console.log(bookingStartDate);
      return booking.bookingInfo.roomNo === roomId
    });
    
    return roomBookings.map(booking => ({
      roomId: roomId,
      startDate: new Date(booking.bookingInfo.stayDateFrom),
      endDate: new Date(booking.bookingInfo.stayDateTo),
      customerName: booking.customerInfo.name,
      status: booking.bookingInfo.status,
      totalGuests: booking.bookingInfo.totalGuests
    }))
    .sort((a, b) => a.startDate.getDate() - b.startDate.getDate());
  }

  getBookingStatus(roomId: number, day: Date): string {
    // const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth() + 1);
    const bookings = this.getAllBookings(roomId);
    const dayStr = day.toISOString().split('T')[0];
    const booking = bookings.find(b => roomId === b.roomId && dayStr >= b.startDate.toISOString().split('T')[0] && dayStr <= b.endDate.toISOString().split('T')[0]);
    return booking ? booking.status : 'Available'; 
  }

  getStartStatusColour(roomId: number, day: Date): string {
    // const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth() + 1);
    const bookings = this.getAllBookings(roomId);
    const dayStr = day.toISOString().split('T')[0];
    const booking = bookings.find(b => roomId === b.roomId && dayStr == b.startDate.toISOString().split('T')[0]);
    return booking ? booking.status : 'Available'; 
  }

  getEndStatusColour(roomId: number, day: Date): string {
    const bookings = this.getAllBookings(roomId);
    // const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth() + 1);
    const dayStr = day.toISOString().split('T')[0];
    const booking = bookings.find(b => roomId === b.roomId && dayStr == b.endDate.toISOString().split('T')[0]);
    // console.log(booking?.status);
    return booking ? booking.status : 'Available'; 
  }

  getBookingStyle(roomId: number, day: Date): {[key: string]: string} {
    const status = this.getBookingStatus(roomId, day);
    const color = this.getBookingColor(status);
    const bookingClass = this.getBookingClass(roomId, day);
    if(bookingClass == 'start-end'){
      const statusStart = this.getStartStatusColour(roomId, day);
      const statusEnd = this.getEndStatusColour(roomId, day);
      const colorStart = this.getBookingColor(statusStart);
      const colorEnd = this.getBookingColor(statusEnd);
      return {
        [`--booking-color-start`]: colorStart,
        [`--booking-color-end`]: colorEnd,        
      }
    }
    return {
      [`--booking-color-${bookingClass}`]: color
    };
  }

  getBookingColor(status: string): string {
    switch (status) {
      case 'Confirmed':
        return '#f39c12';
      case 'Checked In':
        return '#3498db';
      case 'Due In':
        return '#9b59b6';
      case 'Checked Out':
        return '#2ecc71';
      case 'Cancelled':
        return '#e74c3c';
      default:
        return '#20bf6b';
    }
  }

  getBookingClass(roomId: number, day: Date): string {
    if (this.isEndOfBooking(roomId, day) && this.isStartOfBooking(roomId, day)) {
      return 'start-end';
    }
    if (this.isStartOfBooking(roomId, day)) {
      return 'start';
    } else if (this.isEndOfBooking(roomId, day)) {
      return 'end';
    } else if (this.isMiddleCell(roomId, day)) {
      return 'middle';
    } else {
      return ''; 
    }
  }

  // isDayBooked(roomId: number, day: number): boolean {
  //   const bookings = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
  //   return bookings.some(booking => day >= booking.startDate && day < booking.endDate);
  // }

  isStartOfBooking(roomId: number, day: Date): boolean {
    const bookings = this.getAllBookings(roomId);
    const dayStr = day.toISOString().split('T')[0];

    for (const booking of bookings) {
      const startDateStr = booking.startDate.toISOString().split('T')[0];
      if (roomId === booking.roomId && dayStr === startDateStr) {
          return true;
      }
    }
    return false;
  }

  isEndOfBooking(roomId: number, day: Date): boolean {
    const bookings = this.getAllBookings(roomId);
    const dayStr = day.toISOString().split('T')[0];

    for (const booking of bookings) {
        const endDateStr = booking.endDate.toISOString().split('T')[0];
        if (roomId === booking.roomId && dayStr === endDateStr) {
            return true;
        }
    }
    return false;
  }

  isMiddleCell(roomId: number, day: Date): boolean {
    // const bookings = this.getRoomBookingsForMonth(roomId, day.getMonth()+1);
    const bookings = this.getAllBookings(roomId);
    for (const booking of bookings) {
        // console.log(day, booking.endDate, booking.startDate)
        // if (roomId === roomId && day.getDate() > booking.startDate && day.getDate() < booking.endDate) {
        if (roomId === roomId && day > booking.startDate && day < booking.endDate) {
            return true;
        }
    }
    return false;
  }

  isDateBeforeToday(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  calculateMinDev(roomId: number): number{
    const deviations = this.availability
        .filter(room => room.roomId === roomId)
        .map(room => room.minDeviation)
        .filter(dev => dev !== null); // Exclude null values

    // Return the minimum minDeviation or 0 if no valid deviations found
    return deviations.length > 0 ? Math.min(...deviations) : 0;
  }

  calculateMaxDev(roomId: number): number{
    const deviations = this.availability
        .filter(room => room.roomId === roomId)
        .map(room => room.maxDeviation)
        .filter(dev => dev !== null); // Exclude null values

    // Return the minimum minDeviation or 0 if no valid deviations found
    return deviations.length > 0 ? Math.max(...deviations) : 0;
  }

  isMinMaxDev(roomId: number, day: Date): boolean{
    let minDev = this.calculateMinDev(roomId);
    // console.log(minDev);
    let maxDev = this.calculateMaxDev(roomId);
    // console.log(maxDev);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let minTodayDate = new Date(today.getFullYear(), today.getMonth(),today.getDate() + minDev);
    let maxTodayDate = new Date(today.getFullYear(), today.getMonth(),today.getDate() + maxDev);
    // console.log(maxTodayDate);
    // console.log(day, minTodayDate, maxTodayDate);
    return day < minTodayDate || day > maxTodayDate;
  }


  isDayAvailable(roomId: number, day: Date): boolean {
    const availabilityData = this.availability.filter(item => item.roomId === roomId);
    const date = day;
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

  isArrivalDay(roomId: number, day: Date): boolean {
    const constraints = this.roomConstraints1[roomId] || [];
    const date = day;
    const dayOfWeekString = this.getDayOfWeekString(date.getDay());

    return constraints.some(constraint => 
      constraint.arrivalDays.includes(dayOfWeekString) &&
      this.isDayAvailable(roomId, day) && !this.isStartOfBooking(roomId, day) && !this.isMinMaxDev(roomId, day) && !this.isMiddleCell(roomId, day)
    );
  }

  getDayOfWeekString(dayIndex: number): string {
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return weekdays[dayIndex];
  }

  onLocationFilterChange(): void {
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
        maxStay: curr.maxStay,
        minDeviation: curr.minDeviation,
        maxDeviation: curr.maxDeviation
      });
      return acc;
    }, {} as { [roomId: number]: Array<RoomConstraint> });
  }

  getDepartureDaysForRange(roomId: number, startDay: Date, departureDays: string[], maxStay: number): Date[] {
    // console.log('Departure Days:', departureDays);
    const daysInMonth = new Date(startDay.getFullYear(), startDay.getMonth(), 0).getDate();
    // console.log('Days in Month:', daysInMonth);
    const validDepartureDays: Date[] = [];

    for (let i = 0; i < maxStay; i++) {
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + i);
      
      if (day.getDate() > daysInMonth) break;

      const weekday = this.getWeekday(day);
      if (departureDays.includes(weekday) && !this.isEndOfBooking(roomId, day) && !this.isMiddleCell(roomId, day)) {
        validDepartureDays.push(day);
      }
    }

    // console.log('Departure Days:', departureDays);
    // console.log('Days in Month:', daysInMonth);
    // console.log('Valid Departure Days:', validDepartureDays);

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

  highlightedDaysCompare(roomId: number, day: Date): boolean{
    if (!this.highlightedDays[roomId]) {
        return false;
    }
    const formattedDay = this.formatDateToString(day);
    
    // Check if any date in highlightedDays[roomId] matches formattedDay
    return this.highlightedDays[roomId].some(date => this.formatDateToString(date) === formattedDay);
  }

  startSelection(roomId: number, day: Date) {
    if(!this.isArrivalDay(roomId, day) || this.isStartOfBooking(roomId, day) || this.isMiddleCell(roomId, day) || this.isDateBeforeToday(day)){
      this.selectedRoomId = 0;
      this.highlightedDays[roomId] = [];
      return;
    }
    this.isSelecting = true;
    this.selectedRoomId = roomId;
    this.selectedDates = [day];
    this.applySelectionConstraints(roomId, day);
    this.extractRoomConstraints1();
    this.highlightDepartureDays(roomId, day);
  }


  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

  selctedDateCompare(day: Date): boolean {
    const formattedDay = this.formatDateToString(day);
    return this.selectedDates.some(date => this.formatDateToString(date) === formattedDay);
  }
  

  continueSelection(roomId: number, day: Date) {
    if(!this.isDayAvailable(roomId, day) || this.isEndOfBooking(roomId, day) || this.isMiddleCell(roomId, day)){
      this.selectedRoomId = 0;
      this.highlightedDays[roomId] = [];
      return;
    } 
    if(this.isSelecting && roomId === this.selectedRoomId){
      let lastDate = this.selectedDates[this.selectedDates.length - 1];
      let newDateRange = [...this.selectedDates];
      const constraints = this.getRoomConstraints(roomId);
      if (constraints) {
        const start = constraints[this.getDayOfWeekString(new Date(this.selectedDates[0]).getDay())];
          if (day > lastDate) {
            let currentLastDate = new Date(lastDate);
            while (newDateRange.length < start.maxStay + 1 && day > currentLastDate) {
              currentLastDate.setDate(currentLastDate.getDate() + 1);
              if (day >= currentLastDate) {
                if (this.isDayAvailable(roomId, currentLastDate) && !this.isEndOfBooking(roomId, day) && !this.isMiddleCell(roomId, day)) {
                  newDateRange.push(new Date(currentLastDate));
                }else{
                  break;
                }
              }else{
                break;
              }
            }
            this.selectedDates = newDateRange;
          } else if (day < lastDate) {
            let currentLastDate = new Date(lastDate);
            while (newDateRange.length > start.minStay + 1 && day < currentLastDate) {
              currentLastDate.setDate(currentLastDate.getDate() - 1);
              if (day <= currentLastDate) {
                  const dayToRemove = new Date(currentLastDate);
                  dayToRemove.setDate(dayToRemove.getDate() + 1);
                  newDateRange = newDateRange.filter(d => d.getTime() !== dayToRemove.getTime());
              } else {
                break;
              }
            }
            this.selectedDates = newDateRange;
          }
      } else {
        console.warn('No constraints available for room:', roomId);
      }
    }
  }

  endSelection(roomId: number, day: Date) {
    if(!this.isDayAvailable(roomId, day) || this.isEndOfBooking(roomId, day) || this.isMiddleCell(roomId, day)){
      this.selectedRoomId = 0;
      this.highlightedDays[roomId] = [];
      return;
    } 
  
    // Get the constraints for the specified room
    const roomConstraints = this.getRoomConstraints(roomId);
    const constraintForDay = roomConstraints[this.getDayOfWeekString(this.selectedDates[0].getDay())]
    

    // console.log(constraintForDay, day.toString());
  
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
    // console.log(isDepartureDayValid);
  
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
    let data = this.getDataOfRoom(room);
    const constraints = this.getRoomConstraints(room);
    // console.log(constraints);
    // console.log(this.getRoomConstraints(2))
    const date = new Date(stayDateFrom);
    // const day = date.getDate();
    const start = constraints[this.getWeekday(date)];
    this.roomService.setFilterDates(stayDateFrom, stayDateTo, 0);
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
