import { TestBed } from '@angular/core/testing';

import { CalledsService } from './calleds.service';

describe('CalledsService', () => {
  let service: CalledsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalledsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
