import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingFormComponent } from './BookingForm/booking-form/booking-form.component';
import { HomeComponent } from './Home/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'form', component: BookingFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
