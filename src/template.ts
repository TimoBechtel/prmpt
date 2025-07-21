import {
  format as defaultFormat,
  type DefaultFormatConfig,
  type FormatConfig,
  type FormatFn,
} from './format';

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

type TemplateFn<Config> = <T extends Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: TemplateValue<T>[]
) => (args: T) => ReturnType<FormatFn<Config>>; // need this return type to allow type branding by module augmentation

type TemplateConfig<FormatConfig> = {
  format?: FormatFn<FormatConfig>;
};

type DefaultTemplateConfig = TemplateConfig<DefaultFormatConfig>;

/**
 * Creates a template function with custom configuration.
 *
 * @param config - Configuration object.
 * @returns A template function.
 *
 * @example
 * ```ts
 * const template = createTemplate({ format: customFormat });
 * const greeting = template<{ name: string }>`Hello ${'name'}`;
 * const result = greeting({ name: 'John' });
 * ```
 */
export function createTemplate<
  Config extends TemplateConfig<FormatConfig> = DefaultTemplateConfig,
>(config: Config = {} as Config): TemplateFn<Config> {
  const format = config.format ?? defaultFormat;
  return <T extends Record<string, unknown>>(
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
}

/**
 * Creates a string template function.
 *
 * Pass a generic type to specify the arguments it accepts.
 *
 * You can use dot notation to access arguments. Note: It only supports one level of nesting.
 * For more advanced uses, you can use a inline function to access the arguments.
 *
 * @example
 * ```ts
 * const greeting = template<{ name: string, birthday: Date }>`
 *  Hello ${'.name'}. You were born ${user => Date.now() - user.birthday.getTime()}ms ago.
 * `;
 * const result = greeting({ name: 'John', birthday: new Date('1990-01-01') });
 * ```
 */
export const template = createTemplate();
