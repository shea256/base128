//! Dependency-free Unicode Base128. Compact is the default; decoding is strict.
//!
//! ```
//! use base128_unicode_codec::{encode, decode, wrap, unwrap, EnvelopeOptions};
//! let text = encode(b"Hello");
//! assert_eq!(decode(&text).unwrap(), b"Hello");
//! let options = EnvelopeOptions { prefix: true, checksum: true, ..Default::default() };
//! let wrapped = wrap(&text, options).unwrap();
//! let result = unwrap(&wrapped, options).unwrap();
//! assert_eq!(result.payload, text);
//! ```
#![forbid(unsafe_code)]

mod alphabet;
mod binary;
mod binary_core;
mod envelope;
mod integer;
pub use alphabet::*;
pub use binary::*;
pub use envelope::*;
pub use integer::*;

/// Validation failures. No input is trimmed or normalized.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Error {
    InvalidAlphabet,
    InvalidSymbol(char),
    AliasesRequireBuiltin,
    InvalidLength,
    NonzeroPadding,
    Finalized,
    EmptyInteger,
    LeadingZero,
    InvalidDecimal,
    IntegerOverflow,
    SeparatorInAlphabet,
    PrefixRequiresBuiltin,
    InvalidEnvelope,
    InvalidHeader,
    UnsupportedVersion(u8),
    ReservedVersion,
    UnassignedMode(u8),
    UnassignedAlphabet(u16),
    AlphabetMismatch,
    ModeMismatch,
    InvalidChecksum,
    ChecksumMismatch,
}
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidSymbol(c) => write!(f, "Invalid Base128 character {c:?}"),
            Self::UnsupportedVersion(v) => write!(f, "Unsupported envelope version {v}"),
            Self::UnassignedMode(v) => write!(f, "Unassigned envelope mode {v}"),
            Self::UnassignedAlphabet(v) => write!(f, "Unassigned envelope alphabet {v}"),
            other => f.write_str(match other {
                Self::InvalidAlphabet => "Alphabet must contain 128 distinct Unicode scalar values",
                Self::AliasesRequireBuiltin => "Alias decoding requires Compact or Math",
                Self::InvalidLength => "Noncanonical binary length",
                Self::NonzeroPadding => "Nonzero trailing padding bits",
                Self::Finalized => "Stream is finalized",
                Self::EmptyInteger => "Encoded integer cannot be empty",
                Self::LeadingZero => "Noncanonical integer: leading zero digit",
                Self::InvalidDecimal => "Expected nonempty unsigned ASCII decimal digits",
                Self::IntegerOverflow => "Integer exceeds u128; use decode_integer_decimal",
                Self::SeparatorInAlphabet => "Envelope alphabet must exclude middle dot",
                Self::PrefixRequiresBuiltin => "Prefixes require a built-in alphabet",
                Self::InvalidEnvelope => "Invalid envelope identifier or field count",
                Self::InvalidHeader => "Invalid envelope header length",
                Self::ReservedVersion => "Reserved envelope version escape",
                Self::AlphabetMismatch => "Envelope alphabet does not match selected alphabet",
                Self::ModeMismatch => "Envelope mode does not match selected mode",
                Self::InvalidChecksum => "Checksum must encode four bytes in five symbols",
                Self::ChecksumMismatch => "Checksum mismatch",
                _ => unreachable!(),
            }),
        }
    }
}
impl std::error::Error for Error {}
