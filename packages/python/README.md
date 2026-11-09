# Base128 Python

```python
from base128 import encode, decode, encode_integer, decode_integer, create_alphabet, DEFAULT_ALPHABET_TEXT

assert decode(encode(b"Hello")) == b"Hello"
assert decode_integer(encode_integer(1000)) == 1000

custom = create_alphabet(DEFAULT_ALPHABET_TEXT[::-1])
assert decode(encode(b"Hello", alphabet=custom), alphabet=custom) == b"Hello"
```

No runtime dependencies. Exact API and wire format are specified in `../../specs/encoding.md`.

The PyPI package name `unicode-base128` is a proposed, **unverified** publishing name.

`DEFAULT_ALPHABET` / `DEFAULT_ALPHABET_TEXT` provide the official alphabet.
Custom alphabets are supported. Decoding is strict, without symbol aliases.

Optional `wrap(payload, prefix=True, checksum=True, mode='binary')` and
`unwrap(text, prefix=True, checksum=True)` support middle-dot envelopes.
`unwrap` returns an immutable `Unwrapped` object with `payload`, `mode`, and
`alphabet` attributes after verification. Flags default to false; use
`mode='integer'` for integer payloads. See the [envelope specification](../../specs/envelope.md).

The envelope header uses version 0: binary `00`, integer `01`.
See the [envelope specification](../../specs/envelope.md).
