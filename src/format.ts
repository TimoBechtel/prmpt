import {
  builtInStringifier,
  fallbackStringifier,
  type AnyStringifier,
} from './core/stringifier';
import { builtInTransformers, type Transformer } from './core/transformer';

export interface FormatFn {
  (strings: TemplateStringsArray, ...values: unknown[]): string;

  with(config: {
    stringifier?: AnyStringifier[];
    transformers?: Transformer[];
  }): FormatFn;

  only(config: {
    stringifier?: AnyStringifier[];
    transformers?: Transformer[];
  }): FormatFn;
}

function createFormatFn(config: {
  stringifier: AnyStringifier[];
  transformers: Transformer[];
}): FormatFn {
  const formatFn: FormatFn = (strings, ...values) => {
    const result = strings.reduce((acc, string, index) => {
      const value = values[index];

      const stringify = (value: unknown) => {
        const stringifier =
          config.stringifier.find((stringifier) => stringifier.when(value)) ??
          fallbackStringifier;
        return stringifier.stringify(value, stringify);
      };

      return acc + string + stringify(value);
    }, '');
    return config.transformers.reduce(
      (acc, transformer) => transformer(acc),
      result,
    );
  };

  formatFn.with = (newConfig) =>
    createFormatFn({
      //  add new stringifiers to the start of the list -> prioritize new stringifiers
      stringifier: [...(newConfig.stringifier ?? []), ...config.stringifier],
      transformers: [...(newConfig.transformers ?? []), ...config.transformers],
    });
  formatFn.only = (newConfig) =>
    createFormatFn({
      stringifier: newConfig.stringifier ?? config.stringifier,
      transformers: newConfig.transformers ?? config.transformers,
    });

  return formatFn;
}

export const format = createFormatFn({
  stringifier: builtInStringifier,
  transformers: builtInTransformers,
});
