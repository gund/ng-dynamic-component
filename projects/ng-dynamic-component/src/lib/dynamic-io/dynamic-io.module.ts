import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-injector';
import { DynamicIoDirective } from './dynamic-io.directive';

@NgModule({
  imports: [CommonModule, ComponentOutletInjectorModule],
  exports: [DynamicIoDirective, ComponentOutletInjectorModule],
  declarations: [DynamicIoDirective],
})
export class DynamicIoModule {}
