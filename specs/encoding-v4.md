# Base128 v4 — Encoding specification

Status: **v4 format definition** (project release 0.4.0). The base alphabet and algorithms described here are normative. This is an independent encoding format; it does not claim compatibility with any other project called "Base128".

## 1. Alphabet

The default alphabet consists of exactly 128 Unicode scalar values, in this order:

1. ASCII digits `0–9` (indices 0–9).
2. ASCII uppercase letters `A–Z` (indices 10–35).
3. ASCII lowercase letters `a–z` (indices 36–61).
4. The remaining 32 printable, non-space ASCII characters, in ascending code-point order (indices 62–93).
5. `ΓΔΘΛΞΠΦΨΩ` (9 symbols, indices 94–102).
6. `αβγδεζηθικλμξπστφψω` (19 symbols, indices 103–121).
7. `∂∇∏∑√∫` (6 symbols in ascending Unicode code-point order, indices 122–127).

The full ordered alphabet and the index-to-code-point mapping are in [`alphabet-v4.json`](alphabet-v4.json). That file is authoritative for interoperability. The alphabet has 128 unique code points; Unicode scalar values are compared exactly (case-sensitive, no Unicode normalization).

Custom alphabets are allowed as caller-supplied configuration. A custom alphabet must contain exactly 128 **distinct Unicode scalar values**. Each code point is one digit, even if Unicode grapheme-cluster segmentation might combine it with an adjacent code point. Unpaired UTF-16 surrogates are invalid. Encoders and decoders must agree on the exact alphabet and order. The payload carries no alphabet identifier.

### 1.1 Optional two-byte v1 preset and alias decoding

The separately versioned [`alphabet-two-byte-v1.json`](alphabet-two-byte-v1.json)
preset retains default v4 indices 0–121 and assigns these final six values:

| Index | Default v4 | Two-byte v1 |
| ---: | :---: | :---: |
| 122 | ∂ | § |
| 123 | ∇ | © |
| 124 | ∏ | ® |
| 125 | ∑ | ° |
| 126 | √ | ¶ |
| 127 | ∫ | ÷ |

The preset has exactly 128 unique scalar values, each encoded in at most two
UTF-8 bytes. It uses the same binary and integer algorithms. The default v4
alphabet and all strict decoding rules remain unchanged.

An explicitly enabled alias decoder may accept both characters in each row,
including mixed spellings in a single payload. All other characters retain their
v4 indices. Alias mode is supported only with the exact default v4 or two-byte v1
layout, whether supplied as a compiled alphabet or text; requesting it with any
other layout is an error. It does not detect legacy formats or normalize Unicode.

Alias mode changes only character-to-digit lookup. Binary length and padding
validation, integer minimality, case sensitivity, and whitespace rejection still
apply. Re-encoding chooses the selected alphabet's canonical spelling, so an
alias-containing input need not round-trip to the identical text. Applications
comparing, hashing, or signing encoded text should first establish a canonical
spelling, or use strict decoding. The payload carries no preset or alias-mode flag.

[`test-vectors-two-byte-v1.json`](test-vectors-two-byte-v1.json) supplies independent
binary and integer examples, including mixed spellings. Spoken names for the six
alternative symbols are Section, Copyright, Registered, Degree, Paragraph, and
Division; other names follow [`spoken-alphabet-v4.md`](spoken-alphabet-v4.md).

## 2. Binary-to-text encoding

Input: a finite ordered sequence of octets (8-bit bytes). Output: a string of Base128 alphabet symbols. Output contains **no** header, prefix, length field, checksum, separators, or padding characters.

1. Concatenate the input bytes in order, **most-significant bit first** within each byte.
2. Split the resulting bit stream into consecutive 7-bit groups, from the beginning.
3. If the final group contains fewer than 7 bits, **append zero bits on the right** until it contains 7 bits.
4. Interpret each group as an unsigned 7-bit integer and emit the alphabet symbol at that index.

