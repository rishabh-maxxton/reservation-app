// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-booking-form',
//   templateUrl: './booking-form.component.html',
//   styleUrl: './booking-form.component.scss'
// })
// export class BookingFormComponent {

// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  // isLinear = true;
  userTypeFormGroup: FormGroup;
  bookingForm: FormGroup;
  customerForm: FormGroup;
  paymentForm: FormGroup;
  router: any;
  roomToBeBooked: any;
  isExistingUser = false;
  existingEmails: string[] = [];

  _formBuilder: FormBuilder = new FormBuilder;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;

  constructor(private fb: FormBuilder) {

    

    const roomData = history.state.room;

    this.bookingForm = this.fb.group({
      reservationId: [{ value: this.generateReservationId(), disabled: true }],
      roomNo: [''],
      stayDateFrom: [''],
      stayDateTo: [''],
      numberOfDays: [''],
      totalGuests: [''],
      pricePerDayPerPerson: [''],
      totalPrice: ['']
    });

    if (roomData) {
      this.bookingForm.patchValue({
        roomNo: roomData.roomId,
        stayDateFrom: roomData.stayDateFrom,
        stayDateTo: roomData.stayDateTo,
        pricePerDayPerPerson: roomData.pricePerDayPerPerson
      });

      this.bookingForm.patchValue({ reservationId: this.generateReservationId() });
    }

    this.userTypeFormGroup = this._formBuilder.group({
      userType: ['', Validators.required],
      existingEmail: ['']
    });

    this.customerForm = this._formBuilder.group({
      customerId: [''],
      name: [''],
      email: [''],
      mobileNumber: [''],
      age: [''],
      birthDate: [''],
      initialAddress: [''],
      city: [''],
      state: [''],
      country: [''],
      pincode: ['']
    });

    this.paymentForm = this.fb.group({
      paymentId: [{ value: this.generatePaymentId(), disabled: true }],
      paymentMode: [''],
      paidAmount: [''],
      dueAmount: ['']
    });

    this.loadExistingEmails();
    
  }

  ngOnInit(): void {}

  loadExistingEmails() {
    const customers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('CUST')) {
        const customerInfo = JSON.parse(localStorage.getItem(key)!);
        customers.push(customerInfo);
      }
    }
    this.existingEmails = customers.map(c => c.email);
    console.log(this.existingEmails);
  }

  onUserTypeSubmit() {
    const userType = this.userTypeFormGroup.get('userType')?.value;
    if (userType === 'existing') {
      this.isExistingUser = true;
    } else {
      this.isExistingUser = false;
    }
  }

  onEmailChange() {
    const selectedEmail = this.userTypeFormGroup.get('existingEmail')?.value;
    const customerData = this.getCustomerDataByEmail(selectedEmail);
    if (customerData) {
      this.customerForm.patchValue(customerData);
    }
  }

  getCustomerDataByEmail(email: string) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('CUST')) {
        const customerInfo = JSON.parse(localStorage.getItem(key)!);
        if (customerInfo.email === email) {
          return customerInfo;
        }
      }
    }
    return null;
  }

  updateTotalPrice() {
    const totalGuests = this.bookingForm.get('totalGuests')?.value || 0;
    const pricePerDayPerPerson = this.bookingForm.get('pricePerDayPerPerson')?.value || 0;
    const numberOfDays = this.bookingForm.get('numberOfDays')?.value || 0;
    const totalPrice = totalGuests * pricePerDayPerPerson * numberOfDays;
    this.bookingForm.patchValue({ totalPrice });    
  }

  generateReservationId(): string {
    return 'RES' + Math.floor(Math.random() * 10000);
  }

  generateCustomerId(): string {
    return 'CUST' + Math.floor(Math.random() * 10000);
  }

  generatePaymentId(): string {
    return 'PAY' + Math.floor(Math.random() * 10000);
  }

  onNext(stepId: string): void {
    const activeTab = document.querySelector('.nav-tabs .active');
    if (activeTab) {
      (activeTab as HTMLElement).classList.remove('active');
    }
    const nextTab = document.querySelector(`[href="#${stepId}"]`);
    if (nextTab) {
      (nextTab as HTMLElement).classList.add('active');
      (document.querySelector(`#${stepId}`) as HTMLElement).classList.add('active', 'show');
    }
  }

  onSubmit(): void {
    const bookings = [];
    const customers = [];
    const bookingData = {
      bookingInfo: this.bookingForm.getRawValue(),
      customerInfo: this.customerForm.getRawValue(),
      paymentInfo: this.paymentForm.getRawValue()
    };
    const customerInfo = this.customerForm.getRawValue();
    localStorage.setItem(customerInfo.customerId, JSON.stringify(customerInfo));
    localStorage.setItem('booking_' + bookingData.bookingInfo.reservationId, JSON.stringify(bookingData));
    alert('Booking Successful!');

    for(let i=0;i < localStorage.length;i++){
      const key = localStorage.key(i);
      if (key && key.startsWith('CUST')) {
        const bookingDataJson = localStorage.getItem(key);
        if (bookingDataJson) {
          const bookingData = JSON.parse(bookingDataJson);
          customers.push(bookingData);
        }
      }

    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('booking_')) {
        const bookingDataJson = localStorage.getItem(key);
        if (bookingDataJson) {
          const bookingData = JSON.parse(bookingDataJson);
          bookings.push(bookingData);
        }
      }
    }
  
    console.log('All Bookings:', bookings);
    console.log('All Customers:', customers);
  }
  

  

  
}
