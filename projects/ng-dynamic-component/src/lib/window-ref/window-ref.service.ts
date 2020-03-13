import { Injectable, InjectionToken, Injector } from '@angular/core';

import { browserWindowFactory } from './window-ref-browser';

export const WindowRefToken = new InjectionToken<Window>('WindowRef', {
  providedIn: 'root',
  factory: browserWindowFactory,
});

@Injectable({ providedIn: 'root' })
export class WindowRefService {
  nativeWindow = this.injector.get(WindowRefToken, null);

  constructor(private injector: Injector) {}
}
