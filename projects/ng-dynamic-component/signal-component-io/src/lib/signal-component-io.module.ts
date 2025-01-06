import { NgModule } from '@angular/core';
import { ComponentIO } from 'ng-dynamic-component';
import { SignalComponentIO } from './signal-component-io';

/**
 * Enables signal based inputs/outputs support for dynamically rendered components.
 * Import once at the root of your application.
 * @public
 */
@NgModule({
  providers: [{ provide: ComponentIO, useClass: SignalComponentIO }],
})
export class SignalComponentIoModule {}
