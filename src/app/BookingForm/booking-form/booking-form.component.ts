import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  userTypeFormGroup: FormGroup;
  bookingForm: FormGroup;
  customerForm: FormGroup;
  paymentForm: FormGroup;
  router: any;
  roomToBeBooked: any;
  isExistingUser = false;
  existingEmails: string[] = [];
  currentBooking: any[] = [];

  _formBuilder: FormBuilder = new FormBuilder;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

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
      customerId:  [{ value: this.generateCustomerId(), disabled: true }],
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

    this.userTypeFormGroup.get('userType')?.valueChanges.subscribe(value => {
      this.isExistingUser = (value === 'existing');
      if (this.isExistingUser) {
        this.userTypeFormGroup.get('existingEmail')?.setValidators(Validators.required);
      } else {
        this.userTypeFormGroup.get('existingEmail')?.clearValidators();
        this.customerForm.reset();  // Clear any pre-filled data when switching to 'new'
      }
      this.userTypeFormGroup.get('existingEmail')?.updateValueAndValidity();
    });
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
      this.customerForm.reset(); // Clear the form when switching to an existing user
    } else {
      this.isExistingUser = false;
      const newCustomerId = this.generateCustomerId();
      this.customerForm.get('customerId')?.setValue(newCustomerId);
      this.customerForm.get('customerId')?.disable();
    }
  }
  
  onEmailChange() {
    const selectedEmail = this.userTypeFormGroup.get('existingEmail')?.value;
    const customerData = this.getCustomerDataByEmail(selectedEmail);
    if (customerData) {
      this.customerForm.patchValue(customerData);
      this.customerForm.get('customerId')?.disable(); // Disable customerId when selecting an existing user
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
    this.currentBooking.push(bookingData);
    console.log(this.currentBooking);
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

