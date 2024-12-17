# ng-dynamic-component/signal-component-io

> Secondary entry point of `ng-dynamic-component`. It can be used by importing from `ng-dynamic-component/signal-component-io`.

This package enables signal based inputs/outputs support for dynamically rendered components.

## Prerequisites

This package requires Angular version which supports signals.
Please refer to (Angular docs)[https://angular.dev/] to see which minimal version is required.

## Warning: Experimental

This package is still **experimental** and not ready for producation!  
APIs may change in the future or be removed completely and never make it to stable release!  
Only use it to evaluate the features and provide feedback.

## Usage

**Since v10.8.0**

Import `SignalComponentIoModule` in your application module or config:

```ts
import { NgModule } from '@angular/core';
import { SignalComponentIoModule } from 'ng-dynamic-component/signal-component-io';

@NgModule({
  imports: [SignalComponentIoModule],
})
class AppModule {}
```

Now you can render dynamic components with signal based inputs/outputs!
