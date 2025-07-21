import { Builtins } from './core/builtins';
import {
  builtInStringifiers,
  fallbackStringifier,
  type AnyStringifier,
} from './core/stringifier';
import { builtInTransformers, type Transformer } from './core/transformer';

/**
 * Formats and cleans up a given template string.
 *
 * @example
 * ```ts
 * const prompt = format`Adhere to the following guidelines: \n ${guidelines}`;
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FormatFn<Config> {
  // using an interface to allow overriding it using declare module
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  (strings: TemplateStringsArray, ...values: unknown[]): string;
}

type FormatConfigWithPlainObjects = {
  /**
   * List of stringifiers to use.
   *
   * Stringifiers convert any value into a string.
   *
   * @default builtInStringifier
   */
  stringifier?: { [key: string]: AnyStringifier };
  /**
   * List of transformers to use.
   *
   * Transformers allow you to modify the stringified output after it has been stringified.
   *
   * @default builtInTransformers
   */
  transformers?: { [key: string]: Transformer };
};

type FormatConfigWithBuiltins = {
  /**
   * List of stringifiers to use.
   *
   * Stringifiers convert any value into a string.
   *
   * @default builtInStringifier
   */
  stringifier?: Builtins<{ [key: string]: AnyStringifier }, AnyStringifier>;
  /**
   * List of transformers to use.
   *
   * Transformers allow you to modify the stringified output after it has been stringified.
   *
   * @default builtInTransformers
   */
  transformers?: Builtins<{ [key: string]: Transformer }, Transformer>;
};

export type FormatConfig =
  | FormatConfigWithPlainObjects
  | FormatConfigWithBuiltins;

// indicate the default config
// -> creating a separate type will display "DefaultFormatConfig" in intellisense
export type DefaultFormatConfig = {
  [key in keyof FormatConfigWithPlainObjects]: FormatConfigWithPlainObjects[key];
};

export function createFormat<
  Config extends FormatConfigWithPlainObjects = DefaultFormatConfig,
>(config?: Config): FormatFn<Config>;

export function createFormat<Config extends FormatConfigWithBuiltins>(
  config?: Config,
): FormatFn<Config>;
/**
 * Create a custom format instance.
 */
export function createFormat<Config extends FormatConfig = DefaultFormatConfig>(
  config: Config = {} as Config,
): FormatFn<Config> {
  const stringifiers = Object.values(
    config.stringifier instanceof Builtins
      ? config.stringifier.get()
      : (config.stringifier ?? builtInStringifiers.get()),
  ) as AnyStringifier[];

  const transformers = Object.values(
    config.transformers instanceof Builtins
      ? config.transformers.get()
      : (config.transformers ?? builtInTransformers.get()),
  );

  return (strings, ...values) => {
    const result = strings.reduce((acc, string, index) => {
      const value = values[index];

      const stringify = (value: unknown) => {
        const stringifier =
          stringifiers.find((stringifier) => stringifier.when(value)) ??
          fallbackStringifier;
        return stringifier.stringify(value, stringify);
      };

      return acc + string + stringify(value);
    }, '');
    return transformers.reduce((acc, transformer) => transformer(acc), result);
  };
}

/**
 * Formats and cleans up a given template string.
 *
 * @example
 * ```ts
 * const prompt = format`Adhere to the following guidelines: \n ${guidelines}`;
 * ```
 */
export const format = createFormat();
