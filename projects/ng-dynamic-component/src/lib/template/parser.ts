import { OutputWithArgs } from '../io';
import {
  TemplateToken,
  TemplateTokenAssignment,
  TemplateTokenComma,
  TemplateTokenInputPropBindingClose,
  TemplateTokenInputPropBindingOpen,
  TemplateTokeniser,
  TemplateTokenOutputBindingClose,
  TemplateTokenOutputBindingOpen,
  TemplateTokenString,
  TemplateTokenMap,
} from './tokeniser';

enum TemplateParserState {
  Idle,
  InInput,
  InOutput,
  InValue,
  InArgs,
}

export class TemplateParser {
  constructor(
    protected tokeniser: TemplateTokeniser,
    protected component: Record<string, unknown>,
    protected tokenMap = TemplateTokenMap,
  ) {}

  async getIo() {
    const io: Record<string, unknown> = {};

    let state = TemplateParserState.Idle;
    let lastState = TemplateParserState.Idle;
    let ioBinding = '';

    for await (const token of this.tokeniser) {
      if (token instanceof TemplateTokenInputPropBindingOpen) {
        if (state !== TemplateParserState.Idle) {
          throw new TemplateParserError('Unexpected input binding', token);
        }

        state = TemplateParserState.InInput;
        ioBinding += this.tokenMap.InputPropBindingOpen;
        continue;
      } else if (token instanceof TemplateTokenInputPropBindingClose) {
        if (state !== TemplateParserState.InInput) {
          throw new TemplateParserError(
            'Unexpected input binding closing',
            token,
          );
        }

        ioBinding += this.tokenMap.InputPropBindingClose;
        io[ioBinding] = undefined;
        continue;
      } else if (token instanceof TemplateTokenOutputBindingOpen) {
        if (
          state !== TemplateParserState.Idle &&
          state !== TemplateParserState.InOutput
        ) {
          throw new TemplateParserError('Unexpected output binding', token);
        }

        if (state === TemplateParserState.InOutput) {
          state = TemplateParserState.InArgs;
        } else {
          state = TemplateParserState.InOutput;
          ioBinding += this.tokenMap.OutputBindingOpen;
        }

        continue;
      } else if (token instanceof TemplateTokenOutputBindingClose) {
        if (
          state !== TemplateParserState.InOutput &&
          state !== TemplateParserState.InArgs
        ) {
          throw new TemplateParserError(
            'Unexpected output binding closing',
            token,
          );
        }

        if (state === TemplateParserState.InArgs) {
          state = TemplateParserState.Idle;
          ioBinding = '';
        } else {
          ioBinding += this.tokenMap.OutputBindingClose;
          io[ioBinding] = undefined;
        }

        continue;
      } else if (token instanceof TemplateTokenAssignment) {
        if (
          state !== TemplateParserState.InInput &&
          (state as any) !== TemplateParserState.InOutput
        ) {
          throw new TemplateParserError('Unexpected assignment', token);
        }

        lastState = state;
        state = TemplateParserState.InValue;
        continue;
      } else if (token instanceof TemplateTokenString) {
        if (
          state === TemplateParserState.InInput ||
          state === TemplateParserState.InOutput
        ) {
          ioBinding += token.string;
          continue;
        } else if (state === TemplateParserState.InValue) {
          if (lastState === TemplateParserState.InInput) {
            delete io[ioBinding];
            Object.defineProperty(io, ioBinding, {
              enumerable: true,
              configurable: true,
              get: () => this.component[token.string],
            });
            state = lastState = TemplateParserState.Idle;
            ioBinding = '';
            continue;
          } else if (lastState === TemplateParserState.InOutput) {
            const handler = () => this.component[token.string] as any;
            io[ioBinding] = {
              get handler() {
                return handler();
              },
              args: [],
            } as OutputWithArgs;
            state = TemplateParserState.InOutput;
            lastState = TemplateParserState.Idle;
            continue;
          }

          throw new TemplateParserError('Unexpected identifier', token);
        } else if (state === TemplateParserState.InArgs) {
          (io[ioBinding] as OutputWithArgs).args!.push(token.string);
          continue;
        } else if (state === TemplateParserState.Idle) {
          state = TemplateParserState.InInput;
          ioBinding = token.string;
          io[ioBinding] = undefined;
          continue;
        }

        throw new TemplateParserError('Unexpected identifier', token);
      } else if (token instanceof TemplateTokenComma) {
        if (state !== TemplateParserState.InArgs) {
          throw new TemplateParserError('Unexpected comma', token);
        }
        continue;
      }

      throw new TemplateParserError('Unexpected token', token);
    }

    return io;
  }
}

export class TemplateParserError extends Error {
  constructor(reason: string, token: TemplateToken) {
    super(
      `${reason} ${token.constructor.name}` +
        ` at (${token.start}:${token.end})` +
        `\n${JSON.stringify(token, null, 2)}`,
    );
  }
}
