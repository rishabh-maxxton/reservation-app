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

  ArrivaldateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    // Disable dates outside the computed constraints
    const isDateInRange = 
      (this.minArrivalDate ? date >= this.minArrivalDate : true) &&
      (this.maxArrivalDate ? date <= this.maxArrivalDate : true);

    return isDateInRange && (date >= this.today);
  }

  DeparturedateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    // Disable dates outside the computed constraints
    const isDateInRange = 
      (this.minArrivalDate ? date >= this.minArrivalDate : true) &&
      (this.maxArrivalDate ? date <= this.maxArrivalDate : true);

    return isDateInRange && (date >= this.today);
  }

  onFilter() {
    const formValues = this.reservationForm.value;
    const arrivalDate = new Date(formValues.arrivalDate);
    const departureDate = new Date(formValues.departureDate);
    const numberOfGuests = formValues.numberOfGuests;

    if (arrivalDate && departureDate && numberOfGuests) {
      const filtered = this.rooms.filter(room => {
        const stayDateFrom = new Date(room.stayDateFrom!);
        const stayDateTo = new Date(room.stayDateTo!);

        // Check if the room's stay dates include the arrival and departure dates
        const isDateInRange = (arrivalDate >= stayDateFrom && departureDate <= stayDateTo);

        // Check if the room's capacity is sufficient
        const isCapacitySufficient = room.guestCapacity >= numberOfGuests;

        return isDateInRange && isCapacitySufficient;
      });

      this.filteredRooms = filtered;
    } else {
      this.filteredRooms = this.rooms; // If form values are not valid, show all rooms
    }
  }

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
//   displayedColumns: string[] = ['roomId', 'roomName', 'locationName', 'pricePerDayPerPerson', 'guestCapacity', 'bookNow'];
//   today: Date;

//   constructor(
//     private fb: FormBuilder,
//     public dialogRef: MatDialogRef<NewReservationModalComponent>,
//     private roomService: RoomServiceService,
//     private router: Router
//   ) {
//     // Set today's date to the start of the day (midnight)
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
//     });

//     this.reservationForm.valueChanges.subscribe(() => this.onFilter());
//   }

//   // Custom date filter function
//   dateFilter = (date: Date | null): boolean => {
//     // Disable dates before today
//     return (date || new Date()) >= this.today;
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

//         // Check if the room's stay dates include the arrival and departure dates
//         const isDateInRange = (arrivalDate >= stayDateFrom && departureDate <= stayDateTo);

//         // Check if the room's capacity is sufficient
//         const isCapacitySufficient = room.guestCapacity >= numberOfGuests;

//         return isDateInRange && isCapacitySufficient;
//       });

//       this.filteredRooms = filtered;
//     } else {
//       this.filteredRooms = this.rooms; // If form values are not valid, show all rooms
//     }
//   }
  
//   bookNow(room: Room) {
//     // Navigate to the booking form page with room details, if needed
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

