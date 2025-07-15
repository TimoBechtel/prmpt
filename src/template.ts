import { format as defaultFormat, type FormatFn } from './format';

const ARGUMENT_KEY_PREFIX = '.';

type PrefixedKey<T> =
  T extends Record<string, unknown>
    ? `${typeof ARGUMENT_KEY_PREFIX}${string & keyof T}`
    : never;

type TemplateValue<T> =
  | PrefixedKey<T>
  | ((args: T) => unknown)

  // allow anything else. this hack allows intellisense, but also allow any other type
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | (unknown & {});

type TemplateFn = <T extends Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: TemplateValue<T>[]
) => (args: T) => string;

export function createTemplate(
  config: {
    format?: FormatFn;
  } = {},
): TemplateFn {
  const format = config.format ?? defaultFormat;
  const templateFn = <T extends Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: TemplateValue<T>[]
  ) => {
    return (args: T) => {
      const resovledValues = values.map((value) => {
        if (
          typeof value === 'string' &&
          value.startsWith(ARGUMENT_KEY_PREFIX)
        ) {
          const key = value.slice(1);
          if (key in args) {
            return args[key];
          }
        }

        if (typeof value === 'function') {
          return (value as (args: T) => string)(args);
        }

        return value;
      });
      return format(strings, ...resovledValues);
    };
  };

  return templateFn;
}

export const template = createTemplate();
