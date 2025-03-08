import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersCompanieDepsComponent } from './users-companie-deps.component';

describe('UsersCompanieDepsComponent', () => {
  let component: UsersCompanieDepsComponent;
  let fixture: ComponentFixture<UsersCompanieDepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersCompanieDepsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersCompanieDepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
