import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingFormComponent } from './BookingForm/booking-form/booking-form.component';
import { HomeComponent } from './Home/home/home.component';
import { PlanningChartComponent } from './PlanningChart/planning-chart/planning-chart.component';
import { BookedReservationsComponent } from './BookedReservations/booked-reservations/booked-reservations.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'form', component: BookingFormComponent },
  { path: 'planningChart', component: PlanningChartComponent },
  { path: 'bookedReservations', component: BookedReservationsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
