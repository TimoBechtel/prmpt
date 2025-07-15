export type Transformer = (value: string) => string;

export const builtInTransformers: Transformer[] = [
  // normalize line endings
  (v) => v.replaceAll('\r\n', '\n'),
  // allow comments to be added in the prompt
  (v) => v.replaceAll(/\/\/[^\n]*/g, ''),
  (v) => v.replaceAll(/[\t ]+/g, ' '),
  // remove more than 2 consecutive newlines
  (v) => v.replaceAll(/\n{3,}/g, '\n\n'),
  // remove whitespace between newlines
  (v) => v.replaceAll(/\n[\s\t]+/g, '\n'),
  (v) => v.replaceAll(/[\s\t]+\n/g, '\n'),
  (v) => v.trim(),
];
