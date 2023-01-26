import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-outlet';
import { DynamicIoDirective } from './dynamic-io.directive';

/**
 * @public
 */
@NgModule({
  imports: [CommonModule],
  exports: [DynamicIoDirective, ComponentOutletInjectorModule],
  declarations: [DynamicIoDirective],
})
export class DynamicIoModule {}
