import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicComponent } from './dynamic.component';

@NgModule({
  imports: [CommonModule],
  exports: [DynamicComponent],
  declarations: [DynamicComponent],
})
export class DynamicComponentModule {}
