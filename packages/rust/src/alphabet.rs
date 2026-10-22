use crate::Error;
use std::{collections::HashMap, sync::OnceLock};

pub const COMPACT_ALPHABET_TEXT: &str = r##"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ΓΔΘΛΞΠΦΨΩαβγδεζηθικλμξπστφψω¥§©®¶÷"##;
pub const MATH_ALPHABET_TEXT: &str = r##"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ΓΔΘΛΞΠΦΨΩαβγδεζηθικλμξπστφψω∂∇∏∑√∫"##;
pub const DEFAULT_ALPHABET_TEXT: &str = COMPACT_ALPHABET_TEXT;

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
            COMPACT_ALPHABET_TEXT => Some(0),
            MATH_ALPHABET_TEXT => Some(1),
            _ => None,
        }
    }
    pub(crate) fn decoder_index(&self, aliases: bool) -> Result<HashMap<char, u8>, Error> {
        if !aliases {
            return Ok(self.indices.clone());
        }
        if self.id().is_none() {
            return Err(Error::AliasesRequireBuiltin);
        }
        let mut indices = compact_alphabet().indices.clone();
        indices.extend(math_alphabet().indices.iter().map(|(&c, &i)| (c, i)));
        Ok(indices)
    }
}
pub fn compact_alphabet() -> &'static Alphabet {
    static VALUE: OnceLock<Alphabet> = OnceLock::new();
    VALUE.get_or_init(|| Alphabet::new(COMPACT_ALPHABET_TEXT).expect("valid built-in alphabet"))
}
pub fn math_alphabet() -> &'static Alphabet {
    static VALUE: OnceLock<Alphabet> = OnceLock::new();
    VALUE.get_or_init(|| Alphabet::new(MATH_ALPHABET_TEXT).expect("valid built-in alphabet"))
}
pub fn default_alphabet() -> &'static Alphabet {
    compact_alphabet()
}

/// Defaults to Compact with strict character lookup.
#[derive(Debug, Clone, Copy, Default)]
pub struct DecodeOptions<'a> {
    pub alphabet: Option<&'a Alphabet>,
    pub accept_aliases: bool,
}
impl<'a> DecodeOptions<'a> {
    pub(crate) fn alphabet(self) -> &'a Alphabet {
        self.alphabet.unwrap_or_else(|| compact_alphabet())
    }
}
