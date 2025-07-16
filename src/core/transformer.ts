export type Transformer = (value: string) => string;

export const builtInTransformers: Transformer[] = [
  // normalize line endings
  (v) => v.replaceAll('\r\n', '\n'),
  // allow comments to be added in the prompt
  (v) => v.replaceAll(/\/\/[^\n]*/g, ''),
  // remove whitespace between newlines
  (v) => v.replaceAll(/\n[ \t]+/g, '\n'),
  (v) => v.replaceAll(/[ \t]+\n/g, '\n'),
  // collapse whitespace
  (v) => v.replaceAll(/[\t ]+/g, ' '),
  // remove more than 2 consecutive newlines
  (v) => v.replaceAll(/\n{3,}/g, '\n\n'),
  (v) => v.trim(),
];
