export interface InputsType {
  [k: string]: any;
}
export interface OutputsType {
  [k: string]: OutputExpression | undefined;
}

export interface OutputWithArgs {
  handler: AnyFunction;
  args?: any[];
}

export type OutputExpression = EventHandler | OutputWithArgs;

export type EventHandler<T = any> = (event: T) => any;

export type AnyFunction = (...args: any[]) => any;
