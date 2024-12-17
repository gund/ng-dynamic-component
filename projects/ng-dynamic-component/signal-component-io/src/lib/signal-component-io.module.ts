import { NgModule } from '@angular/core';
import { ComponentIO } from 'ng-dynamic-component';
import { SignalComponentIO } from './signal-component-io';

/**
 * @public
 * @experimental
 */
@NgModule({
  providers: [{ provide: ComponentIO, useClass: SignalComponentIO }],
})
export class SignalComponentIoModule {}
