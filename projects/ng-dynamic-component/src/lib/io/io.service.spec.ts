import { ChangeDetectorRef, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DynamicComponentInjectorToken } from '../component-injector/token';
import { IoService } from './io.service';

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
        {
          provide: ChangeDetectorRef,
          useValue: 'ChangeDetectorRefMock',
        },
      ],
    });
    service = TestBed.inject(IoService);
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
        providers: [{ provide: IoService, useClass: IoService }],
      });

      expect(injectorWithoutProvider.get(IoService)).toBe(service);
      expect(injectorWithProvider.get(IoService)).not.toBe(service);
      expect(injectorWithProvider.get(IoService)).toBeInstanceOf(IoService);
    });
  });
});
