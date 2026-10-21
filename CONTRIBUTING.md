# Contributing to Base128

Thanks for contributing. Please keep published encoding formats **backward-compatible**. Changing alphabet order, bit order, trailing-bit rules, integer digit ordering, or canonical validation behavior requires a separately documented format version.

## Pull request checklist

1. Update or add tests for any behavioral change.
2. Run `npm test` (Node.js 20+, Python 3.10+; TypeScript compiler from `npm install`).
3. If changing the specification, update `specs/encoding.md` and/or `specs/envelope.md`, test vectors, and both language implementations as appropriate.
4. Avoid runtime dependencies unless their benefit clearly outweighs additional complexity.
5. Write changes in an idiomatic style for each language; preserve TypeScript strict type-checking.

Use the Apache-2.0 license for contributions to this repository. Do not include third-party code with incompatible licensing.

The test runner discovers Python 3.10+ as `python3`, `python`, or Windows `py -3`.
Set `PYTHON` to an executable path to select a specific interpreter. See
[AGENTS.md](AGENTS.md) for repository layout, generated-file rules, and focused
checks, and [the CLI reference](docs/cli.md) for automation-friendly usage.
