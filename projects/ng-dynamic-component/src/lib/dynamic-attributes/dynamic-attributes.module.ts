import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-outlet';
import { DynamicAttributesDirective } from './dynamic-attributes.directive';

/**
 * @public
 */
@NgModule({
  imports: [DynamicAttributesDirective],
  exports: [DynamicAttributesDirective, ComponentOutletInjectorModule],
})
export class DynamicAttributesModule {}
