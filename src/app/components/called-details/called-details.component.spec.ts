import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalledDetailsComponent } from './called-details.component';

describe('CalledDetailsComponent', () => {
  let component: CalledDetailsComponent;
  let fixture: ComponentFixture<CalledDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalledDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalledDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
