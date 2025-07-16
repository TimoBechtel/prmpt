import {
  builtInStringifier,
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
export type FormatFn = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => string;

/**
 * Create a custom format instance.
 */
export function createFormat(
  config: {
    /**
     * List of stringifiers to use.
     *
     * Stringifiers convert any value into a string.
     *
     * @default builtInStringifier
     */
    stringifier?: AnyStringifier[];
    /**
     * List of transformers to use.
     *
     * Transformers allow you to modify the stringified output after it has been stringified.
     *
     * @default builtInTransformers
     */
    transformers?: Transformer[];
    /**
     * If true, the built-in stringifiers and transformers will be replaced by the ones provided.
     * Omitting stringifier or transformers will use the built-in ones.
     *
     * You can still import the built-in stringifiers and transformers to mix and match.
     *
     * @default false
     *
     * @example
     * ```ts
     * // replaces built-in stringifiers, but keeps built-in transformers
     * import { dateStringifier, booleanStringifier } from 'prmpt';
     * const format = createFormat({
     *   stringifier: [dateStringifier, booleanStringifier],
     *   replaceBuiltIns: true,
     * });
     * ```
     */
    replaceBuiltIns?: boolean;
  } = {},
): FormatFn {
  const stringifiers = config.replaceBuiltIns
    ? (config.stringifier ?? builtInStringifier)
    : //   add custom ones first, so they can override built-in ones
      [...(config.stringifier ?? []), ...builtInStringifier];
  const transformers = config.replaceBuiltIns
    ? (config.transformers ?? builtInTransformers)
    : //   add custom ones first, so they can override built-in ones
      [...(config.transformers ?? []), ...builtInTransformers];

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

/**
 * // TODO:
 * - add branded type for formatted string?
 */
