import { TestBed } from '@angular/core/testing';

import { DepartmetsService } from './departmets.service';

describe('DepartmetsService', () => {
  let service: DepartmetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
