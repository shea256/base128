"""Dependency-free Unicode Base128 binary and integer encoders."""

from .alphabet import Alphabet, DEFAULT_ALPHABET, DEFAULT_ALPHABET_TEXT, TWO_BYTE_ALPHABET, TWO_BYTE_ALPHABET_TEXT, create_alphabet
from .binary import BinaryDecoder, BinaryEncoder, decode, encode
from .integer import decode_integer, encode_integer

__all__ = [
    "Alphabet", "DEFAULT_ALPHABET", "DEFAULT_ALPHABET_TEXT", "create_alphabet",
    "TWO_BYTE_ALPHABET", "TWO_BYTE_ALPHABET_TEXT",
    "BinaryEncoder", "BinaryDecoder", "encode", "decode",
    "encode_integer", "decode_integer",
]
from .envelope import wrap, unwrap, Unwrapped
__all__ += ['wrap', 'unwrap', 'Unwrapped']
