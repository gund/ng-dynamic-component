import * as partition from 'lodash.partition';
import { InputsType, OutputsType } from 'io.service';
import { Hashcache } from 'util';

const dynamicComponents:Hashcache<any, Map<any, IDynamicComponent>> =
  new Hashcache<any, Map<any, IDynamicComponent>>(() => new Map<any, IDynamicComponent>());
/**
 * A Decorator representing a dynamically generated component
 *
 * @param (K) groupType - dynamic components group
 * @param (V) compType - single component of a dynamic components group
 * @returns (ClassDecorator) - A Decorator for a dynamic component
 */
export function DynamicComp<K, V>(groupType:K, compType:V):ClassDecorator {
  return function(comp: Function): void {
    const [inputs, outputs] = extractInputOutputs(comp);

    dynamicComponents.get(groupType).set(compType, {
      type: comp,
      inputs: getComponentProperties(inputs),
      outputs: getComponentProperties(outputs),
    });
  };
}

/**
 * Given a properties definition for the dynamically generated components,
 * reutrns a dynamic component bound with its' Inputs and Outputs.
 *
 * @param (K) groupType
 * @param (V) compType
 * @param (PropDefinition) propDef - A dynamic-components-conatiner's binding definitions
 * @returns (IDynamicComponent) - A dynamically generated component with bindings
 */
export function getDynamicComponent<K, V>(groupType:K, compType:V, propDef:PropDefinition):IDynamicComponent {
  const comp: IDynamicComponent = Object.assign(
    {},
    dynamicComponents.get(groupType).get(compType),
  );
  comp.inputs = getComponentProperties(
    Object.keys(comp.inputs),
    propDef.inputs,
  );
  comp.outputs = getComponentProperties(
    Object.keys(comp.outputs),
    propDef.outputs,
  );
  return comp;
}

/**
 * Extracts the Inputs and Outputs definitions of a given dynamic component.
 * Angular's core lib PropDecorator (@Input, @Output, @ViewChild, etc..) defines a new property on the class instance,
 * called '__prop__metadata__', which holds all the @PropDefcorated properties.
 * This function supports inherited decorated properties (BaseCardComponent)
 *
 * The Set is being used for a special case:
 *  <-> A class that extends the base class WITHOUT defining new decorated properties,
 *      has the base class' decorated properties defined as its' own properties too
 *
 * @param (Function) comp
 * @returns (string[][]) - two dimensional array - 0:Inputs, 1:Outputs
 */
function extractInputOutputs(comp:Function):string[][] {
  const baseCompProps = (comp as any).__proto__.__prop__metadata__ || {};
  const compProps = (comp as any).__prop__metadata__;
  const propKeys: Set<string> = new Set<string>([
    ...Object.keys(baseCompProps),
    ...Object.keys(compProps),
  ]);

  return partition(Array.from(propKeys), key => {
    const prop = baseCompProps[key] || compProps[key];
    const propType: 'Input' | 'Output' = prop[0].__proto__.ngMetadataName;

    if (propType === 'Input') {
      return true;
    } else if (propType === 'Output') {
      return false;
    }
  });
}

/**
 * Given an array of property keys, generates an inputs/outputs object:
 * {
 *   key: key's value in the given properties definition
 * }
 *
 * Also being used to initialize the map on @DynamicComp definition with undefined values,
 * for the comp's decorated properties with default empty object
 *
 * @param (string[]) props
 * @param (any) propDefinitions - A dynamic-components-conatiner's binding definitions
 * @returns (any) - Bound inputs/outputs object for a dynamic component
 */
function getComponentProperties(props:string[], propDefinitions:any = {}):any {
  return props.reduce((prev, curr) => {
    prev[curr] = propDefinitions[curr];
    return prev;
  }, {});
}

export interface PropDefinition {
  inputs: InputsType;
  outputs: OutputsType;
}

export interface IDynamicComponent extends PropDefinition {
  type: Function;
}
