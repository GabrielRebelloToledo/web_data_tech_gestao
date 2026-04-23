import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensageOkComponent } from './mensage-ok.component';

describe('MensageOkComponent', () => {
  let component: MensageOkComponent;
  let fixture: ComponentFixture<MensageOkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensageOkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensageOkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
