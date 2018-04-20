import { CommonModule } from '@angular/common';
import {
  ANALYZE_FOR_ENTRY_COMPONENTS,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { DynamicComponent } from './dynamic.component';
import { DynamicDirective } from './dynamic.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    DynamicComponent,
    DynamicDirective,
    ComponentOutletInjectorDirective,
  ],
  exports: [
    DynamicComponent,
    DynamicDirective,
    ComponentOutletInjectorDirective,
  ],
})
export class DynamicModule {
  static withComponents(
    components: Type<any>[],
    componentInjector: Type<ComponentInjector> = DynamicComponent,
  ): ModuleWithProviders {
    return {
      ngModule: DynamicModule,
      providers: [
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          useValue: components,
          multi: true,
        },
        { provide: COMPONENT_INJECTOR, useValue: componentInjector },
      ],
    };
  }
}
