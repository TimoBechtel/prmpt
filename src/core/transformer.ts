import { Builtins } from './builtins';

export type Transformer = (value: string) => string;

const transformers = {
  normalizeLineEndings: ((v: string) =>
    v.replaceAll('\r\n', '\n')) as Transformer,
  stripComments: ((v: string) =>
    v.replaceAll(/\/\/[^\n]*/g, '')) as Transformer,
  removeWhitespaceBetweenLines: ((v: string) =>
    v
      .replaceAll(/\n[ \t]+/g, '\n')
      .replaceAll(/[ \t]+\n/g, '\n')) as Transformer,
  collapseWhitespace: ((v: string) =>
    v.replaceAll(/[\t ]+/g, ' ')) as Transformer,
  removeMoreThan2ConsecutiveNewlines: ((v: string) =>
    v.replaceAll(/\n{3,}/g, '\n\n')) as Transformer,
  trim: ((v: string) => v.trim()) as Transformer,
} as const satisfies Record<string, Transformer>;

export const builtInTransformers = new Builtins<typeof transformers>(
  transformers,
  {
    // extensions should be applied after built-ins so that they can format the output of the built-ins
    extensionOrder: 'after',
  },
);
