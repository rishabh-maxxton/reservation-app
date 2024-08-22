import { Component, OnInit } from '@angular/core';
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
  selectedMonth: number = new Date().getMonth() + 1;
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

  generateDaysForMonth(month: number): void {
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
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

