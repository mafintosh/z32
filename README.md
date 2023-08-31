# z32

z-base-32 encoder & decoder

```
npm install z32
```

## Usage

``` js
const z32 = require('z32')

const s = z32.encode('Hello, World!')

console.log(s) // jb1sa5dxfoofq551pt1nn

const b = z32.decode(s)

console.log(b) // Buffer('Hello, World!')
```

## API

#### `const s = z32.encode(stringOrBuffer)`

Encode a string or buffer to z-base-32.

#### `const buf = z32.decode(s[, out][, { loose = false }])`

Returns a decoded buffer. Throws if the string is invalid. Optionally pass Buffer as `out`. `opts.loose=true` will enable loose decoding, useful for being flexible about transcription errors:

- Uppercase to lower
- `2` -> `z`
- `0` -> `o`
- `l` -> `1`
- `v` -> `u`
- `V` -> `u`

## License

MIT
