declare const __brand: unique symbol;
type Brand<T> = { [__brand]: T };
type Branded<T, B> = T & Brand<B>;

export type FormattedString = Branded<string, 'FormattedString'>;
