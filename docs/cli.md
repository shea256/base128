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
| `--alphabet default` | Default alphabet; also used when omitted |
| `--alphabet two-byte` | Fixed two-byte alternative |
| `--alphabet-file FILE` | Exactly 128 unique Unicode scalar values, UTF-8, no newline; cannot combine with `--alphabet` |
| `--accept-aliases` | Decode only: accepts either built-in symbol form, even mixed; rejects unrelated custom layouts |
| `-o FILE` | Write output to a file (`-` means stdout) |
| `--help`, `-h` | Show usage |

Decoding is strict unless `--accept-aliases` is present. All modes enforce binary
length/padding and integer leading-zero rules as applicable. Alias mode does not
trim whitespace or detect alphabets. See the [specification](../specs/encoding.md).

```sh
printf 'Hello' | node packages/cli/bin/base128.mjs encode
node packages/cli/bin/base128.mjs encode input.bin --alphabet two-byte -o output.b128
node packages/cli/bin/base128.mjs decode output.b128 --alphabet two-byte -o restored.bin
node packages/cli/bin/base128.mjs decode output.b128 --accept-aliases -o restored.bin
node packages/cli/bin/base128.mjs integer encode 1000
node packages/cli/bin/base128.mjs integer decode '7β'
```

Success exits 0; failures exit 1 and report `base128: ...` on stderr. Human-readable
error wording is not a structured API; inspect the exit status. Stdout may contain
partial decoded bytes before a streaming validation failure. File output is
transactional: a temporary file is renamed only after successful completion, so
invalid input does not overwrite an existing target. A successful command with
`-o FILE` replaces that target. There are no checksums or embedded alphabet IDs.
