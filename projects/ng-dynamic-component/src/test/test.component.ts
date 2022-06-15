/* eslint-disable @angular-eslint/component-selector, @angular-eslint/no-input-rename, @angular-eslint/no-output-rename */
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgModule,
} from '@angular/core';

@Component({
  selector: 'test',
  template: '',
})
export class TestComponent {}

@Component({
  selector: 'injected',
  template: 'foo',
})
export class InjectedComponent {}

@Component({
  selector: 'another-injected',
  template: 'bar',
})
export class AnotherInjectedComponent {}

@Component({
  selector: 'test-bindings',
  template: 'baz',
})
export class InjectedBoundComponent {
  @Input('outerProp')
  innerProp: any;
  @Output('outerEvt')
  innerEvt = new EventEmitter<any>();
}

@NgModule({
  imports: [CommonModule],
  declarations: [
    InjectedComponent,
    AnotherInjectedComponent,
    InjectedBoundComponent,
  ],
  exports: [
    InjectedComponent,
    AnotherInjectedComponent,
    InjectedBoundComponent,
  ],
})
export class TestModule {}
