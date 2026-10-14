# Base128 Python

```python
from base128 import encode, decode, encode_integer, decode_integer, create_alphabet

assert decode(encode(b"Hello")) == b"Hello"
assert decode_integer(encode_integer(1000)) == 1000

custom = create_alphabet("... exactly 128 distinct Unicode characters ...")
# encode(b"Hello", alphabet=custom)
```

No runtime dependencies. Exact API and wire format are specified in `../../specs/encoding-v4.md`.

The PyPI package name `unicode-base128` is a proposed, **unverified** publishing name.
