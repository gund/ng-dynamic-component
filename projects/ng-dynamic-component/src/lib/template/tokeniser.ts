export class TemplateToken {
  constructor(public start: number, public end: number) {}
}

export class TemplateTokenString extends TemplateToken {
  constructor(public string: string, start: number, end: number) {
    super(start, end);
  }
}
export class TemplateTokenAssignment extends TemplateToken {}
export class TemplateTokenComma extends TemplateToken {}
export class TemplateTokenInputPropBindingOpen extends TemplateToken {}
export class TemplateTokenInputPropBindingClose extends TemplateToken {}
export class TemplateTokenOutputBindingOpen extends TemplateToken {}
export class TemplateTokenOutputBindingClose extends TemplateToken {}

export enum TemplateTokenMap {
  Space = ' ',
  Assignment = '=',
  Comma = ',',
  InputPropBindingOpen = '[',
  InputPropBindingClose = ']',
  OutputBindingOpen = '(',
  OutputBindingClose = ')',
}

export class TemplateTokeniser implements AsyncIterable<TemplateToken> {
  protected templatesIters: (Iterator<string> | AsyncIterator<string>)[] = [];
  protected templatesQueue: string[] = [];

  protected currentTemplate?: string;
  protected currentPos = 0;
  protected totalPos = 0;
  protected nextToken?: TemplateToken;
  protected lastToken?: TemplateToken;

  constructor(protected tokenMap = TemplateTokenMap) {}

  async *[Symbol.asyncIterator](): AsyncIterableIterator<TemplateToken> {
    yield* this.getStream();
  }

  feed(template: string | Iterable<string> | AsyncIterable<string>) {
    if (typeof template === 'string') {
      this.templatesQueue.push(template);
    } else if (this.isIterable(template)) {
      this.templatesIters.push(template[Symbol.iterator]());
    } else {
      this.templatesIters.push(template[Symbol.asyncIterator]());
    }
  }

  async getAll(): Promise<TemplateToken[]> {
    const array: TemplateToken[] = [];
    for await (const item of this) {
      array.push(item);
    }
    return array;
  }

  async *getStream(): AsyncIterableIterator<TemplateToken> {
    while (await this.nextTemplate()) {
      if (this.nextToken) {
        yield this.consumeNextToken()!;
      }

      const token = this.consumeToken() ?? this.consumeNextToken();

      if (token) {
        yield token;
      }
    }

    if (this.nextToken) {
      yield this.consumeNextToken()!;
    }
  }

  protected consumeToken() {
    let token = this.consumeLastToken();
    let i = this.currentPos;
    let tokenEnded = false;
    let lastCharIdx = this.currentTemplate!.length - 1;

    for (i; i <= lastCharIdx; i++) {
      const char = this.currentTemplate![i];
      const posStart = this.totalPos + i;
      const posEnd = posStart + 1;

      switch (char) {
        case this.tokenMap.Space:
          tokenEnded = true;
          break;
        case this.tokenMap.Assignment:
          this.nextToken = new TemplateTokenAssignment(posStart, posEnd);
          break;
        case this.tokenMap.Comma:
          this.nextToken = new TemplateTokenComma(posStart, posEnd);
          break;
        case this.tokenMap.InputPropBindingOpen:
          this.nextToken = new TemplateTokenInputPropBindingOpen(
            posStart,
            posEnd,
          );
          break;
        case this.tokenMap.InputPropBindingClose:
          this.nextToken = new TemplateTokenInputPropBindingClose(
            posStart,
            posEnd,
          );
          break;
        case this.tokenMap.OutputBindingOpen:
          this.nextToken = new TemplateTokenOutputBindingOpen(posStart, posEnd);
          break;
        case this.tokenMap.OutputBindingClose:
          this.nextToken = new TemplateTokenOutputBindingClose(
            posStart,
            posEnd,
          );
          break;
        default:
          if (!token || token instanceof TemplateTokenString === false) {
            token = new TemplateTokenString(char, posStart, posEnd);
          } else {
            (token as TemplateTokenString).string += char;
            token.end++;
          }
          if (i >= lastCharIdx) {
            this.lastToken = token;
            token = undefined;
          }
          break;
      }

      if (this.nextToken || (tokenEnded && (token || this.nextToken))) {
        i++;
        break;
      } else {
        tokenEnded = false;
      }
    }

    this.currentPos = i;

    return token;
  }

  protected consumeNextToken() {
    const token = this.nextToken;
    this.nextToken = undefined;
    return token;
  }

  protected consumeLastToken() {
    const token = this.lastToken;
    this.lastToken = undefined;
    return token;
  }

  protected async nextTemplate() {
    if (
      !this.currentTemplate ||
      this.currentPos >= this.currentTemplate.length
    ) {
      if (!this.templatesQueue.length) {
        await this.drainTemplateIters();
      }

      this.currentTemplate = this.templatesQueue.shift();
      this.totalPos += this.currentPos;
      this.currentPos = 0;
    }

    return this.currentTemplate;
  }

  protected async drainTemplateIters() {
    for (const iter of this.templatesIters) {
      const result = await iter.next();

      if (!result.done) {
        this.templatesQueue.push(result.value);
        break;
      } else {
        this.templatesIters.shift();
      }
    }
  }

  protected isIterable<T>(val: unknown | Iterable<T>): val is Iterable<T> {
    return typeof val === 'object' && !!val && Symbol.iterator in val;
  }
}
