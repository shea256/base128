"""Optional middle-dot envelopes for already encoded payloads."""
from dataclasses import dataclass
import zlib

from .alphabet import Alphabet, DEFAULT_ALPHABET, TWO_BYTE_ALPHABET, resolve_alphabet
from .binary import encode, decode
from .integer import decode_integer


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
        if abc.text == DEFAULT_ALPHABET.text:
            identifier = '0'
        elif abc.text == TWO_BYTE_ALPHABET.text:
            identifier = '1'
        else:
            raise ValueError('Prefixes require a built-in alphabet')
        body = f'b128·1{"b" if mode == "binary" else "i"}{identifier}·{payload}'
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
        import re
        if fields[0] != 'b128':
            raise ValueError('Invalid envelope identifier')
        header = re.fullmatch(r'([1-9][0-9]*)([bi])(0|[1-9][0-9]*)', fields[1])
        if not header:
            raise ValueError('Invalid envelope header')
        if header[1] != '1':
            raise ValueError('Unsupported envelope version')
        if header[3] not in ('0', '1'):
            raise ValueError('Unknown envelope alphabet')
        declared = DEFAULT_ALPHABET if header[3] == '0' else TWO_BYTE_ALPHABET
        declared_mode = 'binary' if header[2] == 'b' else 'integer'
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
