import {
  TemplateTokenAssignment,
  TemplateTokenString,
  TemplateTokenInputPropBindingClose,
  TemplateTokenInputPropBindingOpen,
  TemplateTokeniser,
  TemplateTokenOutputBindingClose,
  TemplateTokenOutputBindingOpen,
  TemplateToken,
  TemplateTokenComma,
} from './tokeniser';

describe('TemplateTokeniser', () => {
  it('should produce no tokens without template', async () => {
    const tokeniser = new TemplateTokeniser();

    await expect(tokeniser.getAll()).resolves.toEqual([]);
  });

  it('should produce no tokens from empty template', async () => {
    const tokeniser = new TemplateTokeniser();

    tokeniser.feed('');

    await expect(tokeniser.getAll()).resolves.toEqual([]);
  });

  it('should produce tokens from template', async () => {
    const tokeniser = new TemplateTokeniser();

    tokeniser.feed('[input]=prop (out');
    tokeniser.feed('put)=handler($eve');
    tokeniser.feed('nt, p');
    tokeniser.feed('rop)');

    await expect(tokeniser.getAll()).resolves.toEqual([
      new TemplateTokenInputPropBindingOpen(0, 1),
      new TemplateTokenString('input', 1, 6),
      new TemplateTokenInputPropBindingClose(6, 7),
      new TemplateTokenAssignment(7, 8),
      new TemplateTokenString('prop', 8, 12),
      new TemplateTokenOutputBindingOpen(13, 14),
      new TemplateTokenString('output', 14, 20),
      new TemplateTokenOutputBindingClose(20, 21),
      new TemplateTokenAssignment(21, 22),
      new TemplateTokenString('handler', 22, 29),
      new TemplateTokenOutputBindingOpen(29, 30),
      new TemplateTokenString('$event', 30, 36),
      new TemplateTokenComma(36, 37),
      new TemplateTokenString('prop', 38, 42),
      new TemplateTokenOutputBindingClose(42, 43),
    ]);
  });

  it('should produce tokens from template stream', async () => {
    const tokeniser = new TemplateTokeniser();
    const stream = new ControlledStream<string>();

    tokeniser.feed(stream);

    const tokenStream = tokeniser.getStream();

    let actualTokens: Promise<IteratorResult<TemplateToken>>[] = [];
    let expectedTokens: IteratorResult<TemplateToken>[] = [];

    function collectNextToken(expectedToken: TemplateToken | null) {
      expectedTokens.push({
        value: expectedToken ?? undefined,
        done: !expectedToken,
      } as IteratorResult<TemplateToken>);
      actualTokens.push(tokenStream.next());
    }

    collectNextToken(new TemplateTokenInputPropBindingOpen(0, 1));
    collectNextToken(new TemplateTokenString('input', 1, 6));
    collectNextToken(new TemplateTokenInputPropBindingClose(6, 7));
    collectNextToken(new TemplateTokenAssignment(7, 8));
    collectNextToken(new TemplateTokenString('prop', 8, 12));
    collectNextToken(new TemplateTokenOutputBindingOpen(13, 14));

    await stream.flushBuffer(['[input]=prop', ' (out']);

    await expect(Promise.all(actualTokens)).resolves.toEqual(expectedTokens);

    actualTokens = [];
    expectedTokens = [];

    collectNextToken(new TemplateTokenString('output', 14, 20));
    collectNextToken(new TemplateTokenOutputBindingClose(20, 21));
    collectNextToken(new TemplateTokenAssignment(21, 22));
    collectNextToken(new TemplateTokenString('handler', 22, 29));
    collectNextToken(new TemplateTokenOutputBindingOpen(29, 30));
    collectNextToken(new TemplateTokenOutputBindingClose(30, 31));
    collectNextToken(null);

    await stream.flushBuffer(['put)=handler()', null]);

    await expect(Promise.all(actualTokens)).resolves.toEqual(expectedTokens);
  });
});

class ControlledStream<T> implements AsyncIterable<T> {
  protected finished = false;
  protected bufferPromise?: Promise<(T | null)[]>;
  protected bufferFlushedPromise?: Promise<void>;
  protected _flushBuffer = (buffer: (T | null)[]) => Promise.resolve();
  protected bufferFlushed = () => {};

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    yield* this.getStream();
  }

  /**
   * Flushes the buffer and resolves once buffer has been drained
   * by the tokenizer and controls are ready for next setup
   * `null` indicates the end of the stream
   */
  flushBuffer(buffer: (T | null)[]): Promise<void> {
    return this._flushBuffer(buffer);
  }

  async *getStream(): AsyncGenerator<T> {
    this.resetControls();

    while (!this.finished) {
      const buf = await this.bufferPromise!;
      let i = 0;

      for (const template of buf) {
        // Final yield will block this function
        // so we need to schedule `bufferFlushed` call
        // when we are on the last item in current buffer
        // and reset controls before `bufferFlushed` call
        // so the tests can prepare next buffer once call is done
        if (++i >= buf.length) {
          setTimeout(() => {
            const _bufferFlushed = this.bufferFlushed;
            this.resetControls();
            _bufferFlushed();
          });
        }

        if (template) {
          yield template;
        } else {
          this.finished = true;
          break;
        }
      }
    }
  }

  protected resetControls() {
    this.bufferFlushedPromise = new Promise<void>(
      (res) => (this.bufferFlushed = res),
    );
    this.bufferPromise = new Promise<(T | null)[]>(
      (res) =>
        (this._flushBuffer = (buffer) => {
          res(buffer);
          return this.bufferFlushedPromise!;
        }),
    );
  }
}
