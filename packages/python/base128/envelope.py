"""Optional middle-dot envelopes for already encoded payloads."""
from dataclasses import dataclass
import zlib

from .alphabet import Alphabet, COMPACT_ALPHABET, MATH_ALPHABET, resolve_alphabet
from .binary import encode, decode
from .integer import decode_integer


# Fixed wire alphabet, independent of the configured payload alphabet.
_HEADER_ALPHABET = Alphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    + ''.join(chr(i) for i in range(33, 127) if not chr(i).isalnum())
    + 'ΓΔΘΛΞΠΦΨΩαβγδεζηθικλμξπστφψω¥§©®¶÷'
)


def _parse_header(text):
    if not text:
        raise ValueError('Missing envelope version')
    version = _HEADER_ALPHABET.index_of(text[0])
    if version == 127:
        raise ValueError('Reserved envelope version escape')
    if version != 0:
        raise ValueError('Unsupported envelope version')
    if len(text) < 2:
        raise ValueError('Missing envelope configuration')
    config = _HEADER_ALPHABET.index_of(text[1])
    mode, identifier = config & 7, config >> 3
    if len(text) != (3 if identifier == 15 else 2):
        raise ValueError('Invalid envelope header length')
    if identifier == 15:
        identifier = 15 + _HEADER_ALPHABET.index_of(text[2])
    if mode > 1:
        raise ValueError('Unassigned envelope mode')
    return ('binary' if mode == 0 else 'integer'), identifier


@dataclass(frozen=True)
class Unwrapped:
    payload: str
    mode: str
    alphabet: Alphabet


def _options(mode, prefix, checksum, accept_aliases):
    if mode is not None and mode not in ('binary', 'integer'):
        raise ValueError('Envelope mode must be binary or integer')
    for name, value in [('prefix', prefix), ('checksum', checksum), ('accept_aliases', accept_aliases)]:
        if not isinstance(value, bool):
            raise TypeError(f'{name} must be boolean')


def _validate(payload, mode, alphabet, accept_aliases):
    operation = decode if mode == 'binary' else decode_integer
    operation(payload, alphabet=alphabet, accept_aliases=accept_aliases)


def _check_alphabet(alphabet, prefix, checksum):
    if (prefix or checksum) and '·' in alphabet.text:
        raise ValueError('Envelope alphabet must exclude middle dot (U+00B7)')


def _checksum(body):
    return zlib.crc32(body.encode('utf-8')).to_bytes(4, 'big')


def wrap(payload: str, *, mode: str = 'binary', alphabet: Alphabet | str | None = None,
         prefix: bool = False, checksum: bool = False, accept_aliases: bool = False) -> str:
    """Wrap validated encoded text; bare output remains the default."""
    if not isinstance(payload, str):
        raise TypeError('Encoded payload must be a string')
    _options(mode, prefix, checksum, accept_aliases)
    if mode is None:
        raise ValueError('Envelope mode must be binary or integer')
    abc = resolve_alphabet(alphabet)
    _check_alphabet(abc, prefix, checksum)
    _validate(payload, mode, abc, accept_aliases)
    body = payload
    if prefix:
        if abc.text == COMPACT_ALPHABET.text:
            identifier = 0
        elif abc.text == MATH_ALPHABET.text:
            identifier = 1
        else:
            raise ValueError('Prefixes require a built-in alphabet')
        config = (identifier << 3) | (0 if mode == "binary" else 1)
        body = f'b128·0{_HEADER_ALPHABET.symbol_at(config)}·{payload}'
    return body + '·' + encode(_checksum(body), alphabet=abc) if checksum else body


def unwrap(text: str, *, mode: str | None = None, alphabet: Alphabet | str | None = None,
           prefix: bool = False, checksum: bool = False, accept_aliases: bool = False) -> Unwrapped:
    """Require the selected wrapper shape and verify before returning payload."""
    if not isinstance(text, str):
        raise TypeError('Encoded envelope must be a string')
    _options(mode, prefix, checksum, accept_aliases)
    abc = resolve_alphabet(alphabet)
    selected_mode = mode or 'binary'
    if not prefix and not checksum:
        _validate(text, selected_mode, abc, accept_aliases)
        return Unwrapped(text, selected_mode, abc)
    _check_alphabet(abc, prefix, checksum)
    fields = text.split('·')
    if len(fields) != 1 + (2 if prefix else 0) + (1 if checksum else 0):
        raise ValueError('Invalid envelope field count')
    if prefix:
        if fields[0] != 'b128':
            raise ValueError('Invalid envelope identifier')
        declared_mode, identifier = _parse_header(fields[1])
        if identifier > 1:
            raise ValueError(f'Unassigned envelope alphabet {identifier}')
        declared = COMPACT_ALPHABET if identifier == 0 else MATH_ALPHABET
        if alphabet is not None and abc.text != declared.text:
            raise ValueError('Envelope alphabet does not match selected alphabet')
        if mode is not None and mode != declared_mode:
            raise ValueError('Envelope mode does not match selected mode')
        abc, selected_mode = declared, declared_mode
    payload = fields[2 if prefix else 0]
    if checksum:
        if len(fields[-1]) != 5:
            raise ValueError('Checksum must contain five Unicode code points')
        actual = decode(fields[-1], alphabet=abc)
        if actual != _checksum('·'.join(fields[:-1])):
            raise ValueError('Checksum mismatch')
    _validate(payload, selected_mode, abc, accept_aliases)
    return Unwrapped(payload, selected_mode, abc)
