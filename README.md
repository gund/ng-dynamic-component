# ng-dynamic-component

> Dynamic components with full life-cycle support for inputs and outputs

[![Travis CI](https://img.shields.io/travis/gund/ng-dynamic-component/master.svg?maxAge=2592000)](https://travis-ci.org/gund/ng-dynamic-component)
[![Appveyor](https://ci.appveyor.com/api/projects/status/qwfaor0nnt9l24nj/branch/master?svg=true)](https://ci.appveyor.com/project/gund/ng-dynamic-component/branch/master)
[![Coverage](https://codecov.io/gh/gund/ng-dynamic-component/branch/master/graph/badge.svg?token=BjOghV9KX8)](https://codecov.io/gh/gund/ng-dynamic-component)
[![Maintainability](https://api.codeclimate.com/v1/badges/df4884f0ef7b49c285d0/maintainability)](https://codeclimate.com/github/gund/ng-dynamic-component/maintainability)
[![Npm](https://img.shields.io/npm/v/ng-dynamic-component.svg?maxAge=2592000)](https://badge.fury.io/js/ng-dynamic-component)
[![Npm Downloads](https://img.shields.io/npm/dt/ng-dynamic-component.svg?maxAge=2592000)](https://www.npmjs.com/package/ng-dynamic-component)
[![Licence](https://img.shields.io/npm/l/ng-dynamic-component.svg?maxAge=2592000)](https://github.com/gund/ng-dynamic-component/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/gund/ng-dynamic-component.svg)](https://greenkeeper.io/)

<details>
  <summary>Compatibility with Angular</summary>

| Angular  | ng-dynamic-component | NPM package                    |
| -------- | -------------------- | ------------------------------ |
| >=14.1.3 | 10.3.1               | `ng-dynamic-component@^10.3.1` |
| >=14.x.x | 10.2.x               | `ng-dynamic-component@^10.2.0` |
| 13.x.x   | 10.1.x               | `ng-dynamic-component@~10.1.0` |
| 12.x.x   | 9.x.x                | `ng-dynamic-component@^9.0.0`  |
| 11.x.x   | 8.x.x                | `ng-dynamic-component@^8.0.0`  |
| 10.x.x   | 7.x.x                | `ng-dynamic-component@^7.0.0`  |
| 9.x.x    | 6.x.x                | `ng-dynamic-component@^6.0.0`  |
| 8.x.x    | 5.x.x                | `ng-dynamic-component@^5.0.0`  |
| 7.x.x    | 4.x.x                | `ng-dynamic-component@^4.0.0`  |
| 6.x.x    | 3.x.x                | `ng-dynamic-component@^3.0.0`  |
| 5.x.x    | 2.x.x                | `ng-dynamic-component@^2.0.0`  |
| 4.x.x    | 1.x.x                | `ng-dynamic-component@^1.0.0`  |
| 2.x.x    | 0.x.x                | `ng-dynamic-component@^0.0.0`  |

</details>

## Installation

```bash
$ npm install ng-dynamic-component --save
```

#### Error message in the IDE

If you have an error like **Can't bind to 'ndcDynamicInputs' since it isn't a known property of 'ndc-dynamic'** in your IDE, but the project compiles just fine, you might want to try installing the no-barrels version instead.

```bash
$ npm install --save ng-dynamic-component@no-barrels
```

## Usage

### DynamicComponent

Import `DynamicModule` where you need to render dynamic components:

```ts
import { DynamicModule } from 'ng-dynamic-component';

@NgModule({
  imports: [DynamicModule],
})
export class MyModule {}
```

Then in your component's template include `<ndc-dynamic>` where you want to render component
and bind from your component class type of component to render:

```ts
@Component({
  selector: 'my-component',
  template: ` <ndc-dynamic [ndcDynamicComponent]="component"></ndc-dynamic> `,
})
class MyComponent {
  component = Math.random() > 0.5 ? MyDynamicComponent1 : MyDynamicComponent2;
}
```

### NgComponentOutlet

You can also use [`NgComponentOutlet`](https://angular.io/api/common/NgComponentOutlet)
directive from `@angular/common` instead of `<ndc-dynamic>`.

Import `DynamicIoModule` where you need to render dynamic inputs:

```ts
import { DynamicIoModule } from 'ng-dynamic-component';

@NgModule({
  imports: [DynamicIoModule],
})
export class MyModule {}
```

Now apply `ndcDynamicInputs` and `ndcDynamicOutputs` to `ngComponentOutlet`:

```ts
@Component({
  selector: 'my-component',
  template: `<ng-template [ngComponentOutlet]="component"
                           [ndcDynamicInputs]="inputs"
                           [ndcDynamicOutputs]="outputs"
                           ></ng-template>`
})
class MyComponent {
  component = MyDynamicComponent1;
  inputs = {...};
  outputs = {...};
}
```

Also you can use `ngComponentOutlet` with `*` syntax:

```ts
@Component({
  selector: 'my-component',
  template: `<ng-container *ngComponentOutlet="component;
                            ndcDynamicInputs: inputs;
                            ndcDynamicOutputs: outputs"
                            ></ng-container>`
})
class MyComponent {
  component = MyDynamicComponent1;
  inputs = {...};
  outputs = {...};
}
```

### Inputs and Outputs

You can pass `inputs` and `outputs` to your dynamic components:

Import module `DynamicIoModule` and then in template:

```ts
@Component({
  selector: 'my-component',
  template: `
    <ndc-dynamic
      [ndcDynamicComponent]="component"
      [ndcDynamicInputs]="inputs"
      [ndcDynamicOutputs]="outputs"
    ></ndc-dynamic>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  inputs = {
    hello: 'world',
    something: () => 'can be really complex',
  };
  outputs = {
    onSomething: (type) => alert(type),
  };
}

@Component({
  selector: 'my-dynamic-component1',
  template: 'Dynamic Component 1',
})
class MyDynamicComponent1 {
  @Input()
  hello: string;
  @Input()
  something: Function;
  @Output()
  onSomething = new EventEmitter<string>();
}
```

Here you can update your inputs (ex. `inputs.hello = 'WORLD'`) and they will trigger standard Angular's life-cycle hooks
(of course you should consider which change detection strategy you are using).

#### Output template variables

**Since v6.1.0**

When you want to provide some values to your output handlers from template -
you can do so by supplying a special object to your output that has shape `{handler: fn, args: []}`:

```ts
@Component({
  selector: 'my-component',
  template: `
    <ndc-dynamic
      [ndcDynamicComponent]="component"
      [ndcDynamicOutputs]="{
        onSomething: { handler: doSomething, args: ['$event', tplVar] }
      }"
    ></ndc-dynamic>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  tplVar = 'some value';
  doSomething(event, tplValue) {}
}
```

Here you can specify at which argument event value should arrive via `'$event'` literal.

_HINT:_ You can override event literal by providing
[`IoEventArgumentToken`](projects/ng-dynamic-component/src/lib/io/event-argument.ts) in DI.

#### Output Handler Context

**Since v7.1.0**

You can specify the context (`this`) that will be used when calling
the output handlers by providing either:

- [`IoEventContextToken`](projects/ng-dynamic-component/src/lib/io/event-context.ts) - which will be;
  injected and used directly as a context value
- [`IoEventContextProviderToken`](projects/ng-dynamic-component/src/lib/io/event-context.ts) - which
  will be provided and instantiated within the `IoService` and used as a context value.  
  This useful if you have some generic way of retrieving a
  context for every dynamic component so you may encapsulate
  it in an Angular DI provider that will be instantiated
  within every component's injector;

Example using your component as an output context:

```ts
import { IoEventContextToken } from 'ng-dynamic-component';

@Component({
  selector: 'my-component',
  template: `
    <ndc-dynamic
      [ndcDynamicComponent]="component"
      [ndcDynamicOutputs]="{
        onSomething: doSomething
      }"
    ></ndc-dynamic>
  `,
  providers: [
    {
      provide: IoEventContextToken,
      useExisting: MyComponent,
    },
  ],
})
class MyComponent {
  component = MyDynamicComponent1;
  doSomething(event) {
    // Here `this` will be an instance of `MyComponent`
  }
}
```

### Component Creation Events

You can subscribe to component creation events, being passed a reference to the `ComponentRef`:

```ts
@Component({
  selector: 'my-component',
  template: `
    <ndc-dynamic
      [ndcDynamicComponent]="component"
      (ndcDynamicCreated)="componentCreated($event)"
    ></ndc-dynamic>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  componentCreated(compRef: ComponentRef<any>) {
    // utilize compRef in some way ...
  }
}
```

### Attributes

**Since v2.2.0** you can now declaratively set attributes, as you would inputs, via `ndcDynamicAttributes`.

Import module `DynamicAttributesModule` and then in template:

```ts
import { AttributesMap } from 'ng-dynamic-component';

@Component({
  selector: 'my-component',
  template: `
    <ndc-dynamic
      [ndcDynamicComponent]="component"
      [ndcDynamicAttributes]="attrs"
    ></ndc-dynamic>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  attrs: AttributesMap = {
    'my-attribute': 'attribute-value',
    class: 'some classes',
  };
}
```

Remember that attributes values are always strings (while inputs can be any value).
So to have better type safety you can use `AttributesMap` interface for your attributes maps.

Also you can use `ngComponentOutlet` and `ndcDynamicAttributes` with `*` syntax:

```ts
import { AttributesMap } from 'ng-dynamic-component';

@Component({
  selector: 'my-component',
  template: `
    <ng-container
      *ngComponentOutlet="component; ndcDynamicAttributes: attrs"
    ></ng-container>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  attrs: AttributesMap = {
    'my-attribute': 'attribute-value',
    class: 'some classes',
  };
}
```

### Directives (experimental)

**Since v3.1.0** you can now declaratively set directives, via `ndcDynamicDirectives`.

> **NOTE**:
> There is a known issue with OnChanges hook not beign triggered on dynamic directives
> since this part of functionality has been removed from the core as Angular now
> supports this out of the box for dynamic components.
>
> In dynamic directives queries like `@ContentChild` and host decorators like `@HostBinding`
> will not work due to involved complexity required to implement it (but PRs are welcome!).

Import module `DynamicDirectivesModule` and then in template:

```ts
import { dynamicDirectiveDef } from 'ng-dynamic-component';

@Component({
  selector: 'my-component',
  template: `
    <ng-container
      [ngComponentOutlet]="component"
      [ndcDynamicDirectives]="dirs"
    ></ng-container>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  dirs = [dynamicDirectiveDef(MyDirective)];
}
```

It's also possible to bind inputs and outputs to every dynamic directive:

```ts
import { dynamicDirectiveDef } from 'ng-dynamic-component';

@Component({
  selector: 'my-component',
  template: `
    <ng-container
      [ngComponentOutlet]="component"
      [ndcDynamicDirectives]="dirs"
    ></ng-container>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  directiveInputs = { prop1: 'value' };
  directiveOutputs = { output1: (evt) => this.doSomeStuff(evt) };
  dirs = [
    dynamicDirectiveDef(
      MyDirective,
      this.directiveInputs,
      this.directiveOutputs,
    ),
  ];
}
```

To change inputs, just update the object:

```ts
class MyComponent {
  updateDirectiveInput() {
    this.directiveInputs.prop1 = 'new value';
  }
}
```

You can have multiple directives applied to same dynamic component (only one directive by same type):

```ts
import { dynamicDirectiveDef } from 'ng-dynamic-component';

@Component({
  selector: 'my-component',
  template: `
    <ng-container
      [ngComponentOutlet]="component"
      [ndcDynamicDirectives]="dirs"
    ></ng-container>
  `,
})
class MyComponent {
  component = MyDynamicComponent1;
  dirs = [
    dynamicDirectiveDef(MyDirective1),
    dynamicDirectiveDef(MyDirective2),
    dynamicDirectiveDef(MyDirective3),
    dynamicDirectiveDef(MyDirective1), // This will be ignored because MyDirective1 already applied above
  ];
}
```

### Extra

You can have more advanced stuff over your dynamically rendered components like setting custom injector (`[ndcDynamicInjector]`)
or providing additional/overriding providers (`[ndcDynamicProviders]`) or both simultaneously
or projecting nodes (`[ndcDynamicContent]`).

NOTE: In practice functionality of this library is split in two pieces:

- one - component (`ndc-dynamic`) that is responsible for instantiating and rendering of dynamic components;
- two - directive (`ndcDynamic` also bound to `ndc-dynamic`) that is responsible for carrying inputs/outputs
  to/from dynamic component by the help of so called
  [`DynamicComponentInjector`](projects/ng-dynamic-component/src/lib/component-injector/token.ts).

Thanks to this separation you are able to connect inputs/outputs and life-cycle hooks to different mechanisms of injecting
dynamic components by implementing `DynamicComponentInjector` and providing it via
[`DynamicComponentInjectorToken`](projects/ng-dynamic-component/src/lib/component-injector/token.ts) in DI.

It was done to be able to reuse [`NgComponentOutlet`](https://github.com/angular/angular/commit/8578682) added in Angular 4-beta.3.

To see example of how to implement custom component injector - see
[`ComponentOutletInjectorDirective`](projects/ng-dynamic-component/src/lib/component-injector/component-outlet-injector.directive.ts)
that is used to integrate `NgComponentOutlet` directive with inputs/outputs.

## License

MIT © [Alex Malkevich](malkevich.alex@gmail.com)
