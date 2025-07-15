import { describe, expect, test } from 'bun:test';
import { stringifier } from './core/stringifier';
import { template } from './template';

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
    expect(
      template.with({
        stringifier: [
          stringifier({
            when: (value) => value instanceof Date,
            stringify: (value) =>
              value.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }),
          }),
        ],
      })<{
        date: Date;
      }>`Date is ${'.date'}`({ date: new Date('2025-01-01') }),
    ).toBe('Date is 01/01/2025');
  });

  test('allows overriding transformers', () => {
    expect(
      template.only({ transformers: [(value) => value.toUpperCase()] })<{
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
