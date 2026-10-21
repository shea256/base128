# Base128 Python

```python
from base128 import encode, decode, encode_integer, decode_integer, create_alphabet

assert decode(encode(b"Hello")) == b"Hello"
assert decode_integer(encode_integer(1000)) == 1000

custom = create_alphabet("... exactly 128 distinct Unicode characters ...")
# encode(b"Hello", alphabet=custom)
```

No runtime dependencies. Exact API and wire format are specified in `../../specs/encoding.md`.

The PyPI package name `unicode-base128` is a proposed, **unverified** publishing name.

`MATH_ALPHABET` / `MATH_ALPHABET_TEXT` provide the optional fixed math
preset. Pass `alphabet=MATH_ALPHABET` to encode or decode. Decoders
(`decode`, `decode_integer`, `BinaryDecoder`) additionally accept
`accept_aliases=True` to accept Compact and Math symbols, even mixed.
Strict decoding remains the default; alias mode rejects unrelated custom layouts.
See the root README for the six alias pairs and examples.

Optional `wrap(payload, prefix=True, checksum=True, mode='binary')` and
`unwrap(text, prefix=True, checksum=True)` support middle-dot envelopes.
`unwrap` returns an immutable `Unwrapped` object with `payload`, `mode`, and
`alphabet` attributes after verification. Flags default to false; use
`mode='integer'` for integer payloads. See the [envelope specification](../../specs/envelope.md).

`COMPACT_ALPHABET` / `COMPACT_ALPHABET_TEXT` name the default layout explicitly.
`DEFAULT_ALPHABET` / `DEFAULT_ALPHABET_TEXT` are aliases for Compact.
The envelope header uses version 0: Compact binary `00`, Compact integer `01`,
Math binary `08`, and Math integer `09`; see the [envelope specification](../../specs/envelope.md).
