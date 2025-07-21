import type { Prettify } from './utils';

type BuiltinsOptions = {
  /**
   * Whether extensions should be applied before or after the built-in ones.
   *
   * @default 'after'
   */
  extensionOrder?: 'before' | 'after';
};
export class Builtins<
  T extends Record<string, RelaxedExtensionType>,
  RelaxedExtensionType = T[keyof T],
> {
  private map: T;
  private options: BuiltinsOptions;

  constructor(map: T, options: BuiltinsOptions = {}) {
    this.map = map;
    this.options = options;
  }

  get(): T {
    return { ...this.map };
  }

  /**
   * Pick only certain built-ins.
   */
  pick<K extends keyof T>(
    ...keys: K[]
  ): Builtins<Prettify<Pick<T, K>>, RelaxedExtensionType> {
    const newMap = {} as Pick<T, K>;
    for (const key of Object.keys(this.map)) {
      if (keys.includes(key as K)) {
        newMap[key as K] = this.map[key as K];
      }
    }
    return new Builtins(newMap);
  }

  /**
   * Exclude certain built-ins.
   */
  omit<K extends keyof T>(
    ...keys: K[]
  ): Builtins<Prettify<Omit<T, K>>, RelaxedExtensionType> {
    const newMap = {} as T;
    for (const key of Object.keys(this.map)) {
      if (!keys.includes(key as K)) {
        newMap[key as K] = this.map[key as K];
      }
    }
    return new Builtins(newMap as Omit<T, K>);
  }

  /**
   * Extends the built-ins with a new set of built-ins.
   *
   * @example
   * ```ts
   * builtins.extend({
   *   extensionName: myExtension,
   * });
   * ```
   *
   * Alternatively, you can pass a function to customize the extension order.
   */

  extend<Extension extends Record<string, RelaxedExtensionType>>(
    extension: Extension,
  ): Builtins<Extension & T, RelaxedExtensionType>;
  /**
   * Extends the built-ins with a new set of built-ins.
   *
   * Use the function to customize the extension order, by returning a new set of built-ins.
   */

  extend<Extension extends Record<string, RelaxedExtensionType>>(
    extension: (builtins: Builtins<T, RelaxedExtensionType>) => Extension,
  ): Builtins<Extension, RelaxedExtensionType>;

  /**
   * Extends the built-ins with a new set of built-ins.
   *
   * You can also pass a function to customize the extension order.
   */

  extend<Extension extends Record<string, RelaxedExtensionType>>(
    extensionOrFn:
      | Extension
      | ((builtins: Builtins<T, RelaxedExtensionType>) => Extension),
  ):
    | Builtins<Extension, RelaxedExtensionType>
    | Builtins<T & Extension, RelaxedExtensionType> {
    if (typeof extensionOrFn === 'function') {
      const extension = extensionOrFn(this);
      return new Builtins(extension, {
        extensionOrder: this.options.extensionOrder,
      });
    }
    return new Builtins(
      this.options.extensionOrder === 'before'
        ? {
            ...extensionOrFn,
            // prevent overriding extensions with the same name
            ...Object.fromEntries(
              Object.entries(this.map).filter(
                ([key]) => !(key in extensionOrFn),
              ),
            ),
          }
        : { ...this.map, ...extensionOrFn },
      { extensionOrder: this.options.extensionOrder },
    );
  }
}
