# CLI reference

Run from a built checkout with Node.js 20+:

```sh
npm ci
npm run build
node packages/cli/bin/base128.mjs --help
```

The commands below use `node packages/cli/bin/base128.mjs`; `base128` is equivalent
only when that executable has been installed or linked onto your PATH.

| Command | Input | Output |
| --- | --- | --- |
| `encode [FILE]` | Raw bytes | UTF-8 Base128 text |
| `decode [FILE]` | UTF-8 Base128 text | Raw bytes |
| `integer encode DECIMAL` | Nonnegative decimal argument | Base128 numeral |
| `integer decode ENCODED` | Base128 numeral argument | Decimal text |

Binary and integer representations are different formats; pair matching modes.
Omit FILE or use `-` for stdin. Output goes to stdout unless `-o FILE` (or
`--output FILE`) is supplied. Output never gains a trailing newline. Quote shell
arguments containing punctuation; use files or stdin for arbitrary payloads.

| Option | Behavior |
| --- | --- |
| `--alphabet compact` | Compact alphabet; also used when omitted |
| `--alphabet math` | Math alphabet |
| `--alphabet-file FILE` | Exactly 128 unique Unicode scalar values, UTF-8, no newline; cannot combine with `--alphabet` |
| `--prefix` | Encode: add the metadata prefix. Decode: require it and infer its alphabet unless explicitly constrained. |
| `--checksum` | Encode: append CRC-32 in five Base128 symbols. Decode: require and verify it. |
| `--accept-aliases` | Decode only: accepts either built-in symbol form, even mixed; rejects unrelated custom layouts |
| `-o FILE` | Write output to a file (`-` means stdout) |
| `--help`, `-h` | Show usage |

Decoding is strict unless `--accept-aliases` is present. All modes enforce binary
length/padding and integer leading-zero rules as applicable. Alias mode does not
trim whitespace or detect alphabets. See the [specification](../specs/encoding.md).

```sh
printf 'Hello' | node packages/cli/bin/base128.mjs encode
node packages/cli/bin/base128.mjs encode input.bin --alphabet math -o output.b128
node packages/cli/bin/base128.mjs decode output.b128 --alphabet math -o restored.bin
node packages/cli/bin/base128.mjs decode output.b128 --accept-aliases -o restored.bin
node packages/cli/bin/base128.mjs integer encode 1000
node packages/cli/bin/base128.mjs integer decode '7β'
```

For a value with both prefix and checksum, use the same flags in both directions:

```sh
printf 'Hello' | node packages/cli/bin/base128.mjs encode --prefix --checksum > hello.b128
node packages/cli/bin/base128.mjs decode hello.b128 --prefix --checksum
```

The fixed header alphabet is Compact. Format version 0 uses `00` for Compact
binary, `01` for Compact integer, `08` for Math binary, and `09` for Math integer.
The `encode`/`decode` commands select binary mode; `integer encode`/`integer decode`
select integer mode. A mismatched prefix mode is an error. With a prefix, omitting
`--alphabet` lets decoding use the declared alphabet; without a prefix it uses Compact.

Success exits 0; failures exit 1 and report `base128: ...` on stderr. Human-readable
error wording is not a structured API; inspect the exit status. Stdout may contain
partial decoded bytes before a streaming validation failure. File output is
transactional: a temporary file is renamed only after successful completion, so
invalid input does not overwrite an existing target. A successful command with
`-o FILE` replaces that target. Bare values have no checksums or alphabet IDs. `--prefix` and `--checksum` independently enable the [optional envelope](../specs/envelope.md). Wrapped operations buffer input and verify before emitting decoded output; bare operations stream. The CLI subcommand constrains the prefix mode, and an explicit alphabet option must match the prefix.
