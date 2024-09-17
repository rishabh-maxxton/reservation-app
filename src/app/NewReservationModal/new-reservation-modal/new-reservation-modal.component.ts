import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room } from '../../Interface/room-interface';

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
      this.filteredRooms = data;
      // this.calculateDateConstraints();
    });
   
    this.reservationForm.valueChanges.subscribe(() => this.onFilter());
  }

  //   generateArrivalDates(room: Room): Set<string> {
  //   const arrivalDates = new Set<string>();
  //   if (!room.minDeviation || !room.maxDeviation) return arrivalDates;

  //   const today = new Date();
  //   const minDate = new Date(today.getTime() + (room.minDeviation * 24 * 60 * 60 * 1000)); // minDeviation days from today
  //   const maxDate = new Date(today.getTime() + (room.maxDeviation * 24 * 60 * 60 * 1000)); // maxDeviation days from today

  //   for (let date = minDate; date <= maxDate; date.setDate(date.getDate() + 1)) {
  //     arrivalDates.add(date.toISOString().split('T')[0]); // Format as yyyy-mm-dd
  //   }

  //   return arrivalDates;
  // }

  generateArrivalDates(room: Room): Set<string> {
    const arrivalDates = new Set<string>();
    if (!room.minDeviation || !room.maxDeviation || !room.bookDateFrom || !room.bookDateTo || !room.arrivalDays) return arrivalDates;
  
    const today = new Date();
    const bookDateFrom = new Date(room.bookDateFrom);
    const bookDateTo = new Date(room.bookDateTo);
  
    // Check if today is within the booking range
    if (today < bookDateFrom || today > bookDateTo) {
      return arrivalDates; // No dates to generate if today is not in the booking range
    }
  
    // Calculate min and max dates based on deviation
    const minDate = new Date(today.getTime() + (room.minDeviation * 24 * 60 * 60 * 1000)); // minDeviation days from today
    const maxDate = new Date(today.getTime() + (room.maxDeviation * 24 * 60 * 60 * 1000)); // maxDeviation days from today
  
    // Ensure the deviation dates fall within the booking range
    const effectiveMinDate = minDate < bookDateFrom ? bookDateFrom : minDate;
    const effectiveMaxDate = maxDate > bookDateTo ? bookDateTo : maxDate;
  
    // Helper function to get the day of the week as a string
    const getDayOfWeek = (date: Date): string => {
      const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      return daysOfWeek[date.getDay()];
    }
  
    // Add dates from effectiveMinDate to effectiveMaxDate to the set, checking arrivalDays
    for (let date = minDate; date <= maxDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = getDayOfWeek(date);
      if (room.arrivalDays.includes(dayOfWeek)) {
        arrivalDates.add(date.toISOString().split('T')[0]); // Format as yyyy-mm-dd
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

    return arrivalDatesSet.has(formattedDate) && date >= this.today;
  }

  departureDateFilter = (date: Date | null): boolean => {
    if (!date) return false;
  
    const arrivalDate = new Date(this.reservationForm.get('arrivalDate')?.value);
    if (!arrivalDate || date <= arrivalDate) return false; // Departure date should be after the arrival date
  
    // Generate a set of valid departure dates based on the rooms array
    const validDepartureDates = new Set<string>();
    const today = new Date();
  
    this.rooms.forEach(room => {
      if (room.stayDateFrom && room.stayDateTo) {
        const stayDateFrom = new Date(room.stayDateFrom);
        const stayDateTo = new Date(room.stayDateTo);
        const minStay = room.minStay ?? 0;
        const maxStay = room.maxStay ?? Infinity;
  
        // Calculate the minimum and maximum possible departure dates based on arrival date
        const minDepartureDate = new Date(arrivalDate);
        minDepartureDate.setDate(arrivalDate.getDate() + minStay);
  
        const maxDepartureDate = new Date(arrivalDate);
        maxDepartureDate.setDate(arrivalDate.getDate() + maxStay);
  
        // Ensure the departure dates fall within the room's stay dates
        const effectiveMinDepartureDate = minDepartureDate < stayDateFrom ? stayDateFrom : minDepartureDate;
        const effectiveMaxDepartureDate = maxDepartureDate > stayDateTo ? stayDateTo : maxDepartureDate;
  
        // Helper function to get the day of the week as a string
        const getDayOfWeek = (date: Date): string => {
          const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
          // const daysOfWeek = ["Su", "Mo", "Tu", "We", "Tu", "Fri", "Sat"];
          return daysOfWeek[date.getDay()].toUpperCase(); // Convert to upper case to match departureDays
        }
  
        // Add valid dates to the set, checking departureDays
        for (let currentDate = effectiveMinDepartureDate; currentDate <= effectiveMaxDepartureDate; currentDate.setDate(currentDate.getDate() + 1)) {
          const dayOfWeek = getDayOfWeek(currentDate);
          if (room.departureDays?.includes(dayOfWeek)) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            validDepartureDates.add(formattedDate);
          }
        }
      }
    });
  
    // Check if the given date is within the valid departure dates
    const formattedDate = date.toISOString().split('T')[0];
    return validDepartureDates.has(formattedDate) && date >= today;
  }

  onFilter() {
    const formValues = this.reservationForm.value;
    const arrivalDate = new Date(formValues.arrivalDate);
    const departureDate = new Date(formValues.departureDate);
    const numberOfGuests = formValues.numberOfGuests;
  
    // if (arrivalDate && departureDate && numberOfGuests) {
      this.filteredRooms = this.rooms.filter(room => {
        if (!room.stayDateFrom || !room.stayDateTo || !room.minStay || !room.maxStay || !room.arrivalDays || !room.departureDays) {
          return false; // Skip rooms missing necessary constraints
        }
  
        const stayDateFrom = new Date(room.stayDateFrom);
        const stayDateTo = new Date(room.stayDateTo);
        const minStay = room.minStay;
        const maxStay = room.maxStay;
        const arrivalDays = room.arrivalDays;
        const departureDays = room.departureDays;
  
        // Calculate the number of nights between arrival and departure
        const numberOfNights = (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24);
  
        // Helper function to get the day of the week as a string
        const getDayOfWeek = (date: Date): string => {
          const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
          return daysOfWeek[date.getDay()].toUpperCase(); // Convert to uppercase to match arrays
        }
  
        // Check if arrival and departure dates fall within the room's stay dates
        const isDateInRange = arrivalDate >= stayDateFrom && departureDate <= stayDateTo;
  
        // Check if the number of nights falls within minStay and maxStay
        const isStayValid = numberOfNights >= minStay && numberOfNights <= maxStay;
  
        // Check if arrival date's day is in the room's arrivalDays
        const isArrivalDayValid = arrivalDays.includes(getDayOfWeek(arrivalDate));
  
        // Check if departure date's day is in the room's departureDays
        const isDepartureDayValid = departureDays.includes(getDayOfWeek(departureDate));
  
        // Check if room capacity is sufficient
        const isCapacitySufficient = room.guestCapacity >= numberOfGuests;
  
        return isDateInRange && isStayValid && isArrivalDayValid && isDepartureDayValid && isCapacitySufficient;
      });
    // } else {
    //   // If form values are not valid, show all rooms
    //   this.filteredRooms = this.rooms;
    // }
  }
  

  // onFilter() {
  //   const formValues = this.reservationForm.value;
  //   const arrivalDate = new Date(formValues.arrivalDate);
  //   const departureDate = new Date(formValues.departureDate);
  //   const numberOfGuests = formValues.numberOfGuests;
  
  //   if (arrivalDate && departureDate && numberOfGuests) {
  //     const validArrivalDates = this.generateCombinedArrivalDates();
  
  //     // Filter rooms based on constraints
  //     this.filteredRooms = this.rooms.filter(room => {
  //       if (!room.stayDateFrom || !room.stayDateTo) return false; // Skip rooms without stay date constraints
        
  //       const stayDateFrom = new Date(room.stayDateFrom);
  //       const stayDateTo = new Date(room.stayDateTo);
  //       const minStay = room.minStay ?? 0;
  //       const maxStay = room.maxStay ?? Infinity;
  
  //       // Check if arrival and departure dates are within room's stay constraints
  //       const effectiveMinDepartureDate = new Date(arrivalDate);
  //       effectiveMinDepartureDate.setDate(arrivalDate.getDate() + minStay);
  
  //       const effectiveMaxDepartureDate = new Date(arrivalDate);
  //       effectiveMaxDepartureDate.setDate(arrivalDate.getDate() + maxStay);
  
  //       const isDateInRange = (arrivalDate >= stayDateFrom && departureDate <= stayDateTo);
  //       const isStayValid = (departureDate >= effectiveMinDepartureDate && departureDate <= effectiveMaxDepartureDate);
  //       const isCapacitySufficient = room.guestCapacity >= numberOfGuests;
        
  //       // Check if arrival and departure dates align with room's constraints
  //       const isArrivalDateValid = validArrivalDates.has(arrivalDate.toISOString().split('T')[0]);
        
  //       return isDateInRange && isStayValid && isCapacitySufficient && isArrivalDateValid;
  //     });
  //   } else {
  //     // If form values are not valid, show all rooms
  //     this.filteredRooms = this.rooms;
  //   }
  // }
  

  bookNow(room: Room) {
    // Navigate to the booking form page with room details, if needed
    this.router.navigate(['/booking-form'], { queryParams: { roomId: room.roomId } });
  }

  onSave() {
    console.log(this.reservationForm.get('arrivalDate')?.value, this.reservationForm.get('departureDate')?.value, this.reservationForm.get('numberOfGuests')?.value);
    console.log(this.rooms, this.filteredRooms);
  }

  onClose() {
    this.dialogRef.close();
  }
}

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
// import { RoomServiceService } from '../../Service/room-service.service';
// import { Room } from '../../Interface/room-interface';

