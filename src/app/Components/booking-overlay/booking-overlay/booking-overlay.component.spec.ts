import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingOverlayComponent } from './booking-overlay.component';

describe('BookingOverlayComponent', () => {
  let component: BookingOverlayComponent;
  let fixture: ComponentFixture<BookingOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
