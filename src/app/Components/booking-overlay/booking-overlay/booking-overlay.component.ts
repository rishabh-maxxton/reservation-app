// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-booking-overlay',
//   templateUrl: './booking-overlay.component.html',
//   styleUrl: './booking-overlay.component.scss'
// })
// export class BookingOverlayComponent {

// }

// booking-overlay.component.ts
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-booking-overlay',
  template: `
    <ng-template #overlayTemplate let-data="booking">
  <div class="overlay-content">
    <p>User: {{ data?.username }}</p>
    <!-- Display other booking details as needed -->
  </div>
</ng-template>
  `,
  styles: [`
    .overlay-content {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class BookingOverlayComponent {
  username: string;

  constructor(@Inject('username') username: string) {
    this.username = username;
  }
}
