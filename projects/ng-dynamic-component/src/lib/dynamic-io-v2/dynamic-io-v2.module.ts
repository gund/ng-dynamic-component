import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorModule } from '../component-outlet';
import { DynamicIoV2Directive } from './dynamic-io-v2.directive';

/**
 * @public
 */
@NgModule({
  imports: [CommonModule],
  exports: [DynamicIoV2Directive, ComponentOutletInjectorModule],
  declarations: [DynamicIoV2Directive],
})
export class DynamicIoV2Module {}
