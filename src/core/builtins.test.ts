import { describe, expect, test } from 'bun:test';
import { Builtins } from './builtins';

describe('builtins', () => {
  const testBuiltins = new Builtins({
    a: 1,
    b: 2,
    c: 3,
  });

  test('should have all builtins', () => {
    expect(Object.keys(testBuiltins.get())).toHaveLength(3);
  });

  test('can pick builtins', () => {
    expect(Object.keys(testBuiltins.pick('b', 'c').get())).toHaveLength(2);
  });

  test('can except builtins', () => {
    expect(Object.keys(testBuiltins.omit('a', 'b').get())).toHaveLength(1);
  });
});
