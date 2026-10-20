# Base128 optional envelope — version 1

Envelope version 1 is an optional container in the initial Base128 v0.1 release.
It does not change the bare binary or integer encodings in [encoding.md](encoding.md).
The envelope version is independent of the package version.

## Forms

U+00B7 MIDDLE DOT (`·`) is the only separator. Prefix and checksum are independent,
explicit options, both disabled by default:

| Prefix | Checksum | Form |
| --- | --- | --- |
| No | No | `payload` |
| Yes | No | `b128·header·payload` |
| No | Yes | `payload·checksum` |
| Yes | Yes | `b128·header·payload·checksum` |

Decoders require the selected form. They must not guess a wrapper from the input
or silently accept a missing checksum. With either wrapper option enabled, split
on middle dot and require exactly 3, 2, or 4 fields respectively. Empty binary
payloads are valid; empty integer payloads are not. Whitespace is not trimmed,
and no normalization, alternate separators, or case folding is performed.

## Prefix

The identifier is exactly `b128`. The header is a positive decimal envelope
version, one mode letter, and a nonnegative decimal alphabet ID. Numbers have no
leading zeros (except the alphabet ID `0`). Its grammar is
`([1-9][0-9]*)([bi])(0|[1-9][0-9]*)` with ASCII digits and letters.

Currently supported:

- Version: `1`.
- Mode: `b` for binary bytes, `i` for nonnegative integers.
- Alphabet ID: `0` for Default, `1` for Two-byte.

Thus `1b0` means version 1, binary, Default. Unknown versions, modes, and IDs are
errors; multi-digit fields are syntactically possible but are not assigned here.
The header's alphabet and mode govern the payload. Explicit caller constraints
must match the header; omitted constraints are inferred. Without a prefix, mode
and alphabet come from caller configuration (defaulting to binary and Default).

Only the exact two built-in layouts can be prefixed, including when supplied as
text. A checksum-only envelope may use an arbitrary configured alphabet, provided
it excludes middle dot. Bare encoding still supports any valid custom alphabet.

## Checksum

Use CRC-32/ISO-HDLC over the **exact UTF-8 bytes** of the text preceding the final
separator. With a prefix, that is `b128·header·payload`; without one it is `payload`.
Neither the final separator nor the checksum itself is included.

Parameters: reflected polynomial `0xEDB88320`, initial value `0xFFFFFFFF`, final
XOR `0xFFFFFFFF`. The check value for ASCII `123456789` is `0xCBF43926`.
Serialize the resulting unsigned 32-bit value as four big-endian bytes and encode
those bytes with the binary Base128 codec using the payload alphabet. The result
is exactly **five Unicode code points**, with three zero trailing padding bits.
A checksum is not encoded with integer mode, even when the payload is an integer.

Decode the checksum strictly with the selected alphabet, require exactly five
code points and valid padding, and compare its four bytes with the recomputed
CRC. Verify before returning an unwrapped payload. A mismatch is an error.
The CRC detects accidental corruption; it is not a MAC, signature, or proof of
an authentic sender.

Payload alias acceptance remains opt-in and is restricted to the built-in
layouts. Checksum spelling is always strict. CRC covers the received text:
changing an alias requires recalculating the checksum even if decoded data is
unchanged. To canonicalize an envelope, decode its payload, re-encode with the
chosen alphabet, and wrap again.

## Example

HASH160 of UTF-8 `hello` is the 20 bytes
`b6a9c8c230722b7c748331a8b450f05566dc7d0f`. With both options enabled:

```text
b128·1b0·|gvCH$Φh!TGpDYβ=ψLiηΠπU·~]:w_
```

The CRC is `bb5a6bab`, encoded as `~]:w_`. A colon inside the checksum is ordinary
payload-alphabet data, not a separator. See [envelope-vectors.json](envelope-vectors.json)
for independently generated examples across both modes, both alphabets, and all
four option combinations.

## API and processing

`wrap` accepts an already encoded payload and validates it before wrapping.
`unwrap` returns the validated payload, mode, and alphabet; applications then use
the corresponding binary or integer decoder. Both are whole-value operations.
Bare streaming encoders/decoders are unchanged. The CLI buffers wrapped input
and verifies checksums before decoded output; bare file conversion still streams.
The format does not delimit a sequence of multiple envelopes in a stream; an
application must provide record boundaries separately.
