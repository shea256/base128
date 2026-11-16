use crate::Error;
use std::{collections::HashMap, sync::OnceLock};

pub const DEFAULT_ALPHABET_TEXT: &str = r##"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZαβγδεζηθικλμξπστφψωΓΔΘΛΞΠΣΦΨΩ!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~¥÷∇√∫"##;

/// Immutable, validated, ordered mapping of Unicode scalar values to digits.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Alphabet {
    text: String,
    symbols: Vec<char>,
    indices: HashMap<char, u8>,
}
impl Alphabet {
    pub fn new(text: &str) -> Result<Self, Error> {
        let symbols: Vec<_> = text.chars().collect();
        if symbols.len() != 128 {
            return Err(Error::InvalidAlphabet);
        }
        let indices: HashMap<_, _> = symbols
            .iter()
            .enumerate()
            .map(|(i, &c)| (c, i as u8))
            .collect();
        if indices.len() != 128 {
            return Err(Error::InvalidAlphabet);
        }
        Ok(Self {
            text: text.into(),
            symbols,
            indices,
        })
    }
    pub fn text(&self) -> &str {
        &self.text
    }
    pub fn symbol_at(&self, index: usize) -> Option<char> {
        self.symbols.get(index).copied()
    }
    pub fn index_of(&self, symbol: char) -> Result<u8, Error> {
        self.indices
            .get(&symbol)
            .copied()
            .ok_or(Error::InvalidSymbol(symbol))
    }
    pub(crate) fn digit(&self, index: u8) -> char {
        self.symbols[index as usize]
    }
    pub(crate) fn id(&self) -> Option<u8> {
        match self.text() {
            DEFAULT_ALPHABET_TEXT => Some(0),
            _ => None,
        }
    }
    pub(crate) fn decoder_index(&self) -> HashMap<char, u8> {
        self.indices.clone()
    }
}

pub fn default_alphabet() -> &'static Alphabet {
    static VALUE: OnceLock<Alphabet> = OnceLock::new();
    VALUE.get_or_init(|| Alphabet::new(DEFAULT_ALPHABET_TEXT).expect("valid built-in alphabet"))
}
/// Defaults to the official alphabet with strict character lookup.
#[derive(Debug, Clone, Copy, Default)]
pub struct DecodeOptions<'a> {
    pub alphabet: Option<&'a Alphabet>,
}
impl<'a> DecodeOptions<'a> {
    pub(crate) fn alphabet(self) -> &'a Alphabet {
        self.alphabet.unwrap_or_else(|| default_alphabet())
    }
}
