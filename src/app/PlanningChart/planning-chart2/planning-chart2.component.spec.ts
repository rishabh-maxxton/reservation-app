import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningChart2Component } from './planning-chart2.component';

describe('PlanningChart2Component', () => {
  let component: PlanningChart2Component;
  let fixture: ComponentFixture<PlanningChart2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanningChart2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningChart2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
