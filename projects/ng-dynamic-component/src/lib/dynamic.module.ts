import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicIoModule } from './dynamic-io';
import { DynamicComponent } from './dynamic.component';

/**
 * @public
 */
@NgModule({
  imports: [DynamicIoModule, DynamicComponent],
  exports: [DynamicIoModule, DynamicComponent],
})
export class DynamicModule {}
