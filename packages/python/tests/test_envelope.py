import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'packages/python'))
from base128 import wrap, unwrap, encode, encode_integer, create_alphabet, DEFAULT_ALPHABET


class EnvelopeTests(unittest.TestCase):
    def test_independent_vectors(self):
        for v in json.loads((ROOT / 'specs/envelope-vectors.json').read_text()):
            with self.subTest(v=v):
                alphabet = DEFAULT_ALPHABET
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
        bad += [good.replace('∫','∂'), 'b128·00·÷#']
        for value in bad:
            with self.subTest(value=value), self.assertRaises(ValueError):
                unwrap(value, **options)
        for kwargs in [{}, dict(prefix=True), dict(checksum=True), dict(**options, alphabet=create_alphabet(DEFAULT_ALPHABET.text[::-1])), dict(**options, mode='integer')]:
            with self.assertRaises(ValueError):
                unwrap(good, **kwargs)
        for text, kwargs in [('01', dict(prefix=True)), ('00', dict(mode='integer', checksum=True)), ('', dict(mode='integer', checksum=True))]:
            with self.assertRaises(ValueError):
                wrap(text, **kwargs)
        with self.assertRaises(TypeError):
            wrap('', prefix='yes')
        with self.assertRaises(ValueError):
            unwrap('', mode='text')

    def test_custom(self):
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


    def test_version_zero_header_fields_and_escapes(self):
        for alphabet, mode, header in [
            (DEFAULT_ALPHABET, 'binary', '00'), (DEFAULT_ALPHABET, 'integer', '01'),
        ]:
            payload = encode(bytes([255]), alphabet=alphabet) if mode == 'binary' else encode_integer(127, alphabet=alphabet)
            self.assertEqual(wrap(payload, alphabet=alphabet, mode=mode, prefix=True), f'b128·{header}·{payload}')
        cases = [
            ('', 'version'), ('0', 'configuration'), ('000', 'length'),
            ('10', 'version'), ('√0', 'version'), ('∫00', 'Reserved.*version'),
            ('∂00', 'Invalid'), ('0∂0', 'Invalid'),
            ('08', 'alphabet 1$'), ('09', 'alphabet 1$'), ('02', 'mode'), ('07', 'mode'), ('0f', 'mode'),
            ('0g', 'alphabet 2$'), ('0@', 'alphabet 14$'),
            ('0|', 'length'), ('0|00', 'length'), ('0|0', 'alphabet 15$'),
            ('0|1', 'alphabet 16$'), ('0|∫', 'alphabet 142$'), ('0}0', 'alphabet 15$'),
            ('0~0', 'mode'), ('0|∂', 'Invalid'), ('0|🙂', 'Invalid'), ('0| ', 'Invalid'),
        ]
        for header, error in cases:
            with self.subTest(header=header), self.assertRaisesRegex(ValueError, error):
                unwrap(f'b128·{header}·00', prefix=True)
