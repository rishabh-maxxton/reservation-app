import { Component, OnInit } from '@angular/core';
import { RoomServiceService } from '../../Service/room-service.service';
import { Room } from '../../Interface/room-interface';
import { FormGroup } from '@angular/forms';

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

      return isLocationMatch && isPersonsMatch && isPriceMatch && isMinDaysMatch && isMaxDaysMatch;
    });
  }
  

  constructor(private roomService: RoomServiceService){}

  ngOnInit(): void {
    this.roomService.getRooms().subscribe((data: Room[]) => {
      console.log(data)
      this.rooms = data;
      this.filteredRooms = data;
      this.locations = [...new Set(data.map(room => room.locationName))];
    });
    // this.filterForm.valueChanges.subscribe(() => this.onFilter());
  }
}

