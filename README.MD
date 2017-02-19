# ng-dynamic-component

> Dynamic components with full life-cycle support for inputs and outputs

[![Travis CI](https://img.shields.io/travis/gund/ng-dynamic-component/master.svg?maxAge=2592000)](https://travis-ci.org/gund/ng-dynamic-component)
[![Coverage](https://img.shields.io/codecov/c/github/gund/ng-dynamic-component.svg?maxAge=2592000)](https://codecov.io/gh/gund/ng-dynamic-component)
[![Npm](https://img.shields.io/npm/v/ng-dynamic-component.svg?maxAge=2592000)](https://badge.fury.io/js/ng-dynamic-component)
[![Npm Downloads](https://img.shields.io/npm/dt/ng-dynamic-component.svg?maxAge=2592000)](https://www.npmjs.com/package/ng-dynamic-component)
[![Licence](https://img.shields.io/npm/l/ng-dynamic-component.svg?maxAge=2592000)](https://github.com/gund/ng-dynamic-component/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Installation

```bash
$ npm install ng-dynamic-component --save
```

## Usage

Import `DynamicModue` with dynamic components you want to insert later:
```ts
import { DynamicModue } from 'ng-dynamic-component';
import { MyDynamicComponent1, MyDynamicComponent2 } from './my-components';

@NgModule({
  imports: [
    DynamicModule.withComponents([MyDynamicComponent1, MyDynamicComponent2])
  ]
})
```

Then in your component's template include `<ndc-dynamic>` where you want to render component
and bind from your component class type of component to render:
```ts
@Component({
  selector: 'my-component',
  template: `<ndc-dynamic [ndcDynamicComponent]="component"></ndc-dynamic>`
})
class MyComponent {
  component = Math.random() > 0.5 ? MyDynamicComponent1 : MyDynamicComponent2;
}
```

You can also pass `inputs` and `outputs` to your dynamic components:
```ts
@Component({
  selector: 'my-component',
  template: `<ndc-dynamic [ndcDynamicComponent]="component"
                          [ndcDynamicInputs]="inputs"
                          [ndcDynamicOutputs]="outputs"
                          ></ndc-dynamic>`
})
class MyComponent {
  component = MyDynamicComponent1;
  inputs = {
    hello: 'world',
    something: () => 'can be really complex'
  };
  outputs = {
    onSomething: (type) => alert(type)
  }
}
```
Here you can update your inputs (ex. `inputs.hello = 'WORLD'`) and they will trigger standard Angular's life-cycle hooks
(of course you should consider which change detection strategy you are using).

You can have more advanced stuff over your dynamically rendered components like setting custom injector (`[ndcDynamicInjector]`)
or providing additional/overriding providers (`[ndcDynamicProviders]`) or both simultaneously
or projecting nodes (`[ndcDynamicContent]`).

NOTE: In practice funtionality of this library is splitted in two pieces:
* one - component (`ndc-dynamic`) that is responsible for instantianting and rendering of dynamic components;
* two - directive (`ndcDynamic` also bound to `ndc-dynamic`) that is responsible for carrying inputs/outputs
to/from dynamic component by the help of so called `ComponentInjector` (it is `ndc-dynamic` by default).

Thanks to this separation you are able to connect inputs/outputs and life-cycle hooks to different mechanisms of injecting
dynamic components by implementing `ComponentInjector` and providing it via `DynamicModule.withComponents(null, [here])` in second argument.

It was done to be able to reuse [`NgComponentOutlet`](https://github.com/angular/angular/commit/8578682) added in Angular 4-beta.3.
> Due to update of implementation angular team hide `componentRef` by making it private so extending of that directive and
exposing `componentRef` to be public will be necessary but this will be done in this library.

## License

MIT © [Alex Malkevich](malkevich.alex@gmail.com)
