import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DynamicComponentInjectorToken } from '../component-injector/token';
import { IoService, IoServiceProvider } from './io.service';

describe('Service: Io', () => {
  let service: IoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IoService,
        {
          provide: DynamicComponentInjectorToken,
          useValue: 'component-injector-mock',
        },
      ],
    });
    service = TestBed.inject(IoService);
  });

  it('should be instantiated', () => {
    expect(service).toBeInstanceOf(IoService);
  });

  describe('provider', () => {
    it('should create new instance in injector', () => {
      const rootInjector = TestBed.inject(Injector);

      const injectorWithoutProvider = Injector.create({
        name: 'WithoutProvider',
        parent: rootInjector,
        providers: [],
      });

      const injectorWithProvider = Injector.create({
        name: 'WithProvider',
        parent: rootInjector,
        providers: [IoServiceProvider],
      });

      expect(injectorWithoutProvider.get(IoService)).toBe(service);
      expect(injectorWithProvider.get(IoService)).not.toBe(service);
      expect(injectorWithProvider.get(IoService)).toBeInstanceOf(IoService);
    });
  });
});
