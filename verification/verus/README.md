# Verus verification of the Rust numeric core

This pilot verifies the six numeric functions in
[`packages/rust/src/binary_core.rs`](../../packages/rust/src/binary_core.rs).
The production Rust streaming encoder and decoder call these functions. Verus
is a development tool only: the library still has no runtime dependencies.

## Checked properties

| Function / theorem | Contract |
| --- | --- |
| `encode_step` | For `bits <= 6` and `buffer < 2^bits`, emit one or two digits below 128, preserve the packed input value in output digits plus residual bits, and preserve the state bounds. |
| `encode_tail` | Emit nothing exactly when no bits remain; otherwise emit a digit below 128 with the residual value shifted left by `7 - bits` (zero padding). |
| `decode_step` | For `bits <= 7`, `buffer < 2^bits`, and a digit below 128, emit at most one byte, preserve the packed input value in that byte plus residual bits, and preserve the state bounds. |
| `next_symbol_count` | For a residue below eight, increment modulo eight and preserve its bound. |
| `valid_length`, `valid_padding` | Return precisely the rejection/acceptance predicates used by the decoder: residue is not one, and the residual buffer is zero. |
| `canonical_length` | For every natural symbol count `m`, `m % 8 != 1` iff `m = ceil(8 * floor(7*m/8) / 7)`, the published binary length rule. |

The executable functions are also checked for arithmetic underflow/overflow and
valid shift amounts under their preconditions. Conservation equations use
mathematical integers, not wrapping arithmetic. This is universal verification
over the stated inputs, rather than bounded sample testing.

## Production source connection and trust boundary

[`scripts/check-verus.py`](../../scripts/check-verus.py) reads the production
module afresh and inserts its signatures and executable bodies into
[`binary.rs.in`](binary.rs.in), which supplies contracts and preceding ghost
proof blocks. There is no separately maintained executable copy. The small
source reader accepts only the module's restricted numeric-function format and
requires exactly one signature/body slot for each of all six functions. It
rejects unsupported module syntax, missing slots, and leftover slots. Changing
the core requires rerunning verification.

The runner uses `--no-cheating`. Project proofs contain no assumed contracts,
`assume`, or `external_body` escapes. The `--check-mutations` option additionally
requires three altered executable bodies (incorrect byte packing, tail padding,
and length rejection) to fail their postconditions. Mutations exist only in
temporary generated files; production files and independent fixtures are never
rewritten by the runner.

Trust includes the source reader, Verus and its standard library specifications,
the SMT solver, and the Rust toolchain. These are not Lean-kernel-checked proofs.
See the [Verus trust documentation](https://verus-lang.github.io/verus/guide/tcb.html).

The callers' establishment of preconditions is **not yet verified**. In
particular, this pilot does not prove the public streaming loops, arbitrary
chunk-partition equivalence, lifecycle/error handling, symbol lookup, Unicode
handling, allocation, integers, envelopes, CRC32, I/O, or compiler correctness.
It does not prove an end-to-end refinement to the Lean model or correctness of
the JavaScript/Python implementations. Existing fixtures, streaming tests, and
[Lean conformance checks](../README.md) remain necessary.

## Reproduce

Install [rustup](https://rustup.rs/) and Python 3.10+. The exact verifier version
is in [`version.txt`](version.txt), its required compiler is in
[`rust-version.txt`](rust-version.txt), and release archive hashes are in
[`SHA256SUMS`](SHA256SUMS). From the repository root, on macOS or Linux:

```sh
# Choose arm64-macos, x86-macos, or x86-linux for your host.
platform=arm64-macos
version=$(cat verification/verus/version.txt)
archive="verus-${version}-${platform}.zip"
rustup toolchain install "$(cat verification/verus/rust-version.txt)" --profile minimal
mkdir -p .tmp/verus
curl --fail --location --output ".tmp/verus/$archive" \
  "https://github.com/verus-lang/verus/releases/download/release/$version/$archive"
cp verification/verus/SHA256SUMS .tmp/verus/SHA256SUMS
(cd .tmp/verus && shasum -a 256 --check --ignore-missing SHA256SUMS)
unzip -q ".tmp/verus/$archive" -d .tmp/verus
python3 scripts/check-verus.py --verus ".tmp/verus/verus-$platform/verus" --check-mutations
```

Alternatively put the pinned `verus` executable on `PATH` or set `VERUS` to its
path. The runner rejects a different verifier version. The normal `npm test`
and Cargo commands do not require Verus. CI runs this check in a separate job,
with checksum verification and a ten-minute timeout.

The pilot currently reports **18 verified obligations, zero errors**, followed
by three rejected mutations. Follow-up work should prove the caller invariants
and sequence-level streaming composition, then connect that specification to
Lean's canonical codec. A proof of the numeric helpers alone must not be
described as verification of the whole Rust library.
