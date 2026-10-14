"""An immutable, validated, 128-symbol Unicode alphabet."""

from types import MappingProxyType

DEFAULT_ALPHABET_TEXT = (
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    + "".join(chr(i) for i in range(33, 127) if not chr(i).isalnum())
    + "ΓΔΘΛΞΠΦΨΩ"
    + "αβγδεζηθικλμξπστφψω"
    + "∑∏∫∂∇∞"
)


class Alphabet:
    """128 distinct Unicode scalar values in canonical digit order."""

    __slots__ = ("_text", "_symbols", "_indices")

    def __init__(self, text: str) -> None:
        if not isinstance(text, str):
            raise TypeError("Alphabet must be a string")
        if len(text) != 128:
            raise ValueError(
                f"Alphabet must contain exactly 128 Unicode code points; got {len(text)}"
            )
        if any(0xD800 <= ord(c) <= 0xDFFF for c in text):
            raise ValueError("Alphabet contains an unpaired surrogate")
        if len(set(text)) != 128:
            raise ValueError("Alphabet contains duplicate symbols")
        object.__setattr__(self, "_text", text)
        object.__setattr__(self, "_symbols", tuple(text))
        object.__setattr__(
            self, "_indices", MappingProxyType({c: i for i, c in enumerate(text)})
        )

    def __setattr__(self, name: str, value: object) -> None:
        raise AttributeError("Alphabet instances are immutable")

    @property
    def text(self) -> str:
        return self._text

    def __len__(self) -> int:
        return 128

    def symbol_at(self, index: int) -> str:
        if not isinstance(index, int) or not 0 <= index < 128:
            raise ValueError("Base128 digit must be an integer from 0 to 127")
        return self._symbols[index]

    def index_of(self, symbol: str) -> int:
        try:
            return self._indices[symbol]
        except KeyError as exc:
            raise ValueError(f"Invalid Base128 character {symbol!r}") from exc


DEFAULT_ALPHABET = Alphabet(DEFAULT_ALPHABET_TEXT)


def create_alphabet(text: str) -> Alphabet:
    return Alphabet(text)


def resolve_alphabet(alphabet: Alphabet | str | None) -> Alphabet:
    if alphabet is None:
        return DEFAULT_ALPHABET
    if isinstance(alphabet, Alphabet):
        return alphabet
    return Alphabet(alphabet)
