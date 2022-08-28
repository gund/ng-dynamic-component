export interface InputsType {
  [k: string]: unknown;
}
export interface OutputsType {
  [k: string]: OutputExpression | undefined;
}

export interface OutputWithArgs {
  handler: AnyFunction;
  args?: unknown[];
}

export type OutputExpression = EventHandler | OutputWithArgs;

export type EventHandler<T = unknown> = (event: T) => unknown;

export type AnyFunction = (...args: unknown[]) => unknown;
