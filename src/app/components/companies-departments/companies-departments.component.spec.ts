import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesDepartmentsComponent } from './companies-departments.component';

describe('CompaniesDepartmentsComponent', () => {
  let component: CompaniesDepartmentsComponent;
  let fixture: ComponentFixture<CompaniesDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompaniesDepartmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompaniesDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
