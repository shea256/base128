# Base128 v1 — Encoding specification

Status: **v1 format definition** (project release 0.1.0). The base alphabet and algorithms described here are normative. This is an independent encoding format; it does not claim compatibility with any other project called "Base128".

## 1. Alphabet

The default alphabet consists of exactly 128 Unicode scalar values, in this order:

1. All printable, non-space ASCII code points U+0021 through U+007E, in ascending order (94 symbols, indices 0–93).
2. `ΓΔΘΛΞΠΦΨΩ` (9 symbols, indices 94–102).
3. `αβγδεζηθικλμξπστφψω` (19 symbols, indices 103–121).
4. `∑∏∫∂∇∞` (6 symbols, indices 122–127).

The full ordered alphabet and the index-to-code-point mapping are in [`alphabet-v1.json`](alphabet-v1.json). That file is authoritative for interoperability. The alphabet has 128 unique code points; Unicode scalar values are compared exactly (case-sensitive, no Unicode normalization).

Custom alphabets are allowed as caller-supplied configuration. A custom alphabet must contain exactly 128 **distinct Unicode scalar values**. Each code point is one digit, even if Unicode grapheme-cluster segmentation might combine it with an adjacent code point. Unpaired UTF-16 surrogates are invalid. Encoders and decoders must agree on the exact alphabet and order. The payload carries no alphabet identifier.

## 2. Binary-to-text encoding

Input: a finite ordered sequence of octets (8-bit bytes). Output: a string of Base128 alphabet symbols. Output contains **no** header, prefix, length field, checksum, separators, or padding characters.

1. Concatenate the input bytes in order, **most-significant bit first** within each byte.
2. Split the resulting bit stream into consecutive 7-bit groups, from the beginning.
3. If the final group contains fewer than 7 bits, **append zero bits on the right** until it contains 7 bits.
4. Interpret each group as an unsigned 7-bit integer and emit the alphabet symbol at that index.

For `n` input bytes, the output contains `m = ceil(8*n / 7)` **Unicode code points**. Empty bytes encode as an empty string.

Example: bytes `01 00` have bitstream `00000001 00000000`, producing digits `[0, 64, 0]` and default-alphabet text `!a!`.

### Binary decoding and validity

1. Map every encoded Unicode code point to its digit index 0–127. Reject characters missing from the chosen alphabet.
2. Concatenate their 7-bit unsigned representations, most-significant bit first.
3. Emit full 8-bit groups from the start.
4. Verify **both** conditions:
   - If `n` whole bytes were emitted and `m` symbols were consumed, `m == ceil(8*n/7)`.
   - All leftover bits (0–6 of them) are zero.

Reject if either condition fails. Thus encoded text lengths equal to `1 mod 8` are invalid, and nonzero final padding bits are invalid. Every accepted canonical string round-trips *exactly* to itself when decoded and re-encoded with the same alphabet.

### Streaming

A streaming encoder carries any incomplete 7-bit group across byte-chunk boundaries; it adds zero bits **only on finalization**. A streaming decoder carries any incomplete 8-bit group across encoded-text boundaries and validates the trailing-bit and length conditions **only on finalization**. JavaScript streaming decoders must also support UTF-16 surrogate pairs split across string chunks for custom alphabets containing supplementary Unicode scalar values.

A streaming decoder may emit some bytes before detecting malformed input. Callers requiring transactional decoding should buffer or write to a temporary output and commit only when finalization succeeds.

## 3. Integer encoding

Input: a nonnegative arbitrary-precision integer. Output: the **shortest big-endian positional base-128 numeral** using the same alphabet.

For integer `N >= 0`, write `N = sum(d_i * 128^i)` with `0 <= d_i <= 127`, then emit digits from most to least significant. The zero value is encoded by the alphabet's digit-zero symbol, `!` by default. Negative numbers are not supported. Integer decoding rejects empty strings and numerals containing unnecessary leading digit-zero symbols.

Example: `1000 = 7*128 + 104`, so the default-alphabet integer representation is `(β`.

**The integer and binary representations are not interchangeable.** Binary encoding preserves leading zero bytes and byte lengths; positional integer encoding does not preserve byte-length information.

## 4. Text and Unicode

There is **no separate text encoding mode** in v1. Convert a string to UTF-8 bytes (ASCII is a subset of UTF-8), encode bytes with the binary algorithm, and reverse the conversion when decoding. UTF-8 decode should reject malformed byte sequences if textual round-trip exactness matters. No Unicode normalization is performed.

## 5. Errors, security, interoperability

- Invalid alphabets, unexpected input types, invalid symbols, impossible binary lengths, nonzero binary final padding, negative integer inputs, and nonminimal integer numerals are errors.
- No implicit whitespace trimming or character-case conversion. Unicode normalization, if desired, must happen at the application layer before encoding.
- There is no checksum, cryptographic authentication, or confidentiality. Consider a separate application-layer checksum and/or digital signature if typing errors or tampering matter.
- Cross-language interoperability uses [`test-vectors.json`](test-vectors.json), including a reversed custom alphabet.
- In UTF-8, Greek and math symbols require multiple bytes. Fewer *displayed characters* than Base64 does not imply fewer bytes of storage/transmission.
