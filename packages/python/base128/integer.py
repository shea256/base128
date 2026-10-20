"""Canonical positional Base128 conversion for nonnegative Python integers."""

from .alphabet import Alphabet, resolve_alphabet, resolve_decoder_index


def encode_integer(value: int, *, alphabet: Alphabet | str | None = None) -> str:
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError("Integer input must be an int")
    if value < 0:
        raise ValueError("Integer input must be nonnegative")
    abc = resolve_alphabet(alphabet)
    if value == 0:
        return abc.symbol_at(0)
    result = []
    while value:
        result.append(abc.symbol_at(value & 127))
        value >>= 7
    return "".join(reversed(result))


def decode_integer(text: str, *, alphabet: Alphabet | str | None = None, accept_aliases: bool = False) -> int:
    if not isinstance(text, str):
        raise TypeError("Encoded integer must be a string")
    abc = resolve_alphabet(alphabet)
    index_of = resolve_decoder_index(abc, accept_aliases)
    if not text:
        raise ValueError("Encoded integer cannot be empty")
    if len(text) > 1 and text[0] == abc.symbol_at(0):
        raise ValueError("Noncanonical integer: leading zero digit")
    value = 0
    for digit in text:
        value = (value << 7) | index_of(digit)
    return value
