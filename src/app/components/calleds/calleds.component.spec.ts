import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalledsComponent } from './calleds.component';

describe('CalledsComponent', () => {
  let component: CalledsComponent;
  let fixture: ComponentFixture<CalledsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalledsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalledsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
