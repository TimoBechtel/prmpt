import {
  builtInStringifier,
  fallbackStringifier,
  type AnyStringifier,
} from './core/stringifier';
import { builtInTransformers, type Transformer } from './core/transformer';

export type FormatFn = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => string;

export function createFormat(
  config: {
    stringifier?: AnyStringifier[];
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

  const formatFn: FormatFn = (strings, ...values) => {
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

  return formatFn;
}

export const format = createFormat();

/**
 * // TODO:
 * - use factory function instead of chaining with/only? prevents prototype props intellisense
 * - add branded type for formatted string?
 */