// @Component({
//   selector: 'app-new-reservation-modal',
//   templateUrl: './new-reservation-modal.component.html',
//   styleUrls: ['./new-reservation-modal.component.scss']
// })
// export class NewReservationModalComponent implements OnInit {
//   reservationForm!: FormGroup;
//   rooms: Room[] = [];
//   filteredRooms: Room[] = [];
//   today: Date;
//   displayedColumns: string[] = ['roomId', 'roomName', 'locationName', 'pricePerDayPerPerson', 'guestCapacity', 'bookNow'];
//   minArrivalDate: Date | null = null;
//   maxArrivalDate: Date | null = null;
//   minDepartureDate: Date | null = null;
//   maxDepartureDate: Date | null = null;

//   constructor(
//     private fb: FormBuilder,
//     public dialogRef: MatDialogRef<NewReservationModalComponent>,
//     private roomService: RoomServiceService,
//     private router: Router
//   ) {
//     const now = new Date();
//     this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   }

//   ngOnInit() {
//     this.reservationForm = this.fb.group({
//       arrivalDate: [null, Validators.required],
//       departureDate: [null, Validators.required],
//       numberOfGuests: [null, Validators.required]
//     });

//     this.roomService.getRooms().subscribe((data: Room[]) => {
//       this.rooms = data;
//       this.filteredRooms = data;
//       // this.calculateDateConstraints();
//     });

