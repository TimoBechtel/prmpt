import { describe, expect, test } from 'bun:test';
import {
  builtInStringifiers,
  builtInTransformers,
  createFormat,
  format,
  stringifier,
} from '.';

describe('format', () => {
  test('should trim whitespace', () => {
    expect(format`
      Hello
      World
    `).toBe('Hello\nWorld');
  });

  test('should keep single empty newline', () => {
    expect(format`
      Hello

      World
    `).toBe('Hello\n\nWorld');
  });

  test('should remove more than 2 consecutive empty newlines', () => {
    expect(format`
      Hello


      World
    `).toBe('Hello\n\nWorld');
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
      Hello // this is another comment
      // This too
      World // this is also a comment
    `).toBe('Hello\n\nWorld');
  });

  test('should allow custom stringifiers', () => {
    const customFormat = createFormat({
      stringifier: builtInStringifiers.extend({
        date: stringifier({
          when: (value) => value instanceof Date,
          stringify: (value) =>
            value.toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
            }),
        }),
      }),
    });

    expect(customFormat`
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
    const customFormat = createFormat({
      transformers: builtInTransformers.extend({
        uppercase: (value) => value.toUpperCase(),
      }),
    });

    expect(customFormat`
        Hello
      `).toBe('HELLO');
  });

  test('should allow overriding transformers', () => {
    const customFormat = createFormat({
      transformers: {
        uppercase: (value) => value.toUpperCase(),
      },
    });

    expect(customFormat`
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

  test('handles circular references', () => {
    const array: unknown[] = [1, 2, 3];
    array.push(array);
    expect(format`
      ${array}
    `).toBe('- 1\n- 2\n- 3\n- [Circular Reference]');
  });
});
