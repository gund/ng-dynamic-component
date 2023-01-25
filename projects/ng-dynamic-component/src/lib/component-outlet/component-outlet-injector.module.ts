import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { ComponentOutletIoDirective } from './component-outlet-io.directive';

/**
 * @public
 */
@NgModule({
  imports: [CommonModule],
  exports: [ComponentOutletInjectorDirective, ComponentOutletIoDirective],
  declarations: [ComponentOutletInjectorDirective, ComponentOutletIoDirective],
})
export class ComponentOutletInjectorModule {}
