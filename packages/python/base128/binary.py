"""Canonical MSB-first 7-bit Base128 binary encoding, including streaming."""

from .alphabet import Alphabet, resolve_alphabet


class BinaryEncoder:
    def __init__(self, alphabet: Alphabet | str | None = None) -> None:
        self._alphabet = resolve_alphabet(alphabet)
        self._buffer = 0
        self._bits = 0
        self._finished = False

    def write(self, data: bytes | bytearray | memoryview) -> str:
        if self._finished:
            raise ValueError("Encoder is finalized")
        try:
            byteview = memoryview(data).cast("B")
        except (TypeError, ValueError) as exc:
            raise TypeError("Input must be bytes-like") from exc

        symbols = []
        for byte in byteview:
            self._buffer = (self._buffer << 8) | byte
            self._bits += 8
            while self._bits >= 7:
                self._bits -= 7
                symbols.append(self._alphabet.symbol_at((self._buffer >> self._bits) & 127))
                self._buffer &= (1 << self._bits) - 1
        return "".join(symbols)

    def finish(self) -> str:
        if self._finished:
            raise ValueError("Encoder is already finalized")
        self._finished = True
        if not self._bits:
            return ""
        return self._alphabet.symbol_at(self._buffer << (7 - self._bits))


class BinaryDecoder:
    def __init__(self, alphabet: Alphabet | str | None = None) -> None:
        self._alphabet = resolve_alphabet(alphabet)
        self._buffer = 0
        self._bits = 0
        self._symbols = 0
        self._bytes = 0
        self._finished = False

    def write(self, text: str) -> bytes:
        if self._finished:
            raise ValueError("Decoder is finalized")
        if not isinstance(text, str):
            raise TypeError("Encoded input must be a string")
        out = bytearray()
        for symbol in text:
            digit = self._alphabet.index_of(symbol)
            self._symbols += 1
            self._buffer = (self._buffer << 7) | digit
            self._bits += 7
            if self._bits >= 8:
                self._bits -= 8
                out.append((self._buffer >> self._bits) & 255)
                self._buffer &= (1 << self._bits) - 1
                self._bytes += 1
        return bytes(out)

    def finish(self) -> None:
        if self._finished:
            raise ValueError("Decoder is already finalized")
        self._finished = True
        if (self._bytes * 8 + 6) // 7 != self._symbols:
            raise ValueError("Noncanonical Base128 binary length")
        if self._buffer != 0:
            raise ValueError("Nonzero trailing padding bits")


def encode(data: bytes | bytearray | memoryview, *, alphabet: Alphabet | str | None = None) -> str:
    encoder = BinaryEncoder(alphabet)
    return encoder.write(data) + encoder.finish()


def decode(text: str, *, alphabet: Alphabet | str | None = None) -> bytes:
    decoder = BinaryDecoder(alphabet)
    result = decoder.write(text)
    decoder.finish()
    return result
