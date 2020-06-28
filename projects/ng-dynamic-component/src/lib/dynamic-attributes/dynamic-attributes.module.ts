import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-injector';
import { DynamicAttributesDirective } from './dynamic-attributes.directive';

@NgModule({
  imports: [CommonModule],
  exports: [DynamicAttributesDirective, ComponentOutletInjectorModule],
  declarations: [DynamicAttributesDirective],
})
export class DynamicAttributesModule {}
