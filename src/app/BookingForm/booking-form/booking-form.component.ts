  import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import moment from 'moment';
  import { RoomServiceService } from '../../Service/room-service.service';
  import jsPDF from 'jspdf';

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
    mini: number;
    maxi: number;
    roomCapacity: any;

    _formBuilder: FormBuilder = new FormBuilder;

    firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });

    constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private roomService: RoomServiceService) {

      const roomData = history.state.room;
      
      console.log(roomData)

      this.mini = roomData.minStay;
      console.log(this.mini);
      this.maxi = roomData.maxStay;
      this.roomCapacity = roomData.guestCapacity;

      this.bookingForm = this.fb.group({
        reservationId: [{ value: this.generateReservationId(), disabled: true }],
        roomNo: [{ value:'', disabled: true}],
        stayDateFrom: ['', [Validators.required, this.dateValidator, this.roomAvailabilityValidator.bind(this)]],
        stayDateTo: ['', [Validators.required, this.dateValidator,, this.roomAvailabilityValidator.bind(this)]],
        numberOfDays: [{value: ''}, [Validators.required, this.minMaxDayValidator.bind(this)]],
        // numberOfDays: ['', [Validators.required, Validators.min(this.mini), Validators.max(this.maxi)]],
        totalGuests: ['', [Validators.required, Validators.min(1), this.guestCapacityValidator.bind(this)]],
        pricePerDayPerPerson: [{value: '', disabled: true}],
        totalPrice: [{value: '', disabled: true}],  
        status: [{ value: 'CONFIRMED', disabled: true }]
      });

      let stayDateFrom1 = roomService.getFilterDates().stayDateFrom;
      let stayDateTo = roomService.getFilterDates().stayDateTo;
      let numberOfPerson = roomService.getFilterDates().numberOfPerson;

      if (roomData) {
        this.bookingForm.patchValue({
          roomNo: roomData.roomId,
          // stayDateFrom: roomData.stayDateFrom,
          // stayDateTo: roomData.stayDateTo,
          stayDateFrom: stayDateFrom1,
          stayDateTo: stayDateTo,
          totalGuests: numberOfPerson,
          pricePerDayPerPerson: roomData.pricePerDayPerPerson,
          numberOfDays: this.UpdateNoOfDays()
        });
        this.bookingForm.patchValue({ reservationId: this.generateReservationId() });
      }

      this.userTypeFormGroup = this._formBuilder.group({
        userType: ['', Validators.required],
        existingEmail: ['']
      });

      

      this.customerForm = this._formBuilder.group({
        customerId:  [{ value: this.generateCustomerId(), disabled: true }],
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        age: ['',  [Validators.required, Validators.min(1)]],
        birthDate: ['', Validators.required],
        initialAddress: [''],
        city: [''],
        state: [''],
        country: [''],
        pincode: ['']
      });

      this.paymentForm = this.fb.group({
        totalPrice: [{value: '', disabled: true}],
        paymentId: [{ value: this.generatePaymentId(), disabled: true }],
        paymentMode: ['', Validators.required],
        paidAmount: [''],
        dueAmount: [{value : '', disabled: true}],
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

    ngOnInit(): void {
      this.UpdateNoOfDays();
      this.updateTotalPrice();
    }

    
    downloadPreview() {
      if (this.currentBooking.length === 0) {
        console.error('No bookings available for download.');
        return;
      }
    
      this.currentBooking.forEach((bookingData) => {
        const pdf = new jsPDF();
    
        // Header
        pdf.setFillColor(220, 220, 220); // Light grey
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 30, 'F');
        pdf.setFontSize(20);
        pdf.setTextColor(0); // Black text
        pdf.text('Invoice', 14, 20);
    
        // Add space before customer information
        pdf.setFontSize(12);
        pdf.setTextColor(0); // Reset to black
        
        // Customer Information
        pdf.setFont("helvetica", "bold"); // Set font to bold
        pdf.text('Booking Information', 14, 40);
        pdf.setFont("helvetica", "normal"); // Set font back to normal
        
        // Booking Information
        const bookingInfo = [
          `Reservation ID: ${bookingData.bookingInfo.reservationId}`,
          `Room No: ${bookingData.bookingInfo.roomNo}`,
          `Stay Date From: ${bookingData.bookingInfo.stayDateFrom}`,
          `Stay Date To: ${bookingData.bookingInfo.stayDateTo}`,
          `Number of Days: ${bookingData.bookingInfo.numberOfDays}`,
          `Total Guests: ${bookingData.bookingInfo.totalGuests}`,
          `Price Per Day/Person: ${bookingData.bookingInfo.pricePerDayPerPerson}`,
          `Total Price: ${bookingData.bookingInfo.totalPrice}`,
          `Status: ${bookingData.bookingInfo.status}`
        ];
    
        let y = 50; // Starting position for customer info
        bookingInfo.forEach(line => {
          pdf.text(line, 14, y);
          y += 10; // Increment y position
        });
    
        // Add space before booking information
        pdf.setFont("helvetica", "bold");
        pdf.text('Customer Information', 14, y);
        pdf.setFont("helvetica", "normal");
        y += 10;
    
        // Booking Information
        
        const customerInfo = [
          `Customer ID: ${bookingData.customerInfo.customerId}`,
          `Name: ${bookingData.customerInfo.name}`,
          `Email: ${bookingData.customerInfo.email}`,
          `Mobile Number: ${bookingData.customerInfo.mobileNumber}`,
          `Age: ${bookingData.customerInfo.age}`,
          `Birth Date: ${bookingData.customerInfo.birthDate}`,
          `Address: ${bookingData.customerInfo.initialAddress}, ${bookingData.customerInfo.city}, ${bookingData.customerInfo.state}, ${bookingData.customerInfo.country}, ${bookingData.customerInfo.pincode}`
        ];

        customerInfo.forEach(line => {
          pdf.text(line, 14, y);
          y += 10; // Increment y position
        });
    
        
    
        // Add space before payment information
        pdf.setFont("helvetica", "bold");
        pdf.text('Payment Information', 14, y);
        pdf.setFont("helvetica", "normal");
        y += 10;
    
        // Payment Information
        const paymentInfo = [
          `Payment ID: ${bookingData.paymentInfo.paymentId}`,
          `Payment Mode: ${bookingData.paymentInfo.paymentMode}`,
          `Paid Amount: ${bookingData.paymentInfo.paidAmount}`,
          `Due Amount: ${bookingData.paymentInfo.dueAmount}`
        ];
    
        paymentInfo.forEach(line => {
          pdf.text(line, 14, y);
          y += 10; // Increment y position
        });
    
        // Finalize and save the PDF
        pdf.save(`Invoice_${bookingData.bookingInfo.reservationId}.pdf`);
      });
    }
    
    
    

    guestCapacityValidator(control: AbstractControl): ValidationErrors | null {
      const inputGuest = control.value;
      if(inputGuest > this.roomCapacity){
        return {invalidCapacity : true}
      }
      else return null;
      
    }

    minMaxDayValidator(control: AbstractControl): ValidationErrors | null {
      // debugger;
      console.log("yoyoy");
      const inputStay = control.value;
      // console.log(inputStay);
      // console.log(this.mini);
      // console.log(this.maxi);
      if((inputStay < this.mini) || (inputStay > this.maxi)){
        console.log("xyzz")
        return { invalidStay: true }
      }
      else
        return null;
    }
    

    dateValidator(control: AbstractControl): ValidationErrors | null {
      const inputDate = moment(control.value);
      // console.log(inputDate)
      const today = moment().startOf('day');
      // console.log(today)
      return inputDate.isBefore(today) ? { invalidDate: true } : null;
    }

    roomAvailabilityValidator(control: AbstractControl): ValidationErrors | null {
      const selectedDateStr = control.value;
      if (!selectedDateStr) {
        return null;
      }
    
      const selectedDate = moment(selectedDateStr, 'YYYY-MM-DD', true);
      if (!selectedDate.isValid()) {
        return { invalidDate: true };
      }
    
      const roomNo = this.bookingForm.get('roomNo')?.value;
      if (!roomNo) {
        return null;
      }
    
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('booking_')) {
          const bookingData = JSON.parse(localStorage.getItem(key)!);
          if (!bookingData?.bookingInfo) {
            continue;
          }
          const bookingStart = moment(bookingData.bookingInfo.stayDateFrom);
          const bookingEnd = moment(bookingData.bookingInfo.stayDateTo);
          const storedRoomNo = bookingData.bookingInfo.roomNo;
    
          if (storedRoomNo === roomNo) {
            // If validating 'stayDateFrom', exclude the booking end date
            if (control === this.bookingForm.get('stayDateFrom')) {
              if (selectedDate.isSameOrAfter(bookingStart) && selectedDate.isBefore(bookingEnd)) {
                return { roomUnavailable: true };
              }
            }
    
            // If validating 'stayDateTo', exclude the booking start date
            if (control === this.bookingForm.get('stayDateTo')) {
              if (selectedDate.isAfter(bookingStart) && selectedDate.isSameOrBefore(bookingEnd)) {
                return { roomUnavailable: true };
              }
            }

            if(control === this.bookingForm.get('stayDateTo')){
              if(bookingStart.isSameOrAfter(this.bookingForm.get('stayDateFrom')?.value) && bookingEnd.isSameOrBefore(this.bookingForm.get('stayDateTo')?.value)){
                return { roomUnavailable: true };
              }
            }
          }
        }
      }
      return null;
    }
    

    // roomAvailabilityValidator(control: AbstractControl): ValidationErrors | null {
    //   const selectedDateStr = control.value;
    //   if (!selectedDateStr) {
    //     return null;
    //   }

    //   const selectedDate = moment(selectedDateStr, 'YYYY-MM-DD', true);
    //   if (!selectedDate.isValid()) {
    //     return { invalidDate: true };
    //   }
    
    //   // console.log(this.bookingForm.get('roomNo')?.value);
    //   const roomNo = this.bookingForm.get('roomNo')?.value;
    //   if (!roomNo) {
    //     return null;
    //   }
    
    //   for (let i = 0; i < localStorage.length; i++) {
    //     const key = localStorage.key(i);
    //     if (key && key.startsWith('booking_')) {
    //       const bookingData = JSON.parse(localStorage.getItem(key)!);
    //       if (!bookingData?.bookingInfo) {
    //         continue;
    //       }
    //       const bookingStart = moment(bookingData.bookingInfo.stayDateFrom);
    //       const bookingEnd = moment(bookingData.bookingInfo.stayDateTo);
    //       const storedRoomNo = bookingData.bookingInfo.roomNo;
    
    //       if (
    //         storedRoomNo === roomNo &&
    //         selectedDate.isBetween(bookingStart, bookingEnd, null, '[]')
    //       ) {
    //         return { roomUnavailable: true };
    //       }
    //     }
    //   }
    //   return null;
    // }


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
        this.customerForm.get('customerId')?.disable();
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

    returnTotalPrice(){
      const totalPrice = this.bookingForm.get('totalPrice')?.value || 0;
      console.log(totalPrice);
      this.paymentForm.patchValue({totalPrice: totalPrice});
    }

    updateDueAmount(){
      const totalPrice = this.bookingForm.get('totalPrice')?.value || 0;
      console.log(totalPrice);
      const paidAmount = this.paymentForm.get('paidAmount')?.value || 0;
      const dueAmount = totalPrice - paidAmount;
      this.paymentForm.patchValue({dueAmount});
    }
    
    updateTotalPrice() {
      const totalGuests = this.bookingForm.get('totalGuests')?.value || this.roomService.getFilterDates().numberOfPerson || 0;
      const pricePerDayPerPerson = this.bookingForm.get('pricePerDayPerPerson')?.value || 0;
      const numberOfDays = this.bookingForm.get('numberOfDays')?.value || 0;
      const totalPrice = totalGuests * pricePerDayPerPerson * numberOfDays;
      this.bookingForm.patchValue({ totalPrice });    
    }

    updateStatus(): void {
      const paidAmt = this.paymentForm.get('paidAmount')?.value || 0;
      if(paidAmt > 0){
        this.bookingForm.patchValue({status : "Due In"})
      }
      else{
        this.bookingForm.patchValue({status: "New"});
      }
    }

    UpdateNoOfDays(){
      const startDate = new Date(this.bookingForm.get('stayDateFrom')?.value);
      const endDate = new Date(this.bookingForm.get('stayDateTo')?.value);
      const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      this.bookingForm.patchValue({numberOfDays});
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
      if (this.bookingForm.invalid || this.customerForm.invalid || this.paymentForm.invalid) {
        return;
      }
      const bookingData = {
        bookingInfo: this.bookingForm.getRawValue(),
        customerInfo: this.customerForm.getRawValue(),
        paymentInfo: this.paymentForm.getRawValue(), 
      };
      const customerInfo = this.customerForm.getRawValue();
      localStorage.setItem(customerInfo.customerId, JSON.stringify(customerInfo));
      localStorage.setItem('booking_' + bookingData.bookingInfo.reservationId, JSON.stringify(bookingData));
      this.currentBooking.push(bookingData);
      console.log(this.currentBooking);
      this.snackBar.open('Booking successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      // alert('Booking Successful!');
      const bookings = [];    
      const customers = [];
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

