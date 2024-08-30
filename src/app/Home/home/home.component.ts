import { Component, OnInit } from '@angular/core';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room } from '../../Interface/room-interface';
import { FormGroup } from '@angular/forms';
import moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  locations: string[] = [];
  
  formData = {
    locationName: "",
    startDate: "",
    endDate: "",
    numberOfPersons: 0,
    priceRange: 0,
    minDays: 0,
    maxDays: 0
  }

  constructor(private roomService: RoomServiceService){}

  ngOnInit(): void {
    this.roomService.getRooms().subscribe((data: Room[]) => {
      // console.log(data)
      this.rooms = data;
      this.filteredRooms = data;
      this.locations = [...new Set(data.map(room => room.locationName))];
    });
    // this.filterForm.valueChanges.subscribe(() => this.onFilter());
  }

  filterOutBookedRooms(): void {
    console.log("Heyy");
    const bookings = this.getBookingsFromLocalStorage();
    console.log(bookings);

    this.filteredRooms = this.filteredRooms.filter(room => {
      return !bookings.some(booking => 
        booking.bookingInfo.roomNo === room.roomId && this.isDateOverlap(booking.bookingInfo.stayDateFrom, booking.bookingInfo.stayDateTo, this.formData.startDate, this.formData.endDate)
      );
    });
    console.log(this.filteredRooms);
  }

  getBookingsFromLocalStorage(): any[] {
    const bookings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('booking_')) {
        const booking = JSON.parse(localStorage.getItem(key) || '{}');
        // console.log('Booking Start:', new Date(booking.bookingInfo.stayDateFrom));
        // console.log('Booking End:', new Date(booking.bookingInfo.stayDateTo));
        // console.log('Form Start:', new Date(this.formData.startDate));
        // console.log('Form End:', new Date(this.formData.endDate));
        // console.log(booking.bookingInfo.stayDateFrom)
        bookings.push(booking);
      }
    }
    return bookings;
  }

  isDateOverlap(start1: any, end1: any, start2: any, end2: any): boolean {
    return moment(start2).isBetween(moment(start1), moment(end1), null, '[]') || moment(end2).isBetween(moment(start1), moment(end1), null, '[]');
    // return new Date(start1) <= new Date(end2) && new Date(start2) <= new Date(end1);
  }

  

  submit(data: FormGroup){
    // console.log(data);
    // console.log(data.controls['locationName'].value);
    this.formData.locationName = data.controls['locationName'].value;
    this.formData.startDate = data.controls['startDate'].value;
    this.formData.endDate = data.controls['endDate'].value;
    this.formData.numberOfPersons = data.controls['numberOfPersons'].value;
    this.formData.priceRange = data.controls['priceRange'].value;
    this.formData.minDays = data.controls['minDays'].value;
    this.formData.maxDays = data.controls['maxDays'].value;
    // console.log("Yayyy", this.formData);

    this.onFilter();
  }

  onFilter(): void {
    this.filteredRooms = this.rooms.filter(room => {
      const isLocationMatch = !this.formData.locationName || room.locationName === this.formData.locationName;
      const isPersonsMatch = !this.formData.numberOfPersons || room.numberOfPersons >= this.formData.numberOfPersons;
      const isPriceMatch = !this.formData.priceRange || room.pricePerDayPerPerson <= this.formData.priceRange;
      const isMinDaysMatch = !this.formData.minDays || (room.minStay && room.minStay >= this.formData.minDays); 
      const isMaxDaysMatch = !this.formData.maxDays || (room.maxStay && room.maxStay <= this.formData.maxDays);
      const isStartDateMatch = !this.formData.startDate || (room.stayDateFrom && new Date(this.formData.startDate) >= new Date(room.stayDateFrom));
      const isEndDateMatch = !this.formData.endDate || (room.stayDateTo && new Date(this.formData.endDate) <= new Date(room.stayDateTo));

      return isLocationMatch && isPersonsMatch && isPriceMatch && isMinDaysMatch && isMaxDaysMatch && isStartDateMatch && isEndDateMatch;
      
    });
    console.log(this.filteredRooms);
    this.filterOutBookedRooms();
  }
  


}