//     this.reservationForm.valueChanges.subscribe(() => this.onFilter());
//   }

//   generateArrivalDates(room: Room): Set<string> {
//     const arrivalDates = new Set<string>();
//     if (!room.minDeviation || !room.maxDeviation) return arrivalDates;

//     const today = new Date();
//     const minDate = new Date(today.getTime() + (room.minDeviation * 24 * 60 * 60 * 1000)); // minDeviation days from today
//     const maxDate = new Date(today.getTime() + (room.maxDeviation * 24 * 60 * 60 * 1000)); // maxDeviation days from today

//     for (let date = minDate; date <= maxDate; date.setDate(date.getDate() + 1)) {
//       arrivalDates.add(date.toISOString().split('T')[0]); // Format as yyyy-mm-dd
//     }

//     return arrivalDates;
//   }

//   generateCombinedArrivalDates(): Set<string> {
//     const combinedDates = new Set<string>();

//     this.rooms.forEach(room => {
//       const roomDates = this.generateArrivalDates(room);
//       roomDates.forEach(date => combinedDates.add(date));
//     });

//     return combinedDates;
//   }

//   arrivalDateFilter = (date: Date | null): boolean => {
//     if (!date) return false;

//     const arrivalDatesSet = this.generateCombinedArrivalDates();
//     const formattedDate = date.toISOString().split('T')[0];

//     return arrivalDatesSet.has(formattedDate) && date >= this.today;
//   }

//     departuredateFilter = (date: Date | null): boolean => {
//     if (!date) return false;

//     // Disable dates outside the computed constraints
//     const isDateInRange = 
//       (this.minArrivalDate ? date >= this.minArrivalDate : true) &&
//       (this.maxArrivalDate ? date <= this.maxArrivalDate : true);

//     return isDateInRange && (date >= this.today);
//   }

//   onFilter() {
//     const formValues = this.reservationForm.value;
//     const arrivalDate = new Date(formValues.arrivalDate);
//     const departureDate = new Date(formValues.departureDate);
//     const numberOfGuests = formValues.numberOfGuests;

//     if (arrivalDate && departureDate && numberOfGuests) {
//       const filtered = this.rooms.filter(room => {
//         const stayDateFrom = new Date(room.stayDateFrom!);
//         const stayDateTo = new Date(room.stayDateTo!);
//         const isDateInRange = (arrivalDate >= stayDateFrom && departureDate <= stayDateTo);
//         const isCapacitySufficient = room.guestCapacity >= numberOfGuests;
//         return isDateInRange && isCapacitySufficient;
//       });

//       this.filteredRooms = filtered;
//     } else {
//       this.filteredRooms = this.rooms;
//     }
//   }

//   bookNow(room: Room) {
//     this.router.navigate(['/booking-form'], { queryParams: { roomId: room.roomId } });
//   }

//   onSave() {
//     console.log(this.reservationForm.get('arrivalDate')?.value, this.reservationForm.get('departureDate')?.value, this.reservationForm.get('numberOfGuests')?.value);
//     console.log(this.rooms, this.filteredRooms);
//   }

//   onClose() {
//     this.dialogRef.close();
//   }
// }
