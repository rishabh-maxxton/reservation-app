import { Component, Input } from '@angular/core';
import { Room } from '../../Interface/room-interface';
import { RoomServiceService } from '../../Service/room-service.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef,AfterContentChecked} from '@angular/core'

@Component({
  selector: 'app-room-availability-card',
  templateUrl: './room-availability-card.component.html',
  styleUrl: './room-availability-card.component.scss'
})
export class RoomAvailabilityCardComponent implements AfterContentChecked{

  stayDateFrom1 : string = "";
  stayDateTo1 : string = "";
  // changeDetector: any;

  constructor(private roomService: RoomServiceService, private router: Router, private changeDetector: ChangeDetectorRef) {
    
  }
  ngAfterContentChecked() : void {
    this.changeDetector.detectChanges();
}
  

  @Input() filteredRooms !: any;

  bookRoom(room: any, pricePerDayPerPerson : number, minStay: number, maxStay : number, guestCapacity : number) {
    this.stayDateFrom1 = this.roomService.getFilterDates().stayDateFrom;
    this.stayDateTo1 = this.roomService.getFilterDates().stayDateTo;
    console.log(this.stayDateFrom1, "please")
    console.log("Whyyy")
    console.log(this.stayDateFrom1, this.stayDateTo1);
    this.router.navigate(['/form'], {
      state: {
        room: {
          roomId: room,
          stayDateFrom: this.stayDateFrom1,
          stayDateTo: this.stayDateTo1,
          pricePerDayPerPerson: pricePerDayPerPerson,
          minStay: minStay,
          maxStay: maxStay,
          guestCapacity: guestCapacity
        }
      }
    });
  }

  getRandomImage(): string {
    const randomNumber = Math.floor(Math.random() * 17) + 1;
    return `asset/images/Rooms/Room (${randomNumber}).jpg`;
  }
}
