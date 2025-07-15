export type Stringifier<T> = {
  when: (value: T) => value is T;
  stringify: (value: T, stringify: (value: unknown) => string) => string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStringifier = Stringifier<any>;

export function stringifier<T>(s: {
  when: (value: unknown) => value is T;
  stringify: (value: T, stringify: (value: unknown) => string) => string;
}): Stringifier<T> {
  return s;
}

export const dateStringifier = stringifier({
  when: (value) => value instanceof Date,
  stringify: (value) =>
    value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
});

export const booleanStringifier = stringifier({
  when: (value) => typeof value === 'boolean',
  stringify: (value) => (!value ? '' : 'true'),
});

export const arrayStringifier = stringifier({
  when: (value) => Array.isArray(value),
  stringify: (value: unknown[], stringify) => {
    return value.map((v) => `- ${stringify(v)}`).join('\n');
  },
});

export const stringStringifier = stringifier({
  when: (value) => typeof value === 'string' || value instanceof String,
  stringify: (value) => value.toString(),
});

export const fallbackStringifier = stringifier({
  when: (value): value is unknown => true,
  stringify: (value) =>
    value !== undefined && value !== null ? JSON.stringify(value) : '',
});

export const builtInStringifier: AnyStringifier[] = [
  dateStringifier,
  booleanStringifier,
  arrayStringifier,
  stringStringifier,
];
