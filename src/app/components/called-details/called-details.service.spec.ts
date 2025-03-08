import { TestBed } from '@angular/core/testing';

import { CalledDetailsService } from './called-details.service';

describe('CalledDetailsService', () => {
  let service: CalledDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalledDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
