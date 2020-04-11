import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-injector/component-outlet-injector.module';
import { DynamicIoDirective } from './dynamic-io.directive';

@NgModule({
  imports: [CommonModule],
  exports: [DynamicIoDirective, ComponentOutletInjectorModule],
  declarations: [DynamicIoDirective],
})
export class DynamicIoModule {}
