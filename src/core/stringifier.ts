import { Builtins } from './builtins';

export type Stringifier<T> = {
  when: (value: T) => value is T;
  stringify: (value: T, stringify: (value: unknown) => string) => string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStringifier = Stringifier<any>;

export function stringifier<T>(s: {
  when: (value: unknown) => value is T;
  stringify: (value: T, stringify: (value: unknown) => string) => string;
}): Readonly<Stringifier<T>> {
  return s;
}

const dateStringifier = stringifier({
  when: (value) => value instanceof Date,
  stringify: (value) =>
    value.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
});

const booleanStringifier = stringifier({
  when: (value) => typeof value === 'boolean',
  stringify: (value) => (!value ? '' : 'true'),
});

const arrayStringifier = stringifier({
  when: (value) => Array.isArray(value),
  stringify: (value: unknown[], stringify) => {
    return value.map((v) => `- ${stringify(v)}`).join('\n');
  },
});

const stringStringifier = stringifier({
  when: (value) => typeof value === 'string' || value instanceof String,
  stringify: (value) => value.toString(),
});

export const fallbackStringifier = stringifier({
  when: (value): value is unknown => true,
  stringify: (value) =>
    value !== undefined && value !== null ? JSON.stringify(value) : '',
});

const stringifiers = {
  date: dateStringifier,
  booleanTrue: booleanStringifier,
  arrayToBulletList: arrayStringifier,
  string: stringStringifier,
} as const;

export const builtInStringifiers = new Builtins<
  typeof stringifiers,
  AnyStringifier
>(stringifiers, {
  // extensions should be applied before built-ins so that they are matched first
  extensionOrder: 'before',
});
