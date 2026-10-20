import json
import random
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'packages' / 'python'))
from base128 import (
    Alphabet, DEFAULT_ALPHABET, DEFAULT_ALPHABET_TEXT, TWO_BYTE_ALPHABET, TWO_BYTE_ALPHABET_TEXT, create_alphabet,
    BinaryEncoder, BinaryDecoder, encode, decode, encode_integer, decode_integer,
)
VECTORS = json.loads((ROOT / 'specs' / 'test-vectors.json').read_text(encoding='utf-8'))


class Base128Tests(unittest.TestCase):
    def test_two_byte_and_mixed_aliases(self):
        spec = json.loads((ROOT / 'specs/alphabet-two-byte.json').read_text())
        self.assertEqual(TWO_BYTE_ALPHABET_TEXT, spec['alphabet'])
        self.assertEqual(TWO_BYTE_ALPHABET_TEXT[122:], '§©®°¶÷')
        self.assertTrue(all(len(c.encode('utf-8')) <= 2 for c in TWO_BYTE_ALPHABET_TEXT))
        bits = ''.join(f'{i:07b}' for i in range(128))
        data = bytes(int(bits[i:i+8], 2) for i in range(0, len(bits), 8))
        self.assertEqual(encode(data), DEFAULT_ALPHABET_TEXT)
        self.assertEqual(encode(data, alphabet=TWO_BYTE_ALPHABET), TWO_BYTE_ALPHABET_TEXT)
        self.assertEqual(decode(TWO_BYTE_ALPHABET_TEXT, alphabet=TWO_BYTE_ALPHABET), data)
        for mask in range(64):
            mixed = ''.join(TWO_BYTE_ALPHABET_TEXT[i] if i >= 122 and mask & (1 << (i-122)) else c
                            for i, c in enumerate(DEFAULT_ALPHABET_TEXT))
            for alphabet in (DEFAULT_ALPHABET, TWO_BYTE_ALPHABET_TEXT):
                options = dict(alphabet=alphabet, accept_aliases=True)
                self.assertEqual(decode(mixed, **options), data)
                decoder = BinaryDecoder(**options)
                self.assertEqual(b''.join(decoder.write(c) for c in mixed), data)
                decoder.finish()
                for i in range(122, 128):
                    self.assertEqual(decode_integer(mixed[i], **options), i)
                    self.assertEqual(encode_integer(i, alphabet=TWO_BYTE_ALPHABET), TWO_BYTE_ALPHABET_TEXT[i])
        for text, options in [(TWO_BYTE_ALPHABET_TEXT, {}),
                              (DEFAULT_ALPHABET_TEXT, dict(alphabet=TWO_BYTE_ALPHABET)),
                              ('0÷', dict(accept_aliases=True)), ('§', dict(accept_aliases=True)),
                              ('', dict(alphabet=DEFAULT_ALPHABET_TEXT[::-1], accept_aliases=True))]:
            with self.assertRaises(ValueError):
                decode(text, **options)
        for text, options in [('§', {}), ('0§', dict(accept_aliases=True)),
                              ('☃', dict(accept_aliases=True)),
                              ('0', dict(alphabet=DEFAULT_ALPHABET_TEXT[::-1], accept_aliases=True))]:
            with self.assertRaises(ValueError):
                decode_integer(text, **options)

    def test_two_byte_reference_vectors(self):
        vectors = json.loads((ROOT / 'specs/test-vectors-two-byte.json').read_text())
        self.assertEqual(vectors['alphabet'], TWO_BYTE_ALPHABET_TEXT)
        self.assertEqual((ROOT / 'specs/alphabet-two-byte.txt').read_text(), TWO_BYTE_ALPHABET_TEXT)
        with self.assertRaises(AttributeError):
            TWO_BYTE_ALPHABET._text = 'changed'
        for item in vectors['binary']:
            data = bytes.fromhex(item['hex'])
            self.assertEqual(encode(data, alphabet=TWO_BYTE_ALPHABET), item['encoded'])
            decoded = decode(item['mixed'], accept_aliases=True)
            self.assertEqual(decoded, data)
            self.assertEqual(encode(decoded, alphabet=TWO_BYTE_ALPHABET), item['encoded'])
        for item in vectors['integer']:
            value = int(item['decimal'])
            self.assertEqual(encode_integer(value, alphabet=TWO_BYTE_ALPHABET), item['encoded'])
            self.assertEqual(decode_integer(item['mixed'], accept_aliases=True), value)
            self.assertEqual(decode_integer(item['encoded'], alphabet=TWO_BYTE_ALPHABET), value)

    def test_alphabet(self):
        self.assertEqual(DEFAULT_ALPHABET_TEXT, VECTORS['alphabet'])
        self.assertEqual(len(DEFAULT_ALPHABET_TEXT), 128)
        self.assertEqual(len(set(DEFAULT_ALPHABET_TEXT)), 128)
        self.assertEqual(DEFAULT_ALPHABET.symbol_at(0), '0')
        self.assertEqual(DEFAULT_ALPHABET.symbol_at(127), '∫')
        with self.assertRaises(AttributeError):
            DEFAULT_ALPHABET._text = 'changed'

    def test_reference_vectors(self):
        for item in VECTORS['binary']:
            with self.subTest(item=item['hex'][:24]):
                data = bytes.fromhex(item['hex'])
                self.assertEqual(encode(data), item['encoded'])
                self.assertEqual(decode(item['encoded']), data)
        for item in VECTORS['integer']:
            with self.subTest(item=item['decimal'][:24]):
                self.assertEqual(encode_integer(int(item['decimal'])), item['encoded'])
                self.assertEqual(decode_integer(item['encoded']), int(item['decimal']))

    def test_custom_vectors(self):
        alphabet = create_alphabet(VECTORS['custom']['alphabet'])
        for item in VECTORS['custom']['binary']:
            data = bytes.fromhex(item['hex'])
            for arg in [alphabet, VECTORS['custom']['alphabet']]:
                self.assertEqual(encode(data, alphabet=arg), item['encoded'])
                self.assertEqual(decode(item['encoded'], alphabet=arg), data)
        for item in VECTORS['custom']['integer']:
            self.assertEqual(encode_integer(int(item['decimal']), alphabet=alphabet), item['encoded'])
            self.assertEqual(decode_integer(item['encoded'], alphabet=alphabet), int(item['decimal']))

    def test_math_order(self):
        self.assertEqual(DEFAULT_ALPHABET_TEXT[122:], '∂∇∏∑√∫')
        self.assertEqual(list(DEFAULT_ALPHABET_TEXT[122:]), sorted(DEFAULT_ALPHABET_TEXT[122:]))
        for index, symbol in enumerate('∂∇∏∑√∫', 122):
            self.assertEqual(encode_integer(index), symbol)
            self.assertEqual(decode_integer(symbol), index)

    def test_round_trip_and_streaming(self):
        rng = random.Random(20261013)
        for length in range(513):
            data = rng.randbytes(length)
            expected = encode(data)
            self.assertEqual(decode(expected), data)
            encoder = BinaryEncoder()
            streamed = ''.join(encoder.write(data[i:i+3]) for i in range(0, length, 3)) + encoder.finish()
            self.assertEqual(streamed, expected)
            decoder = BinaryDecoder()
            restored = b''.join(decoder.write(expected[i:i+2]) for i in range(0, len(expected), 2))
            decoder.finish()
            self.assertEqual(restored, data)

    def test_boundaries_and_invalid_strings(self):
        for value in [0, 1, 127, 128, 2**1024-1, 10**200]:
            self.assertEqual(decode_integer(encode_integer(value)), value)
        for text in ['0', '0'*9, '01', ' ', 'invalid text']:
            with self.subTest(text=text), self.assertRaises(ValueError):
                decode(text)
        self.assertEqual(decode('00'), bytes([0]))
        for text in ['', '00', '0A']:
            with self.assertRaises(ValueError):
                decode_integer(text)
        with self.assertRaises(ValueError):
            encode_integer(-1)
        with self.assertRaises(TypeError):
            encode_integer(True)
        with self.assertRaises(TypeError):
            encode('abc')
        with self.assertRaises(ValueError):
            create_alphabet('x')
        with self.assertRaises(ValueError):
            create_alphabet('x'*128)
        with self.assertRaises(ValueError):
            create_alphabet(DEFAULT_ALPHABET_TEXT[:-1] + '\ud800')

    def test_non_bmp_custom_alphabet(self):
        custom = create_alphabet(DEFAULT_ALPHABET_TEXT.replace('∫', '🧪'))
        for data in [b'\xfe', b'\xfe\x11\x63', b'\xff'*12]:
            self.assertEqual(decode(encode(data, alphabet=custom), alphabet=custom), data)

    def test_unfinalized_stream_and_stream_reuse(self):
        e = BinaryEncoder()
        self.assertEqual(e.write(b'\x01'), '0')
        self.assertEqual(e.finish(), '#')
        with self.assertRaises(ValueError):
            e.write(b'')
        d = BinaryDecoder()
        self.assertEqual(d.write('!'), b'')
        with self.assertRaises(ValueError):
            d.finish()


if __name__ == '__main__':
    unittest.main()
