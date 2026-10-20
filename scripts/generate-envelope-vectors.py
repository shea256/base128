"""Independent middle-dot envelope fixtures: bit grouping, division, and stdlib CRC-32."""
import json
from pathlib import Path
import zlib

ROOT = Path(__file__).resolve().parents[1]
alphabets = [json.loads((ROOT / 'specs' / name).read_text())['alphabet']
             for name in ('alphabet.json', 'alphabet-two-byte.json')]


def binary(data, alphabet):
    bits = ''.join(f'{byte:08b}' for byte in data)
    return ''.join(alphabet[int(bits[i:i+7].ljust(7, '0'), 2)] for i in range(0, len(bits), 7))


def integer(value, alphabet):
    if not value:
        return alphabet[0]
    result = ''
    while value:
        value, digit = divmod(value, 128)
        result = alphabet[digit] + result
    return result


vectors = []
for identifier, alphabet in enumerate(alphabets):
    cases = [('binary', value) for value in ('', '00', 'ff', '48656c6c6f', 'b6a9c8c230722b7c748331a8b450f05566dc7d0f')]
    cases += [('integer', value) for value in ('0', '127', '1000', str(2**128))]
    for mode, value in cases:
        payload = binary(bytes.fromhex(value), alphabet) if mode == 'binary' else integer(int(value), alphabet)
        for prefix, checksum in [(False, False), (True, False), (False, True), (True, True)]:
            body = f'b128·1{"b" if mode == "binary" else "i"}{identifier}·{payload}' if prefix else payload
            crc = zlib.crc32(body.encode('utf-8')).to_bytes(4, 'big')
            wrapped = body + '·' + binary(crc, alphabet) if checksum else body
            vectors.append(dict(alphabet=identifier, mode=mode, value=value, payload=payload,
                                prefix=prefix, checksum=checksum, wrapped=wrapped))
(ROOT / 'specs/envelope-vectors.json').write_text(json.dumps(vectors, ensure_ascii=False, indent=2) + '\n')
print(f'Generated {len(vectors)} independent envelope vectors')
