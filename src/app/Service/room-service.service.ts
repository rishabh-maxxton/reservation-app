import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Room } from '../Interface/room-interface';

@Injectable({
  providedIn: 'root'
})
export class RoomServiceService {

  private apiUrl1 = 'https://jadhavsudhit.github.io/Booking-module/rooms.json';
  private apiUrl2 = 'https://jadhavsudhit.github.io/Booking-module/stays.json';

  loadRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl1);
  }

  loadAvailability(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl2);
  }
  
  constructor(private http: HttpClient) { }

  getRooms(): Observable<Room[]> {
    return forkJoin([
      this.http.get<Room[]>(this.apiUrl1).pipe(
        catchError(error => {
          console.log('Error fetching apiUrl1', error);
          return [];
        })
      ),
      this.http.get<any[]>(this.apiUrl2).pipe(
        catchError(error => {
          console.log('Error fetching apiUrl2', error);
          return [];
        })
      )
    ]).pipe(
      map(([rooms, additionalData]) => {
        let combinedRooms: Room[] = [];
  
        rooms.forEach(room => {
          const matchingAdditionalInfo = additionalData.filter(data => data.roomId === room.roomId);
  
          if (matchingAdditionalInfo.length > 0) {
            matchingAdditionalInfo.forEach(info => {
              combinedRooms.push({ ...room, ...info });
            });
          } else {
            combinedRooms.push(room);
          }
        });
  
        return combinedRooms;
      })
    );
  }
}
