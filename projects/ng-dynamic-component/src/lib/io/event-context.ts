import { InjectionToken, StaticProvider } from '@angular/core';

/**
 * A token that holds custom context of the output handlers
 */
export const IoEventContextToken = new InjectionToken<unknown>(
  'IoEventContext',
);

/**
 * A token that holds provider for custom context of the output handlers
 * which should be provided using {@link IoEventContextToken} token
 */
export const IoEventContextProviderToken = new InjectionToken<StaticProvider>(
  'IoEventContextProvider',
);
