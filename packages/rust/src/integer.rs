use crate::{compact_alphabet, Alphabet, DecodeOptions, Error};

pub(crate) fn integer_digits(text: &str, options: DecodeOptions<'_>) -> Result<Vec<u8>, Error> {
    let indices = options.alphabet().decoder_index(options.accept_aliases)?;
    let digits: Vec<_> = text
        .chars()
        .map(|c| indices.get(&c).copied().ok_or(Error::InvalidSymbol(c)))
        .collect::<Result<_, _>>()?;
    if digits.is_empty() {
        return Err(Error::EmptyInteger);
    }
    if digits.len() > 1 && digits[0] == 0 {
        return Err(Error::LeadingZero);
    }
    Ok(digits)
}
pub fn encode_integer(value: u128) -> String {
    encode_integer_with_alphabet(value, compact_alphabet())
}
pub fn encode_integer_with_alphabet(mut value: u128, alphabet: &Alphabet) -> String {
    let mut digits = Vec::new();
    loop {
        digits.push(alphabet.digit((value & 127) as u8));
        value >>= 7;
        if value == 0 {
            break;
        }
    }
    digits.into_iter().rev().collect()
}
pub fn decode_integer(text: &str) -> Result<u128, Error> {
    decode_integer_with_options(text, DecodeOptions::default())
}
pub fn decode_integer_with_options(text: &str, options: DecodeOptions<'_>) -> Result<u128, Error> {
    integer_digits(text, options)?
        .into_iter()
        .try_fold(0u128, |n, digit| {
            n.checked_mul(128)
                .and_then(|n| n.checked_add(u128::from(digit)))
                .ok_or(Error::IntegerOverflow)
        })
}
/// Arbitrary-precision unsigned ASCII decimal input. Leading decimal zeros are
/// accepted and canonicalized. Signs, whitespace, and non-ASCII digits are rejected.
pub fn encode_integer_decimal(decimal: &str) -> Result<String, Error> {
    encode_integer_decimal_with_alphabet(decimal, compact_alphabet())
}
pub fn encode_integer_decimal_with_alphabet(
    decimal: &str,
    alphabet: &Alphabet,
) -> Result<String, Error> {
    if decimal.is_empty() || !decimal.bytes().all(|b| b.is_ascii_digit()) {
        return Err(Error::InvalidDecimal);
    }
    // Little-endian radix-128 limbs; no fixed-width integer limit.
    let mut limbs = vec![0u8];
    for digit in decimal.bytes() {
        let mut carry = u16::from(digit - b'0');
        for limb in &mut limbs {
            let n = u16::from(*limb) * 10 + carry;
            *limb = (n & 127) as u8;
            carry = n >> 7;
        }
        if carry != 0 {
            limbs.push(carry as u8);
        }
    }
    Ok(limbs.into_iter().rev().map(|d| alphabet.digit(d)).collect())
}
/// Returns canonical decimal text for any nonnegative integer size.
pub fn decode_integer_decimal(text: &str) -> Result<String, Error> {
    decode_integer_decimal_with_options(text, DecodeOptions::default())
}
pub fn decode_integer_decimal_with_options(
    text: &str,
    options: DecodeOptions<'_>,
) -> Result<String, Error> {
    let mut decimal = vec![0u8];
    for digit in integer_digits(text, options)? {
        let mut carry = u16::from(digit);
        for limb in &mut decimal {
            let n = u16::from(*limb) * 128 + carry;
            *limb = (n % 10) as u8;
            carry = n / 10;
        }
        while carry != 0 {
            decimal.push((carry % 10) as u8);
            carry /= 10;
        }
    }
    Ok(decimal
        .into_iter()
        .rev()
        .map(|d| char::from(b'0' + d))
        .collect())
}
