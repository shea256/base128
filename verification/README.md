# Lean specification and verification

This directory contains an executable Lean 4 specification of the **bare, strict binary and integer codecs**, with kernel-checked proofs. It is a specification plus conformance tests, not a proof of the JavaScript, Python, or Rust source code.

Lean is pinned in [lean/lean-toolchain](lean/lean-toolchain). The project uses Lean's bundled standard library and JSON support, with no Mathlib or other Lake dependencies. Lean is a development tool only; library users do not need it.

## What is proved

| Property | Theorem |
| --- | --- |
| Every finite byte sequence decodes after encoding, preserving leading zero bytes | `Base128.decode_encode` |
| Every accepted strict binary payload re-encodes to its exact original digits | `Base128.encode_decode` |
| Decoding returns only byte values (0–255) | `Base128.decode_valid` |
| Encoding produces only seven-bit digits (0–127) | `Base128.encode_valid` |
| Distinct byte sequences cannot have the same encoding | `Base128.encode_injective` |
| Every natural number round-trips, with no fixed-width limit | `Base128.decodeInteger_encodeInteger` |
| Every accepted strict integer payload has its canonical spelling | `Base128.encodeInteger_decodeInteger` |
| Integer encodings are nonempty; positive integers have a nonzero most-significant digit | `Base128.integerDigits_nonempty`, `Base128.integerDigits_last_nonzero` |
| Binary round-trip and canonical spelling survive any invertible alphabet mapping | `Base128.decodeSymbols_encodeSymbols`, `Base128.encodeSymbols_decodeSymbols` |

The binary round-trip theorem assumes every input element is a byte. Alphabet theorems assume that reading a written digit recovers that digit and that writing an accepted symbol's digit recovers that symbol. These are strict, invertible mappings; alias decoding is not covered. The abstract alphabet proof does not itself establish that the production Unicode tables satisfy these laws.

All eleven listed theorems are audited by [lean/Audit.lean](lean/Audit.lean). The conformance runner rejects dependencies on any axiom except Lean's standard `propext`, `Classical.choice`, and `Quot.sound`. This rejects unfinished proofs (`sorryAx`), extra assumed axioms, and native-computation axioms. The Lean build also treats warnings as errors.

## How the model works

[Binary.lean](lean/Base128/Binary.lean) represents a byte sequence as a natural number **and an explicit byte count**. It appends the necessary zero bits, then emits exactly `ceil(8 × byte_count / 7)` digits, most significant first. Keeping the count preserves leading zero bytes and distinguishes them from empty input. Generic fixed-width radix lemmas establish both directions of conversion and the necessary bounds.

The reference decoder recovers candidate bytes and accepts them only if re-encoding produces the received digits exactly. This characterizes the encoder's image and rejects alternate lengths, out-of-range digits, and nonzero tail bits. Production decoders check lengths and padding directly. Their equivalence to the reference is **tested, not proved**.

[Integer.lean](lean/Base128/Integer.lean) uses recursive division by 128 to produce minimal positional digits; zero is one zero digit. [Alphabet.lean](lean/Base128/Alphabet.lean) proves that strict invertible symbol mappings preserve the binary laws.

[Main.lean](lean/Main.lean) exposes these same definitions as a JSON batch executable. The JSON adapter and native compilation are part of the testing path, not the proof boundary. The model uses arbitrary-size natural numbers and whole lists; it is intended as a correctness reference, not a replacement for the streaming implementations.

## Implementation conformance

Run from the repository root with the project's patched Node version, Python 3.10+, Rust/Cargo, and Lean/Lake available on `PATH`:

```sh
npm ci
python3 scripts/check-lean.py
```

Install Lean using the [official installation instructions](https://lean-lang.org/install/). With elan installed, Lake selects the pinned version when run inside `verification/lean`. To check only the proofs:

```sh
cd verification/lean
lake build
lake env lean -DwarningAsError=true Audit.lean
```

The full runner builds the Lean reference, audits the theorem dependencies, builds JS and a test-only Rust adapter, and compares the actual APIs of all three production libraries against Lean. It checks:

- The independently generated Compact, Math, and custom-alphabet fixtures already in `specs/`, without rewriting them.
- Every byte value, empty and zero-filled inputs, deterministic random byte sequences through 512 bytes, and integers through 2,048 bits.
- All one- and two-symbol binary strings, valid long payloads, malformed lengths and padding, and empty/leading-zero integer encodings.
- Compact, Math, reversed Compact, and a custom alphabet of 128 supplementary Unicode scalar values.

Currently, 18,301 cases per alphabet are compared in each of three libraries: 219,612 implementation comparisons. Generated cases use a fixed seed for reproducibility. Inputs supplied to the JSON adapters are controlled test data, not an exposed service.

The `lean` CI job runs independently of the Node/Python matrix and Rust tests, with a ten-minute limit to allow the initial toolchain download. It builds proof artifacts afresh instead of restoring a `.lake` build cache. The ordinary `npm test` command remains usable without Lean or Rust installed.

## Limits and future work

These Lean proofs do not verify production source, streaming state machines, UTF-8 parsing, alias handling, envelopes, headers, CRC32, file I/O, resource limits, or compiler correctness. Existing tests continue to cover those features. Finite conformance tests can discover disagreements but cannot establish implementation equivalence for every input.

A separate [Verus pilot](verus/README.md) verifies the actual Rust numeric transition functions under explicit state invariants, including bounds, packed-bit conservation, and tail padding. It also proves the arithmetic equivalence of the symbol-count residue rule and the published length equation. This does not yet prove the public streaming callers or refinement to this Lean model; the Lean-to-production connection remains conformance testing.

Possible next steps are a proof that direct length/padding checks are equivalent to the canonical reference decoder, refinement proofs for a production algorithm, and separate envelope verification. Keep any future verification claims specific to the theorems actually checked.
