import { InjectionToken } from '@angular/core';

export function defaultEventArgumentFactory() {
  return '$event';
}

export const EventArgumentToken = new InjectionToken<string>('EventArgument', {
  providedIn: 'root',
  factory: defaultEventArgumentFactory,
});
