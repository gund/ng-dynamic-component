import { NgModule } from '@angular/core';

import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { ComponentOutletIoDirective } from './component-outlet-io.directive';

/**
 * @public
 */
@NgModule({
  imports: [ComponentOutletInjectorDirective, ComponentOutletIoDirective],
  exports: [ComponentOutletInjectorDirective, ComponentOutletIoDirective],
})
export class ComponentOutletInjectorModule {}
