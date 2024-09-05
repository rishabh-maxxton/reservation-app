import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingFormComponent } from './BookingForm/booking-form/booking-form.component';
import { HomeComponent } from './Home/home/home.component';
import { PlanningChartComponent } from './PlanningChart/planning-chart/planning-chart.component';
import { BookedReservationsComponent } from './BookedReservations/booked-reservations/booked-reservations.component';
import { PlanningChart2Component } from './PlanningChart/planning-chart2/planning-chart2.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'form', component: BookingFormComponent },
  { path: 'planningChart', component: PlanningChartComponent },
  { path: 'planningChart2', component: PlanningChart2Component },
  { path: 'bookedReservations', component: BookedReservationsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
