import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room } from '../../Interface/room-interface';
import moment from 'moment';

@Component({
  selector: 'app-new-reservation-modal',
  templateUrl: './new-reservation-modal.component.html',
  styleUrls: ['./new-reservation-modal.component.scss']
})
export class NewReservationModalComponent implements OnInit {
  reservationForm!: FormGroup;
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  today: Date;
  displayedColumns: string[] = ['roomId', 'roomName', 'locationName', 'pricePerDayPerPerson', 'guestCapacity', 'bookNow'];
  minArrivalDate: Date | null = null;
  maxArrivalDate: Date | null = null;
  minDepartureDate: Date | null = null;
  maxDepartureDate: Date | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewReservationModalComponent>,
    private roomService: RoomServiceService,
    private router: Router
  ) {
    const now = new Date();
    this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  ngOnInit() {
    this.reservationForm = this.fb.group({
      arrivalDate: [null, Validators.required],
      departureDate: [null, Validators.required],
      numberOfGuests: [null, Validators.required]
    });
   
    this.roomService.getRooms().subscribe((data: Room[]) => {
      this.rooms = data;
    });
   
    this.reservationForm.valueChanges.subscribe(() => {
      this.onFilter();
      this.roomService.setFilterDates(this.formatDate(this.reservationForm.get('arrivalDate')?.value), this.formatDate(this.reservationForm.get('departureDate')?.value), this.reservationForm.get('numberOfGuests')?.value);
    });
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateArrivalDates(room: Room): Set<string> {
    const arrivalDates = new Set<string>();
    // if ( !room.maxDeviation || !room.bookDateFrom || !room.bookDateTo || !room.arrivalDays) return arrivalDates;
    if ( !room.maxDeviation ) return arrivalDates;
  
    const today = new Date();
    const bookDateFrom = new Date(room.bookDateFrom || " ");
    const bookDateTo = new Date(room.bookDateTo || " ");
  
    if (today < bookDateFrom || today > bookDateTo) {
      return arrivalDates;
    }
  
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (room.minDeviation || 0)); 
    // const minDate = new Date(today.getTime() + (((room.minDeviation || 0)) * 24 * 60 * 60 * 1000)); // minDeviation days from today
    const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + room.maxDeviation); 
    // const maxDate = new Date(today.getTime() + ((room.maxDeviation) * 24 * 60 * 60 * 1000)); // maxDeviation days from today
  
    // Ensure the deviation dates fall within the booking range
    // const effectiveMinDate = minDate < bookDateFrom ? bookDateFrom : minDate;
    // const effectiveMaxDate = maxDate > bookDateTo ? bookDateTo : maxDate;
  
    const getDayOfWeek = (date: Date): string => {
      const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      return daysOfWeek[date.getDay()];
    }
  
    for (let date = minDate; date <= maxDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = getDayOfWeek(date);
      let arrivals = room.arrivalDays || [];
      if (arrivals.includes(dayOfWeek)) {
        arrivalDates.add(date.toISOString().split('T')[0]);
      }
    }

    return arrivalDates;
  }

  generateCombinedArrivalDates(): Set<string> {
    const combinedDates = new Set<string>();
    this.rooms.forEach(room => {
      const roomDates = this.generateArrivalDates(room);
      roomDates.forEach(date => combinedDates.add(date));
    });
    return combinedDates;
  }

  arrivalDateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const arrivalDatesSet = this.generateCombinedArrivalDates();
    const formattedDate = date.toISOString().split('T')[0];
    return arrivalDatesSet.has(formattedDate);
  }

  departureDateFilter = (date: Date | null): boolean => {
    if (!date) return false;
  
    const arrivalDate = new Date(this.reservationForm.get('arrivalDate')?.value);
    if (!arrivalDate || date <= arrivalDate) return false;
  
    const validDepartureDates = new Set<string>();
  
    this.rooms.forEach(room => {
      if (room.stayDateFrom && room.stayDateTo) {
        const stayDateFrom = new Date(room.stayDateFrom);
        const stayDateTo = new Date(room.stayDateTo);
        const minStay = room.minStay ?? 0;
        const maxStay = room.maxStay ?? Infinity;
  
        const minDepartureDate = new Date(arrivalDate);
        minDepartureDate.setDate(arrivalDate.getDate() + minStay);
  
        const maxDepartureDate = new Date(arrivalDate);
        maxDepartureDate.setDate(arrivalDate.getDate() + maxStay);
  
        // Ensure the departure dates fall within the room's stay dates
        // const effectiveMinDepartureDate = minDepartureDate < stayDateFrom ? stayDateFrom : minDepartureDate;
        // const effectiveMaxDepartureDate = maxDepartureDate > stayDateTo ? stayDateTo : maxDepartureDate;
  
        const getDayOfWeek = (date: Date): string => {
          const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
          return daysOfWeek[date.getDay()];
        }

        for (let currentDate = minDepartureDate; currentDate <= maxDepartureDate; currentDate.setDate(currentDate.getDate() + 1)) {
          const dayOfWeek = getDayOfWeek(currentDate);
          if (room.departureDays?.includes(dayOfWeek)) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            if (this.checkFilteredRooms(arrivalDate, currentDate)) 
            validDepartureDates.add(formattedDate);
          }
        }
      }
    });
    const formattedDate = date.toISOString().split('T')[0];

    return validDepartureDates.has(formattedDate);
  }

  checkFilteredRooms(arrivalDate: Date, departureDate: Date): boolean {
    const numberOfGuests = this.reservationForm.get('numberOfGuests')?.value;
    let filteredRooms1 = this.rooms.filter(room => {
      const stayDateFrom = room.stayDateFrom ? new Date(room.stayDateFrom) : new Date();
      const stayDateTo = room.stayDateTo ? new Date(room.stayDateTo) : new Date('2024-12-01');
      const minStay = room.minStay || 1;
      const maxStay = room.maxStay || 30;
      const arrivalDays = room.arrivalDays || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const departureDays = room.departureDays || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const numberOfNights = (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24);
      const bookDateFrom = room.bookDateFrom ? new Date(room.bookDateFrom) : stayDateFrom;
      const bookDateTo = room.bookDateTo ? new Date(room.bookDateTo) : stayDateTo;
      const today = new Date();
      const getDayOfWeek = (date: Date): string => {
        const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return daysOfWeek[date.getDay()];
      }

      const isDateInRange = arrivalDate >= stayDateFrom && departureDate <= stayDateTo;
      const isStayValid = numberOfNights >= minStay && numberOfNights <= maxStay;
      const isArrivalDayValid = arrivalDays.includes(getDayOfWeek(arrivalDate));
      const isDepartureDayValid = departureDays.includes(getDayOfWeek(departureDate));
      const isCapacitySufficient = room.guestCapacity >= numberOfGuests;
      const checkBookDates = today >= bookDateFrom && today <= bookDateTo;
  
      return isDateInRange && isStayValid && isArrivalDayValid && isDepartureDayValid && isCapacitySufficient && checkBookDates;
    });
    filteredRooms1 = this.filterOutBookedRooms1(filteredRooms1, arrivalDate, departureDate);
    return filteredRooms1.length > 0;
  }

  onFilter() {
    const formValues = this.reservationForm.value;
    const arrivalDate = new Date(formValues.arrivalDate);
    const departureDate = new Date(formValues.departureDate);
    const numberOfGuests = formValues.numberOfGuests;
    this.filteredRooms = this.rooms.filter(room => {
      const stayDateFrom = room.stayDateFrom ? new Date(room.stayDateFrom) : new Date();
      const stayDateTo = room.stayDateTo ? new Date(room.stayDateTo) : new Date('2024-12-01');
      const minStay = room.minStay || 1;
      const maxStay = room.maxStay || 30;
      const arrivalDays = room.arrivalDays || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const departureDays = room.departureDays || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const numberOfNights = (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24);
      const bookDateFrom = room.bookDateFrom ? new Date(room.bookDateFrom) : stayDateFrom;
      const bookDateTo = room.bookDateTo ? new Date(room.bookDateTo) : stayDateTo;
      const today = new Date();
      const getDayOfWeek = (date: Date): string => {
        const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return daysOfWeek[date.getDay()];
      }

      const isDateInRange = arrivalDate >= stayDateFrom && departureDate <= stayDateTo;
      const isStayValid = numberOfNights >= minStay && numberOfNights <= maxStay;
      const isArrivalDayValid = arrivalDays.includes(getDayOfWeek(arrivalDate));
      const isDepartureDayValid = departureDays.includes(getDayOfWeek(departureDate));
      const isCapacitySufficient = room.guestCapacity >= numberOfGuests;
      const checkBookDates = today >= bookDateFrom && today <= bookDateTo;
      
      return isDateInRange && isStayValid && isArrivalDayValid && isDepartureDayValid && isCapacitySufficient && checkBookDates;
    });
    this.filterOutBookedRooms();
  }

  filterOutBookedRooms1(filteredRooms1 :Room[], arrivalDate: Date, departureDate: Date): Room[]{
    const bookings = this.getBookingsFromLocalStorage();
    return filteredRooms1 = filteredRooms1.filter(room => {
      return !bookings.some(booking => 
        booking.bookingInfo.roomNo === room.roomId && this.isDateOverlap(booking.bookingInfo.stayDateFrom, booking.bookingInfo.stayDateTo, arrivalDate, departureDate)
      );
    });
  }

  filterOutBookedRooms(): void {
    const bookings = this.getBookingsFromLocalStorage();
    this.filteredRooms = this.filteredRooms.filter(room => {
      return !bookings.some(booking => 
        booking.bookingInfo.roomNo === room.roomId && this.isDateOverlap(booking.bookingInfo.stayDateFrom, booking.bookingInfo.stayDateTo, this.reservationForm.value.arrivalDate, this.reservationForm.value.departureDate)
      );
    });
  }

  getBookingsFromLocalStorage(): any[] {
    const bookings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('booking_')) {
        const booking = JSON.parse(localStorage.getItem(key) || '{}');
        bookings.push(booking);
      }
    }
    return bookings;
  }

  isDateOverlap(start1: any, end1: any, start2: any, end2: any): boolean {
    return moment(start2).isBetween(moment(start1), moment(end1), null, '[]') || moment(end2).isBetween(moment(start1), moment(end1), null, '[]') && moment(start1).isBetween(moment(start2), moment(end2), null, '[]') || moment(end1).isBetween(moment(start2), moment(end2), null, '[]');
  }

  onSave() {
    console.log(this.reservationForm.get('arrivalDate')?.value, this.reservationForm.get('departureDate')?.value, this.reservationForm.get('numberOfGuests')?.value);
    console.log(this.rooms, this.filteredRooms);
  }

  onClose() {
    this.dialogRef.close();
  }
}