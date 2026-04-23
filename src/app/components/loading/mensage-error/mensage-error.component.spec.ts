import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensageErrorComponent } from './mensage-error.component';

describe('MensageErrorComponent', () => {
  let component: MensageErrorComponent;
  let fixture: ComponentFixture<MensageErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensageErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensageErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
