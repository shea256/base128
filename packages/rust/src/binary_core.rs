//! Numeric streaming transitions. Contracts live in verification/verus.
//! The verification runner inserts ghost annotations into these exact bodies.

/// Append one byte, emitting one or two seven-bit digits.
/// Requires bits <= 6 and buffer < 2^bits.
pub(crate) fn encode_step(buffer: u16, bits: u8, byte: u8) -> (u16, u8, u8, Option<u8>) {
    let combined = (buffer << 8) | (byte as u16);
    let remaining = bits + 1;
    let first = (combined >> remaining) as u8;
    if remaining == 7 {
        (0, 0, first, Some((combined & 127) as u8))
    } else {
        (combined & ((1u16 << remaining) - 1), remaining, first, None)
    }
}

/// Pad the final incomplete digit. Requires bits <= 6 and buffer < 2^bits.
pub(crate) fn encode_tail(buffer: u16, bits: u8) -> Option<u8> {
    if bits == 0 {
        None
    } else {
        Some((buffer << (7 - bits)) as u8)
    }
}

/// Append one seven-bit digit, emitting at most one byte.
/// Requires bits <= 7, buffer < 2^bits, and digit < 128.
pub(crate) fn decode_step(buffer: u16, bits: u8, digit: u8) -> (u16, u8, Option<u8>) {
    let combined = (buffer << 7) | (digit as u16);
    let total = bits + 7;
    if total >= 8 {
        let remaining = total - 8;
        (
            combined & ((1u16 << remaining) - 1),
            remaining,
            Some((combined >> remaining) as u8),
        )
    } else {
        (combined, total, None)
    }
}

/// Keep only the symbol-count residue needed for canonical length validation.
pub(crate) fn next_symbol_count(symbols_mod8: u8) -> u8 {
    (symbols_mod8 + 1) % 8
}

pub(crate) fn valid_length(symbols_mod8: u8) -> bool {
    symbols_mod8 != 1
}

pub(crate) fn valid_padding(buffer: u16) -> bool {
    buffer == 0
}
