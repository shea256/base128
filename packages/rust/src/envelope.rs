use crate::*;

/// Binary bytes or a nonnegative integer; these encodings are not interchangeable.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum Mode {
    #[default]
    Binary,
    Integer,
}

/// Wrapper shape is explicit. Omitted mode/alphabet constraints are inferred from
/// a prefix, or default to binary/Compact when there is no prefix.
#[derive(Debug, Clone, Copy, Default)]
pub struct EnvelopeOptions<'a> {
    pub alphabet: Option<&'a Alphabet>,
    pub mode: Option<Mode>,
    pub prefix: bool,
    pub checksum: bool,
    pub accept_aliases: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Unwrapped {
    pub payload: String,
    pub mode: Mode,
    pub alphabet: Alphabet,
}

fn validate(payload: &str, alphabet: &Alphabet, mode: Mode, aliases: bool) -> Result<(), Error> {
    let options = DecodeOptions {
        alphabet: Some(alphabet),
        accept_aliases: aliases,
    };
    match mode {
        Mode::Binary => {
            decode_with_options(payload, options)?;
        }
        Mode::Integer => {
            crate::integer::integer_digits(payload, options)?;
        }
    }
    Ok(())
}
fn check_separator(alphabet: &Alphabet, options: EnvelopeOptions<'_>) -> Result<(), Error> {
    if (options.prefix || options.checksum) && alphabet.text().contains('·') {
        return Err(Error::SeparatorInAlphabet);
    }
    Ok(())
}
fn crc32(bytes: &[u8]) -> u32 {
    let mut crc = u32::MAX;
    for &byte in bytes {
        crc ^= u32::from(byte);
        for _ in 0..8 {
            crc = (crc >> 1) ^ (0xedb88320 & 0u32.wrapping_sub(crc & 1));
        }
    }
    !crc
}
fn parse_header(header: &str) -> Result<(Mode, &'static Alphabet), Error> {
    let digits: Vec<_> = header
        .chars()
        .map(|c| compact_alphabet().index_of(c))
        .collect::<Result<_, _>>()?;
    let version = *digits.first().ok_or(Error::InvalidHeader)?;
    match version {
        0 => {}
        127 => return Err(Error::ReservedVersion),
        v => return Err(Error::UnsupportedVersion(v)),
    }
    let config = *digits.get(1).ok_or(Error::InvalidHeader)?;
    let field = config >> 3;
    let id = if field == 15 {
        if digits.len() != 3 {
            return Err(Error::InvalidHeader);
        }
        15 + u16::from(digits[2])
    } else {
        if digits.len() != 2 {
            return Err(Error::InvalidHeader);
        }
        u16::from(field)
    };
    let mode = match config & 7 {
        0 => Mode::Binary,
        1 => Mode::Integer,
        v => return Err(Error::UnassignedMode(v)),
    };
    let alphabet = match id {
        0 => compact_alphabet(),
        1 => math_alphabet(),
        v => return Err(Error::UnassignedAlphabet(v)),
    };
    Ok((mode, alphabet))
}

/// Validate and optionally prefix/checksum an already encoded payload.
pub fn wrap(payload: &str, options: EnvelopeOptions<'_>) -> Result<String, Error> {
    let alphabet = options.alphabet.unwrap_or_else(|| compact_alphabet());
    let mode = options.mode.unwrap_or_default();
    check_separator(alphabet, options)?;
    validate(payload, alphabet, mode, options.accept_aliases)?;
    let mut body = if options.prefix {
        let id = alphabet.id().ok_or(Error::PrefixRequiresBuiltin)?;
        let config = (id << 3) | u8::from(mode == Mode::Integer);
        format!("b128·0{}·{payload}", compact_alphabet().digit(config))
    } else {
        payload.to_owned()
    };
    if options.checksum {
        let checksum = encode_with_alphabet(&crc32(body.as_bytes()).to_be_bytes(), alphabet);
        body.push('·');
        body.push_str(&checksum);
    }
    Ok(body)
}

/// Enforce the requested wrapper shape and verify the checksum before returning.
/// No trimming, normalization, or automatic wrapper detection is performed.
pub fn unwrap(text: &str, options: EnvelopeOptions<'_>) -> Result<Unwrapped, Error> {
    let mut alphabet = options.alphabet.unwrap_or_else(|| compact_alphabet());
    let mut mode = options.mode.unwrap_or_default();
    let payload;
    let mut checksum_text = None;
    if options.prefix || options.checksum {
        let fields: Vec<_> = text.split('·').collect();
        let count = 1 + 2 * usize::from(options.prefix) + usize::from(options.checksum);
        if fields.len() != count {
            return Err(Error::InvalidEnvelope);
        }
        if options.prefix {
            if fields[0] != "b128" {
                return Err(Error::InvalidEnvelope);
            }
            let (header_mode, header_alphabet) = parse_header(fields[1])?;
            if options.mode.is_some_and(|m| m != header_mode) {
                return Err(Error::ModeMismatch);
            }
            if options.alphabet.is_some_and(|a| a != header_alphabet) {
                return Err(Error::AlphabetMismatch);
            }
            mode = header_mode;
            alphabet = header_alphabet;
            payload = fields[2];
        } else {
            payload = fields[0];
        }
        if options.checksum {
            checksum_text = fields.last().copied();
        }
    } else {
        payload = text;
    }
    check_separator(alphabet, options)?;
    if let Some(checksum) = checksum_text {
        if checksum.chars().count() != 5 {
            return Err(Error::InvalidChecksum);
        }
        let bytes = decode_with_options(
            checksum,
            DecodeOptions {
                alphabet: Some(alphabet),
                accept_aliases: false,
            },
        )?;
        let body = text.rsplit_once('·').ok_or(Error::InvalidEnvelope)?.0;
        if bytes != crc32(body.as_bytes()).to_be_bytes() {
            return Err(Error::ChecksumMismatch);
        }
    }
    validate(payload, alphabet, mode, options.accept_aliases)?;
    Ok(Unwrapped {
        payload: payload.into(),
        mode,
        alphabet: alphabet.clone(),
    })
}

#[cfg(test)]
mod tests {
    #[test]
    fn standard_crc_check() {
        assert_eq!(super::crc32(b"123456789"), 0xcbf43926);
    }
}
