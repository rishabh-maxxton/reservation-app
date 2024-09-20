import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Input, Output } from '@angular/core';
import { RoomServiceService } from '../../Service/room-service.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent{

  @Input() locations !: string[];
  
  @Output() Data: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  public filterForm : FormGroup;

  constructor(private fb: FormBuilder, private roomService: RoomServiceService) {
    this.filterForm = this.fb.group({
      locationName: "",
      startDate: "",
      endDate: "",
      numberOfPersons: "",
      priceRange: 4000,
      minDays: 0,
      maxDays: 0
    }); 
  }


  onSubmit(): void {
    this.Data.emit(this.filterForm);
    console.log(this.filterForm.get('startDate')?.value)
    this.roomService.setFilterDates(this.filterForm.get('startDate')?.value, this.filterForm.get('endDate')?.value, this.filterForm.get('numberOfPersons')?.value);
  }
}




// rooms: Room[] = [];
  // filteredRooms: Room[] = [];
  // filterForm: FormGroup;
  // locations: string[] = [];
  // router: any;

  // constructor(private roomService: RoomServiceService, private fb: FormBuilder) {
  //   this.filterForm = this.fb.group({
  //     locationName: [''],
  //     startDate: [''],
  //     endDate: [''],
  //     numberOfPersons: [''],
  //     priceRange: [4000],
  //     minDays: [0],
  //     maxDays: [0]
  //   });
  // }

  // ngOnInit(): void {
  //   this.roomService.getRooms().subscribe((data: Room[]) => {
  //     console.log(data)
  //     this.rooms = data;
  //     this.filteredRooms = data;
  //     this.locations = [...new Set(data.map(room => room.locationName))];
  //     this.onFilter1();
  //   });
  //   // this.filterForm.valueChanges.subscribe(() => this.onFilter());
  // }

  // onFilter(): void {
  //   if (this.filterForm.invalid) {
  //     return;
  //   }
  //   const { locationName, numberOfPersons, priceRange, minDays, maxDays } = this.filterForm.value;

  //   this.filteredRooms = this.rooms.filter(room => {
  //     const isLocationMatch = !locationName || room.locationName === locationName;
  //     const isPersonsMatch = !numberOfPersons || room.guestCapacity >= numberOfPersons;
  //     const isPriceMatch = !priceRange || room.pricePerDayPerPerson <= priceRange;
  //     const isMinDaysMatch = !minDays || (room.minStay && room.minStay >= minDays); 
  //     const isMaxDaysMatch = !maxDays || (room.maxStay && room.maxStay <= maxDays); 

  //     return isLocationMatch && isPersonsMatch && isPriceMatch && isMinDaysMatch && isMaxDaysMatch;
  //   });
  // }
