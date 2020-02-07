import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';

import { COMPONENT_INJECTOR, ComponentInjector } from './component-injector';
import { ComponentOutletInjectorDirective } from './component-outlet-injector.directive';
import { DynamicAttributesDirective } from './dynamic-attributes.directive';
import { DynamicDirectivesDirective } from './dynamic-directives.directive';
import { DynamicComponent } from './dynamic.component';
import { DynamicDirective } from './dynamic.directive';
import { IoFactoryService } from './io-factory.service';
import { WINDOW_REF, WindowRefService } from './window-ref.service';

export function windowRefFactory() {
  return window;
}

@NgModule({
  imports: [CommonModule],
  declarations: [
    DynamicComponent,
    DynamicDirective,
    ComponentOutletInjectorDirective,
    DynamicAttributesDirective,
    DynamicDirectivesDirective,
  ],
  exports: [
    DynamicComponent,
    DynamicDirective,
    ComponentOutletInjectorDirective,
    DynamicAttributesDirective,
    DynamicDirectivesDirective,
  ],
})
export class DynamicModule {
  static forRoot(
    componentInjector: Type<ComponentInjector> = DynamicComponent,
  ): ModuleWithProviders<DynamicModule> {
    return {
      ngModule: DynamicModule,
      providers: [
        { provide: COMPONENT_INJECTOR, useValue: componentInjector },
        IoFactoryService,
        { provide: WINDOW_REF, useFactory: windowRefFactory },
        WindowRefService,
      ],
    };
  }

  /**
   * @deprecated Since v6.0.0 - Passing a list of components is no longer required. Use `DynamicModule.forRoot()` instead.
   */
  static withComponents(
    components: Type<any>[],
    componentInjector: Type<ComponentInjector> = DynamicComponent,
  ): ModuleWithProviders<DynamicModule> {
    return DynamicModule.forRoot(componentInjector);
  }
}
