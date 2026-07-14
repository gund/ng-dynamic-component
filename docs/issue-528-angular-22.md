# Bug Details / Control Document — Issue #528

## Issue

- **Title**: [Bug] Support for Angular 22
- **Link**: https://github.com/gund/ng-dynamic-component/issues/528
- **Reporter**: Jrubzjeknf

## Reproduction

- **StackBlitz**: https://stackblitz.com/~/github.com/Jrubzjeknf/dynamic-component-with-angular-22
- **GitHub repo**: https://github.com/Jrubzjeknf/dynamic-component-with-angular-22
- **Local clone**: `/tmp/opencode/repro-528-manual`

## Environment

| Package | Version |
|---------|---------|
| Angular | 22.0.6 |
| ng-dynamic-component | 10.8.2 |
| TypeScript | ~6.0.2 |

## Reproduction Steps

1. Create Angular 22 CLI project (TypeScript ~6.0.2)
2. Install `ng-dynamic-component@10.8.2`
3. Import `DynamicComponent` and `DynamicIoDirective`
4. Use `<ndc-dynamic>` with `[ndcDynamicInputs]`:
   ```html
   <ndc-dynamic [ndcDynamicComponent]="testComponent" [ndcDynamicInputs]="{ name: 'Alex' }">
   ```
5. Run application

## Observed Failure

```
ASSERTION ERROR: token must be defined [Expected=> null != undefined <=Actual]
```
at `NodeInjectorFactory.IoService_Factory`

The component fails to render; dynamic input binding is broken.

## Root Cause

Angular 22.0.6 no longer exports `ComponentFactoryResolver` at runtime. The original `IoService` constructor injected `ComponentFactoryResolver` as a required dependency. Because the token is not exported by Angular 22's runtime, injecting or referencing it from `IoService` causes an Angular DI/runtime failure (`ASSERTION ERROR: token must be defined`) before dynamic component rendering can proceed.

`IoService` only uses `ComponentFactoryResolver` to resolve output alias mapping (`compFactory.outputs`). Input binding already relies on `ComponentRef.setInput`, which works independently.

## Fix

**File changed**: `projects/ng-dynamic-component/src/lib/io/io.service.ts`

1. Remove all runtime `ComponentFactoryResolver`/`ComponentFactory` imports, injections, and references — Angular 22 no longer exports the token at runtime, so any runtime import/injection/reference to it will fail
2. Use Angular's public `reflectComponentType(componentType)?.outputs` to obtain output alias mapping directly as `{ propName, templateName }` objects, eliminating the need to parse private `ɵcmp.outputs` tuple metadata

No lazy CFR fallback: all `ComponentFactoryResolver`/`ComponentFactory` usage is removed.

## Validation Criteria

| Check | Status |
|-------|--------|
| No dependency upgrades | ✅ Passed — no version changes detected |
| CFR not in constructor DI | ✅ Passed — `ComponentFactoryResolver` removed from constructor entirely |
| CFR not referenced at runtime | ✅ Passed — zero matches for `ComponentFactoryResolver`, `ComponentFactory`, `tryGetCFR`, or `resolveComponentFactory` in `io.service.ts` |
| Input binding renders | ✅ Passed — `ComponentRef.setInput` works; input binding tests pass |
| Output alias mapping works | ✅ Passed — `reflectComponentType(componentType)?.outputs` used for `{ propName, templateName }` mappings; previously failing renamed-output tests (`output3Renamed` → `output3`) now pass |
| Test suite passes | ✅ Passed — `npm test -- --watch=false`: 12 suites, 99 tests passed, 4 skipped |
| `npm run build` | ✅ Passed — build succeeded after updating `goldens/ng-dynamic-component/api.md` for expected `IoService` constructor signature change |
| Browser/manual repro | ⛔ Blocked — Chrome/browser dependencies missing in this container |
