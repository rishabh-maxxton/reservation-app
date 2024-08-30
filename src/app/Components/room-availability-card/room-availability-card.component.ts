import { Component, Input } from '@angular/core';
import { Room } from '../../Interface/room-interface';

@Component({
  selector: 'app-room-availability-card',
  templateUrl: './room-availability-card.component.html',
  styleUrl: './room-availability-card.component.scss'
})
export class RoomAvailabilityCardComponent{

  @Input() filteredRooms !: any;

  constructor() {}

  getRandomImage(): string {
    const randomNumber = Math.floor(Math.random() * 17) + 1;
    return `asset/images/Rooms/Room (${randomNumber}).jpg`;
  }
}
