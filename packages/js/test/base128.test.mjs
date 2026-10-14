import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {
  Alphabet, DEFAULT_ALPHABET, DEFAULT_ALPHABET_TEXT, createAlphabet,
  BinaryEncoder, BinaryDecoder, encode, decode, encodeInteger, decodeInteger,
} from '../dist/index.js';
const fixtures = JSON.parse(readFileSync(new URL('../../../specs/test-vectors.json', import.meta.url), 'utf8'));

test('v4 alphabet is exact, unique, and immutable', () => {
  assert.equal(Array.from(DEFAULT_ALPHABET_TEXT).length, 128);
  assert.equal(new Set(Array.from(DEFAULT_ALPHABET_TEXT)).size, 128);
  assert.equal(DEFAULT_ALPHABET.text, fixtures.alphabet);
  assert.equal(DEFAULT_ALPHABET.symbolAt(0), '0');
  assert.equal(DEFAULT_ALPHABET.symbolAt(127), '∫');
  assert.ok(Object.isFrozen(DEFAULT_ALPHABET));
  assert.equal(DEFAULT_ALPHABET.indexOf('∇'), 123);
});

test('independent reference vectors (binary and integer)', () => {
  for (const {hex, encoded} of fixtures.binary) {
    const input = Buffer.from(hex, 'hex');
    assert.equal(encode(input), encoded, `encode ${hex}`);
    assert.deepEqual(decode(encoded), new Uint8Array(input), `decode ${hex}`);
  }
  for (const {decimal, encoded} of fixtures.integer) {
    assert.equal(encodeInteger(BigInt(decimal)), encoded);
    assert.equal(decodeInteger(encoded), BigInt(decimal));
  }
});

test('custom alphabet vectors, compiled and supplied as text', () => {
  const compiled = createAlphabet(fixtures.custom.alphabet);
  assert.ok(compiled instanceof Alphabet);
  for (const item of fixtures.custom.binary) {
    for (const alphabet of [compiled, fixtures.custom.alphabet]) {
      const bytes = Buffer.from(item.hex, 'hex');
      assert.equal(encode(bytes, {alphabet}), item.encoded);
      assert.deepEqual(decode(item.encoded, {alphabet}), new Uint8Array(bytes));
    }
  }
  for (const item of fixtures.custom.integer) {
    assert.equal(encodeInteger(BigInt(item.decimal), {alphabet: compiled}), item.encoded);
    assert.equal(decodeInteger(item.encoded, {alphabet: compiled}), BigInt(item.decimal));
  }
});

test('binary round-trips for all sizes 0–512, and chunk streaming', () => {
  for (let length = 0; length <= 512; length++) {
    const input = randomBytes(length);
    const expected = encode(input);
    assert.deepEqual(decode(expected), new Uint8Array(input));
    const encoder = new BinaryEncoder();
    let streamed = '';
    for (let i = 0; i < input.length; i += 3) streamed += encoder.write(input.subarray(i, i + 3));
    streamed += encoder.finish();
    assert.equal(streamed, expected);

    const decoder = new BinaryDecoder();
    const chunks = [];
    for (let i = 0; i < expected.length; i += 2) chunks.push(decoder.write(expected.slice(i, i + 2)));
    decoder.finish();
    assert.deepEqual(Buffer.concat(chunks), input);
  }
});

test('full 0–255 byte spectrum and very large integers', () => {
  const bytes = Uint8Array.from({length:256}, (_, i)=>i);
  assert.deepEqual(decode(encode(bytes)), bytes);
  for (const n of [0n, 1n, 127n, 128n, 2n ** 1024n - 1n, 10n ** 200n]) {
    assert.equal(decodeInteger(encodeInteger(n)), n);
  }
});

test('strict canonical binary decoding rejects invalid lengths and padding', () => {
  assert.throws(() => decode('0'), /length/);
  assert.throws(() => decode('0'.repeat(9)), /length/);
  assert.throws(() => decode('01'), /padding/);
  assert.throws(() => decode(' '), /Invalid/);
  assert.throws(() => decode('non alphabet text'), /Invalid/);
  assert.throws(() => decode('!\uD800'), /Incomplete Unicode surrogate/);
  assert.deepEqual(decode('00'), Uint8Array.from([0]));
});

