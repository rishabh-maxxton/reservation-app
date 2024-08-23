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
import { MatOptionModule } from '@angular/material/core';
import { PlanningChartComponent } from './PlanningChart/planning-chart/planning-chart.component';
import { DatePipe } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    RoomAvailabilityCardComponent,
    NavbarLogoComponent,
    BookingFormComponent,
    PlanningChartComponent,
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
  ],
  providers: [provideHttpClient(), provideAnimationsAsync(), DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
