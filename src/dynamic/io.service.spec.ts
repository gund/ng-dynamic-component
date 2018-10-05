/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IoService } from './io.service';

describe('Service: Io', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IoService],
    });
  });

  it('should ...', inject([IoService], (service: IoService) => {
    expect(service).toBeTruthy();
  }));
});
