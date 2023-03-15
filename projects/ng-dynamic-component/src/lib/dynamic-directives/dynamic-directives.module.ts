import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-outlet';
import { DynamicDirectivesDirective } from './dynamic-directives.directive';

/**
 * @public
 */
@NgModule({
  imports: [DynamicDirectivesDirective],
  exports: [DynamicDirectivesDirective, ComponentOutletInjectorModule],
})
export class DynamicDirectivesModule {}
