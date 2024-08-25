import { Component, OnInit } from '@angular/core';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room } from '../../Interface/room-interface';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

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
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  bookings: any[] = [];
  selectedRoomId: number | null = null;
  selectedDates: number[] = [];
  weekdays: string[] = [];
  isSelecting: boolean = false;
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private roomService: RoomServiceService, private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.roomService.loadRooms().subscribe((data: Room[]) => {
      this.locations = [...new Set(data.map(room => room.locationName))];
      this.rooms = data;
      this.applyFilters();
    });
    
    this.loadBookings();
    this.generateDaysForMonth(this.selectedMonth);
    this.generateDaysInMonth(this.selectedYear, this.selectedMonth);
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
    console.log(weekdays)
  }

  generateDaysForMonth(month: number): void {
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  formatDate(date: number): string {
    // Assuming 'date' is a day of the month, and selectedMonth is the current month, create a full date
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

  isDayBooked(roomId: number, day: number): boolean {
    const bookings = this.getRoomBookingsForMonth(roomId, this.selectedMonth);
    return bookings.some(booking => day >= booking.startDate && day <= booking.endDate);
  }

  onLocationFilterChange(): void {
    this.applyFilters();
  }

  onMonthFilterChange(): void {
    this.generateDaysForMonth(this.selectedMonth);
    this.applyFilters();
  }



startSelection(roomId: number, day: number) {
  if (this.isDayBooked(roomId, day)) return;
  this.isSelecting = true;
  this.selectedRoomId = roomId;
  this.selectedDates = [day];
}

continueSelection(roomId: number, day: number) {
  if (this.isDayBooked(roomId, day)) return;
  if (this.isSelecting && roomId === this.selectedRoomId) {
    const lastDate = this.selectedDates[this.selectedDates.length - 1];
    if (day > lastDate) {
      this.selectedDates.push(day);
    }
  }
}

endSelection(roomId: number, day: number) {
  if (this.isDayBooked(roomId, day)) return;
  this.isSelecting = false;
}

isPartOfBookedRange(roomId: string, day: number): boolean {
  // Find the booking that matches the given roomId and includes the day
  return this.bookings.some(booking =>
      booking.roomId === roomId && day >= booking.startDate && day <= booking.endDate
  );
} 

getBookingRangeColspan(roomId: string, day: number): number {
  // Find the booking that matches the given roomId and starts on the given day
  const booking = this.bookings.find(booking =>
      booking.roomId === roomId && day === booking.startDate
  );

  if (booking) {
      return booking.endDate - booking.startDate + 1;
  }
  return 1;
}


  getPrice(roomid: any){
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


