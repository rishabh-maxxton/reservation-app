import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NewReservationModalComponent } from '../../NewReservationModal/new-reservation-modal/new-reservation-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-booked-reservations',
  templateUrl: './booked-reservations.component.html',
  styleUrl: './booked-reservations.component.scss'
})
export class BookedReservationsComponent implements OnInit {
  bookings: any[] = []; // Array to hold booking data
  bookingForm: FormGroup; // Form group for handling updates
  chartData: number[] = [];
  chartLabels: string[] = [];
  

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.bookingForm = this.fb.group({
      reservationId: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadBookings();
    this.prepareChartData();
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
            customer: bookingData.customerInfo,
            // status: bookingData.bookingInfo.status as BookingStatus
          });
        }
      }
    }
  }


  prepareChartData() {
    let statusCounts: any = {
      "New": 0,
      "Confirmed": 0,
      "Checked In": 0,
      "Due In": 0,
      "Checked Out": 0,
      "Cancelled": 0,
    };

    this.bookings.forEach(booking => {
      statusCounts[booking.status]++;
    });

    this.chartLabels = Object.keys(statusCounts);
    this.chartData = Object.values(statusCounts);
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

  openReservationModal(): void {
    this.dialog.open(NewReservationModalComponent, {
      width: '120rem'
    });
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
