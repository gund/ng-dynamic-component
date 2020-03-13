import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicAttributesDirective } from './dynamic-attributes.directive';

@NgModule({
  imports: [CommonModule],
  exports: [DynamicAttributesDirective],
  declarations: [DynamicAttributesDirective],
})
export class DynamicAttributesModule {}
