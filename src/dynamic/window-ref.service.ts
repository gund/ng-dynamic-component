import { Injectable, InjectionToken, Injector } from '@angular/core';

export const WINDOW_REF = new InjectionToken<Window>('WindowRef');

@Injectable()
export class WindowRefService {
  nativeWindow = this.injector.get(WINDOW_REF, null);

  constructor(private injector: Injector) {}
}
