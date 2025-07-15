import { describe, expect, test } from 'bun:test';
import { stringifier } from './core/stringifier';
import { format } from './format';

describe('format', () => {
  test('should trim whitespace', () => {
    expect(format`
      Hello
      World
    `).toBe('Hello\nWorld');
  });

  test('should format Date objects', () => {
    expect(format`
      ${new Date('2025-01-01')}
    `).toBe(
      new Date('2025-01-01').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  });

  test('should allow comments in the prompt', () => {
    expect(format`
      // This is a comment
      Hello
      // This is another comment
      World // this is also a comment
    `).toBe('Hello\nWorld');
  });

  test('should allow custom stringifiers', () => {
    expect(format.with({
      stringifier: [
        stringifier({
          when: (value) => value instanceof Date,
          stringify: (value) =>
            value.toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
            }),
        }),
      ],
    })`
      ${new Date('2025-01-01')}
    `).toBe(
      new Date('2025-01-01').toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }),
    );
  });

  test('should allow custom transformers', () => {
    expect(format.with({
      transformers: [(value) => value.toUpperCase()],
    })`
        Hello
      `).toBe('HELLO');
  });

  test('should allow overriding transformers', () => {
    expect(format.only({
      transformers: [(value) => value.toUpperCase()],
    })`
        Hello
      `).toBe(`
        HELLO
      `);
  });
});

describe('format default stringifier', () => {
  test('should stringify Date objects', () => {
    expect(format`
      ${new Date('2025-01-01')}
    `).toBe(
      new Date('2025-01-01').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  });

  test('should ignore undefined', () => {
    expect(format`
      ${undefined}
    `).toBe('');
  });

  test('should ignore null', () => {
    expect(format`
      ${null}
    `).toBe('');
  });

  test('should stringify boolean true', () => {
    expect(format`
      ${true}
    `).toBe('true');
  });

  test('should ignore boolean false', () => {
    expect(format`
      ${false}
    `).toBe('');
  });

  test('should stringify objects', () => {
    expect(format`
      ${{ name: 'John', age: 30 }}
    `).toBe('{"name":"John","age":30}');
  });

  test('should stringify arrays into bullet points', () => {
    expect(format`
      ${['Hello', 'World']}
    `).toBe('- Hello\n- World');
  });
});
