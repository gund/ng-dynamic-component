import { ChangeDetectorRef } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';

import { IoFactoryService } from './io-factory.service';

describe('Service: IoFactory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IoFactoryService,
        { provide: ChangeDetectorRef, useValue: {} },
      ],
    });
  });

  it('should ...', inject([IoFactoryService], (service: IoFactoryService) => {
    expect(service).toBeTruthy();
  }));
});