test('strict input and integer validation', () => {
  assert.throws(() => encode('Hello'), /Uint8Array/);
  assert.throws(() => encodeInteger(12), /bigint/);
  assert.throws(() => encodeInteger(-1n), /nonnegative/);
  assert.throws(() => decodeInteger(''), /empty/);
  assert.throws(() => decodeInteger('00'), /leading zero/);
  assert.throws(() => decodeInteger('0A'), /leading zero/);
  assert.throws(() => decodeInteger('🙂'), /Invalid/);
  assert.throws(() => new Alphabet('x'), /128/);
  assert.throws(() => new Alphabet('x'.repeat(128)), /duplicate/);
  assert.throws(() => new Alphabet(DEFAULT_ALPHABET_TEXT.slice(0,-1) + '\ud800'), /surrogate/);
  assert.throws(() => new Alphabet(DEFAULT_ALPHABET_TEXT.slice(0,-1) + '!'), /duplicate/);
  assert.throws(() => DEFAULT_ALPHABET.symbolAt(128), /digit/);
  const e = new BinaryEncoder(); e.finish();
  assert.throws(() => e.write(new Uint8Array()), /finalized/);
  const d = new BinaryDecoder(); d.finish();
  assert.throws(() => d.write(''), /finalized/);
});

test('supplementary Unicode symbols and UTF-16 split across decoder chunks', () => {
  const custom = createAlphabet(DEFAULT_ALPHABET_TEXT.replace('∫', '🧪'));
  assert.equal(Array.from(custom.text).length, 128);
  const bytes = Uint8Array.from([254, 17, 99]);
  const encoded = encode(bytes, {alphabet: custom});
  assert.equal(Array.from(encoded)[0], '🧪');
  assert.deepEqual(decode(encoded, {alphabet: custom}), bytes);
  const decoder = new BinaryDecoder({alphabet: custom});
  const decodedChunks = [];
  for (const utf16CodeUnit of encoded.split('')) decodedChunks.push(decoder.write(utf16CodeUnit));
  decoder.finish();
  assert.deepEqual(Buffer.concat(decodedChunks), Buffer.from(bytes));
});


test('v4 digit boundaries and explicit v1 compatibility', () => {
  for (const [value, text] of [[0n,'0'],[15n,'F'],[16n,'G'],[35n,'Z'],[36n,'a'],[61n,'z'],[62n,'!'],[122n,'∂'],[123n,'∇'],[124n,'∏'],[125n,'∑'],[126n,'√'],[127n,'∫'],[128n,'10'],[129n,'11']]) {
    assert.equal(encodeInteger(value), text);
    assert.equal(decodeInteger(text), value);
  }
  const legacy = JSON.parse(readFileSync(new URL('../../../specs/test-vectors-v1.json', import.meta.url), 'utf8'));
  const alphabet = legacy.alphabet;
  for (const {hex, encoded} of legacy.binary) {
    assert.equal(encode(Buffer.from(hex, 'hex'), {alphabet}), encoded);
    assert.deepEqual(decode(encoded, {alphabet}), new Uint8Array(Buffer.from(hex, 'hex')));
  }
  for (const {decimal, encoded} of legacy.integer) {
    assert.equal(encodeInteger(BigInt(decimal), {alphabet}), encoded);
    assert.equal(decodeInteger(encoded, {alphabet}), BigInt(decimal));
  }
});

for (const version of [2, 3]) {
  test(`v${version} payloads remain explicitly decodable`, () => {
    const legacy = JSON.parse(readFileSync(new URL(`../../../specs/test-vectors-v${version}.json`, import.meta.url), 'utf8'));
    const alphabet = legacy.alphabet;
    assert.equal(DEFAULT_ALPHABET_TEXT.slice(0, 122), alphabet.slice(0, 122));
    assert.throws(() => decodeInteger('∞'), /Invalid/);
    for (const {hex, encoded} of legacy.binary) {
      const bytes = new Uint8Array(Buffer.from(hex, 'hex'));
      assert.deepEqual(decode(encoded, {alphabet}), bytes);
      assert.equal(encode(bytes, {alphabet}), encoded);
    }
    for (const {decimal, encoded} of legacy.integer) {
      assert.equal(decodeInteger(encoded, {alphabet}), BigInt(decimal));
      assert.equal(encodeInteger(BigInt(decimal), {alphabet}), encoded);
    }
  });
}
