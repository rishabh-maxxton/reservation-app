import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReservationModalComponent } from './new-reservation-modal.component';

describe('NewReservationModalComponent', () => {
  let component: NewReservationModalComponent;
  let fixture: ComponentFixture<NewReservationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewReservationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReservationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
