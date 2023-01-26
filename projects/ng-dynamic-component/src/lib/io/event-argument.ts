import { InjectionToken } from '@angular/core';

/**
 * @public
 */
export function defaultEventArgumentFactory() {
  return '$event';
}

/**
 * @public
 */
export const IoEventArgumentToken = new InjectionToken<string>(
  'EventArgument',
  {
    providedIn: 'root',
    factory: defaultEventArgumentFactory,
  },
);

/**
 * @public
 * @deprecated Since v10.4.0 - Use {@link IoEventArgumentToken} instead!
 */
export const EventArgumentToken = IoEventArgumentToken;