For `n` input bytes, the output contains `m = ceil(8*n / 7)` **Unicode code points**. Empty bytes encode as an empty string.

Example: bytes `01 00` have bitstream `00000001 00000000`, producing digits `[0, 64, 0]` and default-alphabet text `0#0`.

### Binary decoding and validity

1. Map every encoded Unicode code point to its digit index 0–127. Reject characters missing from the chosen alphabet, except the explicit aliases in §1.1 when enabled.
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

For integer `N >= 0`, write `N = sum(d_i * 128^i)` with `0 <= d_i <= 127`, then emit digits from most to least significant. The zero value is encoded by the alphabet's digit-zero symbol, `0` by default. Negative numbers are not supported. Integer decoding rejects empty strings and numerals containing unnecessary leading digit-zero symbols.

Example: `1000 = 7*128 + 104`, so the default-alphabet integer representation is `7β`.

**The integer and binary representations are not interchangeable.** Binary encoding preserves leading zero bytes and byte lengths; positional integer encoding does not preserve byte-length information.

## 4. Text and Unicode

There is **no separate text encoding mode** in v4. Convert a string to UTF-8 bytes (ASCII is a subset of UTF-8), encode bytes with the binary algorithm, and reverse the conversion when decoding. UTF-8 decode should reject malformed byte sequences if textual round-trip exactness matters. No Unicode normalization is performed.

## 5. Errors, security, interoperability

- Invalid alphabets, unexpected input types, invalid symbols, impossible binary lengths, nonzero binary final padding, negative integer inputs, and nonminimal integer numerals are errors.
- No implicit whitespace trimming or character-case conversion. Unicode normalization, if desired, must happen at the application layer before encoding.
- There is no checksum, cryptographic authentication, or confidentiality. Consider a separate application-layer checksum and/or digital signature if typing errors or tampering matter.
- Cross-language interoperability uses [`test-vectors.json`](test-vectors.json), including a reversed custom alphabet.
- In UTF-8, Greek and math symbols require multiple bytes. Fewer *displayed characters* than Base64 does not imply fewer bytes of storage/transmission.

## 6. Migration from earlier versions

Version 4 keeps the v3 character set and indices 0–121 unchanged. The six mathematical symbols are now in ascending Unicode code-point order:

| Index | Character | Code point |
| ---: | :---: | --- |
| 122 | ∂ | U+2202 |
| 123 | ∇ | U+2207 |
| 124 | ∏ | U+220F |
| 125 | ∑ | U+2211 |
| 126 | √ | U+221A |
| 127 | ∫ | U+222B |

Integer examples: 0 → `0`, 15 → `F`, 16 → `G`, 126 → `√`, 127 → `∫`, 128 → `10`, 129 → `11`.

The algorithms are unchanged, but the default wire representations are incompatible with earlier versions. Payloads have no version marker, and the same characters can decode differently without an error. Do not infer the version from a payload. Agree on it out of band.

To read older data, explicitly pass the `alphabet` string from the corresponding legacy alphabet file as a custom alphabet (JavaScript: `{alphabet: legacyAlphabet}`; Python: `alphabet=legacy_alphabet`; CLI: `--alphabet-file` with a UTF-8 file containing exactly that string and no newline). To migrate, decode using the original alphabet, then encode the recovered bytes or integer with v4. Do not mix binary and integer conversion modes.

| Version | Difference from v4 | Preserved references |
| --- | --- | --- |
| v1 | ASCII code-point ordering; math suffix `∑∏∫∂∇∞` | [Alphabet](alphabet-v1.json), [specification](encoding-v1.md), [fixtures](test-vectors-v1.json) |
| v2 | Digits first; math suffix `∑∏∫∂∇∞` | [Alphabet](alphabet-v2.json), [specification](encoding-v2.md), [fixtures](test-vectors-v2.json) |
| v3 | Digits first; math suffix `∑∏∫∂∇√` | [Alphabet](alphabet-v3.json), [specification](encoding-v3.md), [fixtures](test-vectors-v3.json) |
