# Contributing to Base128

Thanks for contributing. Please keep published encoding formats **backward-compatible**. Changing alphabet order, bit order, trailing-bit rules, integer digit ordering, or canonical validation behavior requires a separately documented format version.

## Pull request checklist

1. Update or add tests for any behavioral change.
2. Run `npm test` (a patched Node.js release (22.23.4+ on 22.x, 24.22.1+ on 24.x, or 26.12.1+ on 26.x), Python 3.10+; TypeScript compiler from `npm install`).
3. If changing the specification, update `specs/encoding.md` and/or `specs/envelope.md`, test vectors, and all three language implementations as appropriate.
4. Avoid runtime dependencies unless their benefit clearly outweighs additional complexity.
5. Write changes in an idiomatic style for each language; preserve TypeScript strict type-checking.

Use the Apache-2.0 license for contributions to this repository. Do not include third-party code with incompatible licensing.

The test runner discovers Python 3.10+ as `python3`, `python`, or Windows `py -3`.
Set `PYTHON` to an executable path to select a specific interpreter. See
[AGENTS.md](AGENTS.md) for repository layout, generated-file rules, and focused
checks, and [the CLI reference](docs/cli.md) for automation-friendly usage.

Rust changes also require `cargo test --manifest-path packages/rust/Cargo.toml --locked`,
`cargo fmt --manifest-path packages/rust/Cargo.toml -- --check`, and
`cargo clippy --manifest-path packages/rust/Cargo.toml --all-targets -- -D warnings`.
Rust uses the shared codec and envelope fixtures. It has no runtime dependencies.
