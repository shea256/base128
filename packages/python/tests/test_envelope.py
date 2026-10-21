import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'packages/python'))
from base128 import wrap, unwrap, encode, encode_integer, create_alphabet, DEFAULT_ALPHABET, MATH_ALPHABET


class EnvelopeTests(unittest.TestCase):
    def test_independent_vectors(self):
        for v in json.loads((ROOT / 'specs/envelope-vectors.json').read_text()):
            with self.subTest(v=v):
                alphabet = [DEFAULT_ALPHABET, MATH_ALPHABET][v['alphabet']]
                options = dict(alphabet=alphabet, mode=v['mode'], prefix=v['prefix'], checksum=v['checksum'])
                payload = encode(bytes.fromhex(v['value']), alphabet=alphabet) if v['mode'] == 'binary' else encode_integer(int(v['value']), alphabet=alphabet)
                self.assertEqual(payload, v['payload'])
                self.assertEqual(wrap(payload, **options), v['wrapped'])
                result = unwrap(v['wrapped'], **options)
                self.assertEqual((result.payload, result.mode, result.alphabet.text), (payload, v['mode'], alphabet.text))
                if v['prefix']:
                    inferred = unwrap(v['wrapped'], prefix=True, checksum=v['checksum'])
                    self.assertEqual((inferred.mode, inferred.alphabet.text), (v['mode'], alphabet.text))

    def test_strict_shapes_headers_and_tampering(self):
        options = dict(prefix=True, checksum=True)
        good = wrap(encode(bytes([255])), **options)
        bad = [good+'·', good+' ', good.replace('b128','B128'), good[:-1], good[:-1]+'1']
        bad += [good.replace('00', h) for h in ['000','000','12b38','1x0','1b2','01']]
        bad += [good.replace('÷','∫'), 'b128·00·÷#']
        for value in bad:
            with self.subTest(value=value), self.assertRaises(ValueError):
                unwrap(value, **options, accept_aliases=True)
        for kwargs in [{}, dict(prefix=True), dict(checksum=True), dict(**options, alphabet=MATH_ALPHABET), dict(**options, mode='integer')]:
            with self.assertRaises(ValueError):
                unwrap(good, **kwargs)
        for text, kwargs in [('01', dict(prefix=True)), ('00', dict(mode='integer', checksum=True)), ('', dict(mode='integer', checksum=True))]:
            with self.assertRaises(ValueError):
                wrap(text, **kwargs)
        with self.assertRaises(TypeError):
            wrap('', prefix='yes')
        with self.assertRaises(ValueError):
            unwrap('', mode='text')

    def test_custom_and_aliases(self):
        alphabet = create_alphabet(''.join(chr(0x1f300+i) for i in range(128)))
        payload = encode(bytes([255]), alphabet=alphabet)
        wrapped = wrap(payload, alphabet=alphabet, checksum=True)
        self.assertEqual(len(wrapped.split('·')[1]), 5)
        self.assertEqual(unwrap(wrapped, alphabet=alphabet, checksum=True).payload, payload)
        with self.assertRaises(ValueError):
            wrap(payload, alphabet=alphabet, prefix=True)
        dotted = create_alphabet('·'+DEFAULT_ALPHABET.text[1:])
        with self.assertRaises(ValueError):
            wrap('', alphabet=dotted, checksum=True)
        self.assertEqual(unwrap('··', alphabet=dotted).payload, '··')
        mixed = '÷∫'*4
        options = dict(prefix=True, checksum=True, accept_aliases=True)
        wrapped = wrap(mixed, **options)
        self.assertEqual(unwrap(wrapped, **options).payload, mixed)
        with self.assertRaises(ValueError):
            unwrap(wrapped, prefix=True, checksum=True)
        with self.assertRaises(ValueError):
            unwrap(wrapped.replace('∫','÷'), **options)


    def test_version_zero_header_fields_and_escapes(self):
        for alphabet, mode, header in [
            (DEFAULT_ALPHABET, 'binary', '00'), (DEFAULT_ALPHABET, 'integer', '01'),
            (MATH_ALPHABET, 'binary', '08'), (MATH_ALPHABET, 'integer', '09'),
        ]:
            payload = encode(bytes([255]), alphabet=alphabet) if mode == 'binary' else encode_integer(127, alphabet=alphabet)
            self.assertEqual(wrap(payload, alphabet=alphabet, mode=mode, prefix=True), f'b128·{header}·{payload}')
        cases = [
            ('', 'version'), ('0', 'configuration'), ('000', 'length'),
            ('10', 'version'), ('¶0', 'version'), ('÷00', 'Reserved.*version'),
            ('∫00', 'Invalid'), ('0∫0', 'Invalid'),
            ('02', 'mode'), ('07', 'mode'), ('0F', 'mode'),
            ('0G', 'alphabet 2$'), ('0κ', 'alphabet 14$'),
            ('0ψ', 'length'), ('0ψ00', 'length'), ('0ψ0', 'alphabet 15$'),
            ('0ψ1', 'alphabet 16$'), ('0ψ÷', 'alphabet 142$'), ('0ω0', 'alphabet 15$'),
            ('0¥0', 'mode'), ('0ψ∫', 'Invalid'), ('0ψ🙂', 'Invalid'), ('0ψ ', 'Invalid'),
        ]
        for header, error in cases:
            with self.subTest(header=header), self.assertRaisesRegex(ValueError, error):
                unwrap(f'b128·{header}·00', prefix=True, accept_aliases=True)
