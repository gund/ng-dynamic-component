import { TestBed } from '@angular/core/testing';

import { IoService } from './io.service';

describe('Service: Io', () => {
  let service: IoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IoService],
    });
    service = TestBed.get(IoService);
  });

  it('should throw if init was not called', () => {
    expect(() => service.maybeUpdate()).toThrow();
  });

  it('should throw if `ComponentInjector` is set to null', () => {
    service.init(null);
    expect(() => service.maybeUpdate()).toThrow();
  });
});
