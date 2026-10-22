# Base128 for Rust

Dependency-free at runtime, with the same wire format as the JavaScript and Python libraries. Compact is the default alphabet; Math and custom alphabets are supported. This crate is prepublication: use a local path dependency, not a crates.io install.

```toml
[dependencies]
base128-unicode-codec = { path = "/path/to/base128/packages/rust" }
```

```rust
use base128_unicode_codec::{encode, decode, encode_integer, decode_integer};

let encoded = encode("Hello, 世界!".as_bytes());
assert_eq!(decode(&encoded).unwrap(), "Hello, 世界!".as_bytes());
assert_eq!(encode_integer(1000), "7β");
assert_eq!(decode_integer("7β").unwrap(), 1000);
```

## Integers

`encode_integer` and `decode_integer` use `u128`. Decoding a larger value returns `Error::IntegerOverflow`. For arbitrary-size nonnegative integers, use `encode_integer_decimal` and `decode_integer_decimal`, which accept/return decimal strings without a bigint dependency. Decimal input must contain only ASCII digits; leading decimal zeros are accepted and canonicalized. Encoded integers must be minimal: empty strings and leading zero digits are rejected.

## Alphabets and strict decoding

`compact_alphabet()`, `math_alphabet()`, and `default_alphabet()` return shared validated alphabets. `DEFAULT_ALPHABET_TEXT`, `COMPACT_ALPHABET_TEXT`, and `MATH_ALPHABET_TEXT` provide their exact text. `Alphabet::new(text)` validates custom alphabets: exactly 128 distinct Unicode scalar values, including support for supplementary-plane characters.

```rust
use base128_unicode_codec::*;

let alphabet = math_alphabet();
let encoded = encode_with_alphabet(&[255], alphabet);
let options = DecodeOptions { alphabet: Some(alphabet), accept_aliases: false };
assert_eq!(decode_with_options(&encoded, options).unwrap(), [255]);
```

Encoding variants are `encode_with_alphabet`, `encode_integer_with_alphabet`, and `encode_integer_decimal_with_alphabet`. Decoding variants are `decode_with_options`, `decode_integer_with_options`, and `decode_integer_decimal_with_options`.

Decoding is strict by default. Set `DecodeOptions::accept_aliases` to accept corresponding Compact and Math symbols, including mixed input; this is allowed only for those exact built-in layouts. No input is trimmed, case-folded, or normalized. Binary decoding rejects noncanonical lengths and nonzero trailing bits. Rust strings already require valid UTF-8.

## Streaming bytes

```rust
use base128_unicode_codec::*;

let mut encoder = BinaryEncoder::default();
let mut text = encoder.write(b"Hel").unwrap();
text.push_str(&encoder.write(b"lo").unwrap());
text.push_str(&encoder.finish().unwrap());

let mut decoder = BinaryDecoder::new(DecodeOptions::default()).unwrap();
let mut bytes = Vec::new();
for symbol in text.chars() {
    bytes.extend(decoder.write(&symbol.to_string()).unwrap());
}
decoder.finish().unwrap();
assert_eq!(bytes, b"Hello");
```

Use `BinaryEncoder::new(&alphabet)` for custom alphabets. Decoder chunks must be valid UTF-8 strings ending on character boundaries. Always call `finish()` to validate length and padding before trusting decoded output. Streams reject calls after finalization; decoder write errors also invalidate the stream.

## Optional prefixes and checksums

```rust
use base128_unicode_codec::*;

let options = EnvelopeOptions { prefix: true, checksum: true, ..Default::default() };
let wrapped = wrap(&encode(b"Hello"), options).unwrap();
let result = unwrap(&wrapped, options).unwrap();
assert_eq!(decode_with_options(&result.payload, DecodeOptions {
    alphabet: Some(&result.alphabet), ..Default::default()
}).unwrap(), b"Hello");
```

`wrap` validates an already encoded payload. Prefix and checksum are independent options, disabled by default. `unwrap` requires the explicitly selected shape and verifies checksums before returning `Unwrapped { payload, mode, alphabet }`. Without a prefix, omitted constraints mean binary/Compact. With a prefix, omitted mode/alphabet constraints are inferred; explicit constraints must match the header. For integers, set `mode: Some(Mode::Integer)` when wrapping and decode the returned payload with an integer decoder.

`EnvelopeOptions::accept_aliases` affects only payload decoding. Headers and checksums are always strict. Prefixes require a built-in alphabet; checksum-only envelopes also support custom alphabets that exclude middle dot. Wrappers buffer whole values. CRC32 detects accidental corruption, not malicious changes. See the [envelope specification](../../specs/envelope.md).

## Development

Use a stable Rust toolchain. From the repository root:

```sh
cargo test --manifest-path packages/rust/Cargo.toml --locked
cargo fmt --manifest-path packages/rust/Cargo.toml -- --check
cargo clippy --manifest-path packages/rust/Cargo.toml --all-targets -- -D warnings
cargo doc --manifest-path packages/rust/Cargo.toml --no-deps
```

Tests consume the shared Compact, Math, custom-alphabet, and envelope reference vectors; `serde_json` is a development dependency only. The repository's CLI remains Node.js-based and can be used independently of the Rust library.

## License

Apache-2.0; see [LICENSE](../../LICENSE).
