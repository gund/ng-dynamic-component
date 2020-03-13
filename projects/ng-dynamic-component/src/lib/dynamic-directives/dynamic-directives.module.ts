import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicDirectivesDirective } from './dynamic-directives.directive';

@NgModule({
  imports: [CommonModule],
  exports: [DynamicDirectivesDirective],
  declarations: [DynamicDirectivesDirective],
})
export class DynamicDirectivesModule {}
