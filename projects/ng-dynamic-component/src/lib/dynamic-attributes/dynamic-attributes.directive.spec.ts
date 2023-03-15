/* eslint-disable @angular-eslint/component-selector */
import { Component, Type } from '@angular/core';
import { TestFixture, TestSetup } from '../../test';
import { ComponentOutletInjectorDirective } from '../component-outlet';
import { DynamicComponent } from '../dynamic.component';
import {
  AttributesMap,
  DynamicAttributesDirective,
} from './dynamic-attributes.directive';

describe('DynamicAttributesDirective', () => {
  @Component({ selector: 'dynamic', template: `` })
  class Dynamic1Component {}

  @Component({
    selector: 'host',
    template: `
      <ng-container
        [ngComponentOutlet]="component"
        [ndcDynamicAttributes]="attrs"
      ></ng-container>
    `,
  })
  class HostComponent {
    component?: Type<any> | null;
    attrs?: AttributesMap | null;
  }

  class DynamicTestFixture<THost> extends TestFixture<THost> {
    getDynamicElem() {
      return this.getComponentElement(Dynamic1Component)!;
    }
  }

  const testSetup = new TestSetup(HostComponent, {
    props: { component: Dynamic1Component },
    ngModule: {
      imports: [DynamicAttributesDirective, ComponentOutletInjectorDirective],
      declarations: [Dynamic1Component],
    },
    fixtureCtor: DynamicTestFixture,
  });

  it('should set attrs on injected component', async () => {
    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    const fixture = await testSetup.redner({ props: { attrs } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });
  });

  it('should not do anything if attrs are not defined', async () => {
    const fixture = await testSetup.redner({ props: { attrs: null } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({});
  });

  it('should set attrs if they were not set initially', async () => {
    const fixture = await testSetup.redner({ props: { attrs: null } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({});

    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    fixture.setHostProps({ attrs });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });
  });

  it('should replace attrs if new object set', async () => {
    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    const fixture = await testSetup.redner({ props: { attrs } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });

    const attrs2 = { 'attr-trhee': 'val3' };

    fixture.setHostProps({ attrs: attrs2 });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-trhee': 'val3',
    });
  });

  it('should unset attrs if set to null/undefined', async () => {
    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    const fixture = await testSetup.redner({ props: { attrs } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });

    fixture.setHostProps({ attrs: null });

    expect(fixture.getDynamicElem().attributes).toMatchObject({});
  });

  it('should add new attr if added to object', async () => {
    const attrs: Record<string, any> = {
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    };

    const fixture = await testSetup.redner({ props: { attrs } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });

    attrs['attr-three'] = 'val-three';

    fixture.detectChanges();

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
      'attr-three': 'val-three',
    });
  });

  it('should remove attr if removed from object', async () => {
    const attrs: Record<string, any> = {
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    };

    const fixture = await testSetup.redner({ props: { attrs } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });

    delete attrs['attr-one'];

    fixture.detectChanges();

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-two': 'val-two',
    });
  });

  it('should update attr if updated in object', async () => {
    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    const fixture = await testSetup.redner({ props: { attrs } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });

    attrs['attr-two'] = 'new-val';

    fixture.detectChanges();

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'new-val',
    });
  });

  it('should reassign attrs when new component injected', async () => {
    @Component({ selector: 'dynamic2', template: `` })
    class Dynamic2Component {}

    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    const fixture = await testSetup.redner({
      props: { attrs },
      ngModule: { declarations: [Dynamic2Component] },
    });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });

    fixture.setHostProps({ component: Dynamic2Component });

    expect(
      fixture.getComponentElement(Dynamic2Component)?.attributes,
    ).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });
  });

  it('should do nothing without injected component', async () => {
    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    await expect(
      testSetup.redner({ props: { attrs, component: null } }),
    ).resolves.not.toThrow();
  });

  it('should do nothing when injected component removed', async () => {
    const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

    const fixture = await testSetup.redner({ props: { attrs } });

    expect(fixture.getDynamicElem().attributes).toMatchObject({
      'attr-one': 'val-1',
      'attr-two': 'val-two',
    });

    expect(() => fixture.setHostProps({ component: null })).not.toThrow();
  });

  describe('integration', () => {
    it('should work with `ngComponentOutlet` * syntax', async () => {
      const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

      const fixture = await testSetup.redner({
        props: { attrs },
        template: `
          <ng-container
            *ngComponentOutlet="component; ndcDynamicAttributes: attrs"
          ></ng-container>
      `,
      });

      expect(fixture.getDynamicElem().attributes).toMatchObject({
        'attr-one': 'val-1',
        'attr-two': 'val-two',
      });
    });

    it('should work with `ndc-dynamic`', async () => {
      const attrs = { 'attr-one': 'val-1', 'attr-two': 'val-two' };

      const fixture = await testSetup.redner({
        props: { attrs },
        template: `
          <ndc-dynamic
            [ndcDynamicComponent]="component"
            [ndcDynamicAttributes]="attrs"
          ></ndc-dynamic>
      `,
        ngModule: { imports: [DynamicComponent] },
      });

      expect(fixture.getDynamicElem().attributes).toMatchObject({
        'attr-one': 'val-1',
        'attr-two': 'val-two',
      });
    });
  });
});
