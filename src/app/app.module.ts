import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Home/home/home.component';
import { SearchComponent } from './Components/search/search.component';
import { RoomAvailabilityCardComponent } from './Components/room-availability-card/room-availability-card.component';
import { NavbarLogoComponent } from './Components/navbar-logo/navbar-logo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { BookingFormComponent } from './BookingForm/booking-form/booking-form.component';
import {MatStepperModule} from '@angular/material/stepper';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatRadioButton, MatRadioGroup, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { PlanningChartComponent } from './PlanningChart/planning-chart/planning-chart.component';
import { DatePipe } from '@angular/common';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BookedReservationsComponent } from './BookedReservations/booked-reservations/booked-reservations.component';
import { PlanningChart2Component } from './PlanningChart/planning-chart2/planning-chart2.component';
import { NewReservationModalComponent } from './NewReservationModal/new-reservation-modal/new-reservation-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { PieChartComponent } from './pie-chart/pie-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    RoomAvailabilityCardComponent,
    NavbarLogoComponent,
    BookingFormComponent,
    PlanningChartComponent,
    BookedReservationsComponent,
    PlanningChart2Component,
    NewReservationModalComponent,
    PieChartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioButton,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatRadioGroup,
    FormsModule,
    CdkOverlayOrigin,
    OverlayModule,
    CdkConnectedOverlay,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatNativeDateModule,
    
  ],
  providers: [provideHttpClient(), provideAnimationsAsync(), DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
