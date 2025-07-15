export type Transformer = (value: string) => string;

export const builtInTransformers: Transformer[] = [
  (v) => v.replaceAll(/[\t ]+/g, ' '),
  // allow comments to be added in the prompt
  (v) => v.replaceAll(/\/\/[^\n$]*/g, ''),
  // remove more than 2 consecutive newlines
  (v) => v.replaceAll(/\n{3,}/g, '\n\n'),
  (v) => v.replaceAll(/\n[\s\t]+/g, '\n'),
  (v) => v.trim(),
];
