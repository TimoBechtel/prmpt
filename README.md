<h1 align="center">💬 <br/> prmt</h1>
<p align="center"><i>Type-safe, composable string templating and formatting for llms.</i></p>
<p align="center">
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

## Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Format](#format)
  - [Template](#template)
  - [Custom Stringifiers](#custom-stringifiers)
  - [Custom Transformers](#custom-transformers)
  - [replaceBuiltIns](#replacebuiltins)
- [API](#api)
- [Development / Contributing](#development--contributing)
- [License](#license)

## About

**prmt** is a tiny, type-safe library for building composable string templates and formatting. Useful for ai prompts, and anywhere you need to need text templating and/or formatting.

## Example

It allows you to write prompts like this:

```ts
const result = generateText({
   model: myModel,
   prompt: format`
     // Date is automatically AI-friendly stringified
     Today is ${new Date()}.
   
     // This will create a bullet list
     Follow these steps:
     ${steps}
     // Won't render boolean false
     ${shortOutput && '- Only answer with a single sentence.'}

     Answer the given query: ${query}
     You are now connected to a human.
   `
})
```

## Features

- Allows writing comments in prompts
- Cleans up unnecessary whitespace and formats string
- Built-in stringifiers for dates, arrays, booleans, and others
- Built-in transformers for whitespace, comments, and formatting
- Type-safe templates with argument interpolation
- Easily add your own stringifiers and transformers
- Fully typed, zero dependencies

## Installation

Picks your package manager automatically:

```sh
npx nypm install prmt
```

Or manually:

```sh
npm install prmt
```

## Usage

### Format

Format and clean up multi-line strings with the `format` tag:

```ts
import { format } from 'prmt';

const guidelines = [
   'Be concise',
   'Use markdown',
   // 'Never use emojis',
];

const prompt = format`
  // This is a comment
  Adhere to the following guidelines:
  ${guidelines}
`;
// Output: 'Adhere to the following guidelines:\n- Be concise\n- Use markdown'
```

- Comments (`// ...`) are stripped
- Extra whitespace and newlines are normalized
- Arrays are formatted as bullet lists
- Dates, booleans, objects, and more are stringified sensibly

_Note: The logic for comments is currently very simple: It removes everything after `//` until the end of the line._

#### Customizing Format

You can create a custom format instance:

```ts
import { createFormat } from 'prmt';

const customFormat = createFormat(/* custom config */);
```

See [Custom Stringifiers](#custom-stringifiers) and [Custom Transformers](#custom-transformers)

### Template

Create type-safe templates with argument interpolation:

```ts
import { template } from 'prmt';

const greeting = template<{ name: string }>`Hello ${'.name'}`;

greeting({ name: 'John' }); // 'Hello John'
```

You can also use functions:

```ts
const birthday = template<{ birthday: Date }>`
  You were born ${user => Date.now() - user.birthday.getTime()}ms ago.
`;

birthday({ birthday: new Date('1990-01-01') }); // 'You were born 131558400000ms ago.'
```

#### Customizing Templates

You can create a template with a custom format instance:

```ts
import { createTemplate, createFormat } from 'prmt';

const format = createFormat({ /* custom config */ });
const myTemplate = createTemplate({ format });
```

See [Custom Stringifiers](#custom-stringifiers) and [Custom Transformers](#custom-transformers)

### Custom Stringifiers

Extend prmt's built-in stringifiers. They will be applied in the order they are defined, **before** any built-in stringifiers.

```ts
import { createFormat, stringifier, builtInStringifiers } from 'prmt';

const customFormat = createFormat({
  stringifier: {
    // replace the built-in date stringifier
    date: stringifier({
      when: (value) => value instanceof Date,
      stringify: (value) => value.toISOString(),
    }),
    // add a custom stringifier for user objects
    user: stringifier({
      when: (value): value is User => isUser(value),
      stringify: (value) => `User: ${value.name}`,
    }),
  },
});

customFormat`${new Date('2025-01-01')}`; // '2025-01-01T00:00:00.000Z'
customFormat`${user}`; // 'User: John'
```

### Custom Transformers

Extend prmt's built-in transformers to customize the final string output. They will be applied in the order they are defined, **after** any built-in transformers.

```ts
import { createFormat } from 'prmt';

const upperFormat = createFormat({
  transformers: {
    uppercase: (value) => value.toUpperCase()
  },
});

upperFormat`
  Hello
  World
`; // 'HELLO\nWORLD'
```

### Mix and Match

`prmt` includes a built-in utility to mix and match built-in stringifiers and transformers.

#### Methods

- `pick` - only keep the given built-ins
- `omit` - exclude the given built-ins
- `extend` - add or override built-ins

#### Examples

```ts
import { createFormat, stringifier } from 'prmt';

const onlyDateFormat = createFormat({
  stringifier: builtInStringifiers
    .pick('array') // only keep the array stringifier
    .extend({
      date: stringifier({
        when: (value) => value instanceof Date,
        stringify: (value) => value.toISOString(),
      }),
    }),
});

onlyDateFormat`${new Date('2025-01-01')}`; // '2025-01-01T00:00:00.000Z'
```

Or for transformers:

```ts
import { createFormat, builtInTransformers } from 'prmt';

const rawFormat = createFormat({
  // keep all built-in transformers, except the one we don't want
  transformers: builtInTransformers.omit('removeMoreThan2ConsecutiveNewlines'),
});

rawFormat`
  Hello   World
`; // '\n  Hello   World\n'
```

### Type Branding

`format` by default returns a string type. You can optionally enable type branding using module augmentation to return a branded string type instead.

This is useful to make sure strings are properly formatted before being used in a prompt.

```ts
// prmt.d.ts
import { FormattedString } from 'prmt';

declare module 'prmt' {
  interface FormatFn {
    (strings: TemplateStringsArray, ...values: unknown[]): FormattedString;
  }
}
```

## Development / Contributing

### Build

```sh
bun run build
```

### Test

```sh
bun test
```

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated releases and Conventional Commits for commit messages.
