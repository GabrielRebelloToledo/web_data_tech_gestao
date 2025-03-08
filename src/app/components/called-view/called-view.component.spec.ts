import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalledViewComponent } from './called-view.component';

describe('CalledViewComponent', () => {
  let component: CalledViewComponent;
  let fixture: ComponentFixture<CalledViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalledViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalledViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
