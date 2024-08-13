import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomAvailabilityCardComponent } from './room-availability-card.component';

describe('RoomAvailabilityCardComponent', () => {
  let component: RoomAvailabilityCardComponent;
  let fixture: ComponentFixture<RoomAvailabilityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoomAvailabilityCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomAvailabilityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
