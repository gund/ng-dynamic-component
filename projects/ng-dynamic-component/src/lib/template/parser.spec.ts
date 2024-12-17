import { TemplateParser } from './parser';
import { TemplateTokeniser } from './tokeniser';

describe('TemplateParser', () => {
  it('should parse IO object from tokens and component', async () => {
    const component = { prop: 'val', handler: jest.fn() };
    const tokeniser = new TemplateTokeniser();
    const parser = new TemplateParser(tokeniser, component);

    const io = parser.getIo();

    tokeniser.feed('[input]=prop (output)=handler($event)');

    await expect(io).resolves.toMatchObject({
      '[input]': 'val',
      '(output)': {
        handler: expect.any(Function),
        args: ['$event'],
      },
    });

    ((await io)['(output)'] as any).handler('mock-event');

    expect(component.handler).toHaveBeenCalledWith('mock-event');
  });

  describe('inputs', () => {
    it('should parse plain input', async () => {
      const component = { prop: 'val' };
      const tokeniser = new TemplateTokeniser();
      const parser = new TemplateParser(tokeniser, component);

      const io = parser.getIo();

      tokeniser.feed('input=prop ');

      await expect(io).resolves.toMatchObject({
        input: 'val',
      });
    });

    it('should parse prop input', async () => {
      const component = { prop: 'val' };
      const tokeniser = new TemplateTokeniser();
      const parser = new TemplateParser(tokeniser, component);

      const io = parser.getIo();

      tokeniser.feed('[input]=prop ');

      await expect(io).resolves.toMatchObject({
        '[input]': 'val',
      });
    });

    it('should NOT parse input with quotes', async () => {
      const component = { '"prop"': 'val' };
      const tokeniser = new TemplateTokeniser();
      const parser = new TemplateParser(tokeniser, component);

      const io = parser.getIo();

      tokeniser.feed('[input]="prop" ');

      await expect(io).resolves.toMatchObject({
        '[input]': 'val',
      });
    });
  });

  describe('outputs', () => {
    it('should parse output without args', async () => {
      const component = { handler: jest.fn() };
      const tokeniser = new TemplateTokeniser();
      const parser = new TemplateParser(tokeniser, component);

      const io = parser.getIo();

      tokeniser.feed('(output)=handler()');

      await expect(io).resolves.toMatchObject({
        '(output)': {
          handler: expect.any(Function),
          args: [],
        },
      });

      ((await io)['(output)'] as any).handler();

      expect(component.handler).toHaveBeenCalledWith();
    });

    it('should parse output with one arg', async () => {
      const component = { handler: jest.fn() };
      const tokeniser = new TemplateTokeniser();
      const parser = new TemplateParser(tokeniser, component);

      const io = parser.getIo();

      tokeniser.feed('(output)=handler($event)');

      await expect(io).resolves.toMatchObject({
        '(output)': {
          handler: expect.any(Function),
          args: ['$event'],
        },
      });

      ((await io)['(output)'] as any).handler('mock-event');

      expect(component.handler).toHaveBeenCalledWith('mock-event');
    });

    it('should parse output with multiple args', async () => {
      const component = { handler: jest.fn() };
      const tokeniser = new TemplateTokeniser();
      const parser = new TemplateParser(tokeniser, component);

      const io = parser.getIo();

      tokeniser.feed('(output)=handler($event, prop)');

      await expect(io).resolves.toMatchObject({
        '(output)': {
          handler: expect.any(Function),
          args: ['$event', 'prop'],
        },
      });

      ((await io)['(output)'] as any).handler('mock-event', 'val');

      expect(component.handler).toHaveBeenCalledWith('mock-event', 'val');
    });
  });
});
