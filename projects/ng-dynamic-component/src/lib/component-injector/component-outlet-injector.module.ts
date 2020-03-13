import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';

@NgModule({
  imports: [CommonModule],
  exports: [ComponentOutletInjectorDirective],
  declarations: [ComponentOutletInjectorDirective],
})
export class ComponentOutletInjectorModule {}
