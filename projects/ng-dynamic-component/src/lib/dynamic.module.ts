import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicIoModule } from './dynamic-io';
import { DynamicComponent } from './dynamic.component';

@NgModule({
  imports: [CommonModule, DynamicIoModule],
  exports: [DynamicComponent, DynamicIoModule],
  declarations: [DynamicComponent],
})
export class DynamicModule {}
