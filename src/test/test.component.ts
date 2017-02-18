import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'test',
  template: ''
})
export class TestComponent { }

@Component({
  selector: 'injected',
  template: 'foo'
})
export class InjectedComponent { }

@Component({
  selector: 'another-injected',
  template: 'bar'
})
export class AnotherInjectedComponent { }

@NgModule({
  imports: [CommonModule],
  declarations: [InjectedComponent, AnotherInjectedComponent],
  exports: [InjectedComponent, AnotherInjectedComponent],
  entryComponents: [InjectedComponent, AnotherInjectedComponent]
})
export class TestModule { }
