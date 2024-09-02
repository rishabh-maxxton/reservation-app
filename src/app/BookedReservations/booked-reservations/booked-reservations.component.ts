import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-booked-reservations',
  templateUrl: './booked-reservations.component.html',
  styleUrl: './booked-reservations.component.scss'
})
export class BookedReservationsComponent implements OnInit {
  bookings: any[] = []; // Array to hold booking data
  bookingForm: FormGroup; // Form group for handling updates

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      reservationId: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.bookings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('booking_')) {
        const bookingDataJson = localStorage.getItem(key);
        if (bookingDataJson) {
          const bookingData = JSON.parse(bookingDataJson);
          this.bookings.push({
            ...bookingData.bookingInfo,
            payment: bookingData.paymentInfo,
            customer: bookingData.customerInfo
          });
        }
      }
    }
  }

  updateStatus(index: number, status: string) {
    console.log(this.bookings);
    const booking = this.bookings[index];
    const bookingKey = 'booking_' + booking.reservationId;
    const bookingDataJson = localStorage.getItem(bookingKey);

    if (bookingDataJson) {
      const bookingData = JSON.parse(bookingDataJson);
      bookingData.bookingInfo.status = status;
      localStorage.setItem(bookingKey, JSON.stringify(bookingData));
      alert('Status updated successfully!');
    } else {
      alert('Booking not found!');
    }
  }

  paidanddue(index: number) {
    const booking = this.bookings[index];
    const paidAmount = booking.payment.paidAmount || 0;
    const totalPrice = booking.totalPrice || 0;
    let status = booking.status;
    const dueAmount = totalPrice - paidAmount;
    this.bookings[index].payment.dueAmount = dueAmount;
    if(dueAmount === 0){
      status = "Confirmed";
    }
    this.updatePaymentInLocalStorage(booking.reservationId, dueAmount, status, paidAmount);
  }

  updatePaymentInLocalStorage(reservationId: string, dueAmount: number, status: string, paidAmount: number) {
    const bookingKey = 'booking_' + reservationId;
    const bookingDataJson = localStorage.getItem(bookingKey);

    if (bookingDataJson) {
      const bookingData = JSON.parse(bookingDataJson);
      bookingData.paymentInfo.dueAmount = dueAmount;
      bookingData.bookingInfo.status = status;
      bookingData.paymentInfo.paidAmount = paidAmount;
      localStorage.setItem(bookingKey, JSON.stringify(bookingData));
    }
  }


}
