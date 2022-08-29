import { Injectable, Injector, StaticProvider } from '@angular/core';

import {
  DynamicComponentInjector,
  DynamicComponentInjectorToken,
} from '../component-injector';
import { IoService, IoServiceOptions } from './io.service';

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
    const providers: StaticProvider[] = [
      { provide: IoService, useClass: IoService },
      { provide: DynamicComponentInjectorToken, useValue: componentInjector },
    ];

    if (ioOptions) {
      providers.push({ provide: IoServiceOptions, useValue: ioOptions });
    }

    const ioInjector = Injector.create({
      name: 'IoInjector',
      parent: ioOptions?.injector ?? this.injector,
      providers,
    });

    return ioInjector.get(IoService);
  }
}
