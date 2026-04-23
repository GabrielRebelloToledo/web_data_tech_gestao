import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsDetailsComponent } from './forms-details.component';

describe('FormsDetailsComponent', () => {
  let component: FormsDetailsComponent;
  let fixture: ComponentFixture<FormsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
