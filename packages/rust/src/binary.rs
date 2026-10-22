use crate::{compact_alphabet, Alphabet, DecodeOptions, Error};
use std::collections::HashMap;

/// MSB-first streaming byte encoder. Call finish exactly once to emit tail bits.
pub struct BinaryEncoder {
    alphabet: Alphabet,
    buffer: u16,
    bits: u8,
    finished: bool,
}
impl Default for BinaryEncoder {
    fn default() -> Self {
        Self::new(compact_alphabet())
    }
}
impl BinaryEncoder {
    pub fn new(alphabet: &Alphabet) -> Self {
        Self {
            alphabet: alphabet.clone(),
            buffer: 0,
            bits: 0,
            finished: false,
        }
    }
    pub fn write(&mut self, bytes: &[u8]) -> Result<String, Error> {
        if self.finished {
            return Err(Error::Finalized);
        }
        let mut out = String::new();
        for &byte in bytes {
            self.buffer = (self.buffer << 8) | u16::from(byte);
            self.bits += 8;
            while self.bits >= 7 {
                self.bits -= 7;
                out.push(
                    self.alphabet
                        .digit(((self.buffer >> self.bits) & 127) as u8),
                );
                self.buffer &= (1 << self.bits) - 1;
            }
        }
        Ok(out)
    }
    pub fn finish(&mut self) -> Result<String, Error> {
        if self.finished {
            return Err(Error::Finalized);
        }
        self.finished = true;
        Ok(if self.bits == 0 {
            String::new()
        } else {
            self.alphabet
                .digit((self.buffer << (7 - self.bits)) as u8)
                .to_string()
        })
    }
}

/// Streaming decoder accepting UTF-8 strings. Chunks must end on character boundaries.
/// Output is provisional until finish validates length and padding. A write error
/// invalidates the decoder; start a new instance after an error.
pub struct BinaryDecoder {
    indices: HashMap<char, u8>,
    buffer: u16,
    bits: u8,
    symbols_mod8: u8,
    finished: bool,
}
impl BinaryDecoder {
    pub fn new(options: DecodeOptions<'_>) -> Result<Self, Error> {
        Ok(Self {
            indices: options.alphabet().decoder_index(options.accept_aliases)?,
            buffer: 0,
            bits: 0,
            symbols_mod8: 0,
            finished: false,
        })
    }
    pub fn write(&mut self, text: &str) -> Result<Vec<u8>, Error> {
        if self.finished {
            return Err(Error::Finalized);
        }
        let mut out = Vec::new();
        for c in text.chars() {
            let digit = match self.indices.get(&c) {
                Some(&digit) => digit,
                None => {
                    self.finished = true;
                    return Err(Error::InvalidSymbol(c));
                }
            };
            self.symbols_mod8 = (self.symbols_mod8 + 1) % 8;
            self.buffer = (self.buffer << 7) | u16::from(digit);
            self.bits += 7;
            if self.bits >= 8 {
                self.bits -= 8;
                out.push((self.buffer >> self.bits) as u8);
                self.buffer &= (1 << self.bits) - 1;
            }
        }
        Ok(out)
    }
    pub fn finish(&mut self) -> Result<(), Error> {
        if self.finished {
            return Err(Error::Finalized);
        }
        self.finished = true;
        if self.symbols_mod8 == 1 {
            return Err(Error::InvalidLength);
        }
        if self.buffer != 0 {
            return Err(Error::NonzeroPadding);
        }
        Ok(())
    }
}
pub fn encode(bytes: &[u8]) -> String {
    encode_with_alphabet(bytes, compact_alphabet())
}
pub fn encode_with_alphabet(bytes: &[u8], alphabet: &Alphabet) -> String {
    let mut encoder = BinaryEncoder::new(alphabet);
    let mut out = encoder.write(bytes).expect("fresh encoder");
    out.push_str(&encoder.finish().expect("fresh encoder"));
    out
}
pub fn decode(text: &str) -> Result<Vec<u8>, Error> {
    decode_with_options(text, DecodeOptions::default())
}
pub fn decode_with_options(text: &str, options: DecodeOptions<'_>) -> Result<Vec<u8>, Error> {
    let mut decoder = BinaryDecoder::new(options)?;
    let out = decoder.write(text)?;
    decoder.finish()?;
    Ok(out)
}
