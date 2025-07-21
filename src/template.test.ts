import { describe, expect, test } from 'bun:test';
import {
  builtInStringifiers,
  createFormat,
  createTemplate,
  stringifier,
  template,
} from '.';

describe('template', () => {
  test('should return a function', () => {
    expect(template`Hello ${'name'}`).toBeInstanceOf(Function);
  });

  test('should resolve object values by key', () => {
    expect(template<{ name: string }>`Hello ${'.name'}`({ name: 'John' })).toBe(
      'Hello John',
    );
  });

  test('should run passed functions', () => {
    expect(
      template<{ name: string }>`Hello ${({ name }) => name.toUpperCase()}`({
        name: 'John',
      }),
    ).toBe('Hello JOHN');
  });

  test('should allow custom stringifiers', () => {
    const format = createFormat({
      stringifier: builtInStringifiers.extend({
        date: stringifier({
          when: (value) => value instanceof Date,
          stringify: (value) =>
            value.toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }),
        }),
      }),
    });
    const template = createTemplate({
      format,
    });

    expect(
      template<{
        date: Date;
      }>`Date is ${'.date'}`({ date: new Date('2025-01-01') }),
    ).toBe('Date is 01/01/2025');
  });

  test('allows overriding transformers', () => {
    const format = createFormat({
      transformers: {
        uppercase: (value) => value.toUpperCase(),
      },
    });
    const template = createTemplate({
      format,
    });

    expect(
      template<{
        name: string;
      }>`
         Hello
         ${'.name'}
      `({ name: 'John' }),
    ).toBe(`
         HELLO
         JOHN
      `);
  });
});
