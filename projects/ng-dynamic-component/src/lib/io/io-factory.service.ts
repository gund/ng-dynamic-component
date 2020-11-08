import { Injectable, Injector } from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { IoService, IoServiceOptions, IoServiceProvider } from './io.service';

export interface IoFactoryServiceOptions {
  injector?: Injector;
}

@Injectable({ providedIn: 'root' })
export class IoFactoryService {
  constructor(private injector: Injector) {}

  create(
    componentInjector: DynamicComponentInjector,
    ioOptions?: IoServiceOptions & IoFactoryServiceOptions,
  ) {
    const ioInjector = Injector.create({
      name: 'IoInjector',
      parent: ioOptions?.injector ?? this.injector,
      providers: [
        IoServiceProvider,
        { provide: DynamicComponentInjectorToken, useValue: componentInjector },
        ioOptions
          ? { provide: IoServiceOptions, useValue: ioOptions }
          : undefined,
      ],
    });

    return ioInjector.get(IoService);
  }
}
