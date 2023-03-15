import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-outlet';
import { DynamicIoDirective } from './dynamic-io.directive';

/**
 * @public
 */
@NgModule({
  imports: [DynamicIoDirective],
  exports: [DynamicIoDirective, ComponentOutletInjectorModule],
})
export class DynamicIoModule {}
