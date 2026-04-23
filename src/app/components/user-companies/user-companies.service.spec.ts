import { TestBed } from '@angular/core/testing';

import { UserCompaniesService } from './user-companies.service';

describe('UserCompaniesService', () => {
  let service: UserCompaniesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserCompaniesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
