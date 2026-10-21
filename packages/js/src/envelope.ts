import {
  Alphabet, type DecodeOptions, COMPACT_ALPHABET, MATH_ALPHABET, resolveAlphabet,
} from './alphabet.js';
import {encode, decode} from './binary.js';
import {decodeInteger} from './integer.js';

export type EnvelopeMode = 'binary' | 'integer';
export interface EnvelopeOptions extends DecodeOptions {
  mode?: EnvelopeMode;
  prefix?: boolean;
  checksum?: boolean;
}
export interface Unwrapped {
  payload: string;
  mode: EnvelopeMode;
  alphabet: Alphabet;
}
const SEPARATOR = '·';
// Fixed wire alphabet: never infer it from the payload or DEFAULT_ALPHABET.
const HEADER_ALPHABET = new Alphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
  Array.from({length:94}, (_, i) => String.fromCharCode(i + 33)).filter(c => !/[0-9A-Za-z]/.test(c)).join('') +
  'ΓΔΘΛΞΠΦΨΩαβγδεζηθικλμξπστφψω¥§©®¶÷'
);

function parseHeader(text: string): {mode: EnvelopeMode; alphabetId: number} {
  const symbols = Array.from(text);
  if (!symbols.length) throw new RangeError('Missing envelope version');
  const version = HEADER_ALPHABET.indexOf(symbols[0]!);
  if (version === 127) throw new RangeError('Reserved envelope version escape');
  if (version !== 0) throw new RangeError('Unsupported envelope version');
  if (symbols.length < 2) throw new RangeError('Missing envelope configuration');
  const config = HEADER_ALPHABET.indexOf(symbols[1]!);
  const mode = config & 7;
  let alphabetId = config >>> 3;
  if (symbols.length !== (alphabetId === 15 ? 3 : 2)) throw new RangeError('Invalid envelope header length');
  if (alphabetId === 15) alphabetId = 15 + HEADER_ALPHABET.indexOf(symbols[2]!);
  if (mode > 1) throw new RangeError('Unassigned envelope mode');
  return {mode: mode === 0 ? 'binary' : 'integer', alphabetId};
}

/** CRC-32/ISO-HDLC over UTF-8 text, returned as four big-endian bytes. */
function checksumBytes(text: string): Uint8Array {
  let crc = 0xffffffff;
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  return Uint8Array.of(crc >>> 24, (crc >>> 16) & 255, (crc >>> 8) & 255, crc & 255);
}
function checkOptions(options: EnvelopeOptions): void {
  for (const flag of ['prefix', 'checksum', 'acceptAliases'] as const) {
    if (options[flag] !== undefined && typeof options[flag] !== 'boolean') throw new TypeError(`${flag} must be boolean`);
  }
  if (options.mode !== undefined && options.mode !== 'binary' && options.mode !== 'integer') {
    throw new RangeError('Envelope mode must be binary or integer');
  }
}
function checkAlphabet(alphabet: Alphabet, options: EnvelopeOptions): void {
  if ((options.prefix || options.checksum) && alphabet.text.includes(SEPARATOR)) {
    throw new RangeError('Envelope alphabet must exclude middle dot (U+00B7)');
  }
}
function validate(payload: string, mode: EnvelopeMode, alphabet: Alphabet, acceptAliases = false): void {
  if (mode === 'binary') decode(payload, {alphabet, acceptAliases});
  else decodeInteger(payload, {alphabet, acceptAliases});
}
function alphabetId(alphabet: Alphabet): number {
  if (alphabet.text === COMPACT_ALPHABET.text) return 0;
  if (alphabet.text === MATH_ALPHABET.text) return 1;
  throw new RangeError('Prefixes require a built-in alphabet');
}

/** Wrap an already encoded payload. Bare output remains the default. */
export function wrap(payload: string, options: EnvelopeOptions = {}): string {
  if (typeof payload !== 'string') throw new TypeError('Encoded payload must be a string');
  checkOptions(options);
  const alphabet = resolveAlphabet(options.alphabet);
  const mode = options.mode ?? 'binary';
  checkAlphabet(alphabet, options);
  validate(payload, mode, alphabet, options.acceptAliases);
  const body = options.prefix ? `b128·0${HEADER_ALPHABET.symbolAt((alphabetId(alphabet) << 3) | (mode === 'binary' ? 0 : 1))}·${payload}` : payload;
  return options.checksum ? `${body}·${encode(checksumBytes(body), {alphabet})}` : body;
}

/** Require the selected wrapper shape; verify the checksum before returning payload. */
export function unwrap(text: string, options: EnvelopeOptions = {}): Unwrapped {
  if (typeof text !== 'string') throw new TypeError('Encoded envelope must be a string');
  checkOptions(options);
  let alphabet = resolveAlphabet(options.alphabet);
  let mode = options.mode ?? 'binary';
  if (!options.prefix && !options.checksum) {
    validate(text, mode, alphabet, options.acceptAliases);
    return {payload: text, mode, alphabet};
  }
  checkAlphabet(alphabet, options);
  const fields = text.split(SEPARATOR);
  const expected = 1 + (options.prefix ? 2 : 0) + (options.checksum ? 1 : 0);
  if (fields.length !== expected) throw new RangeError('Invalid envelope field count');
  if (options.prefix) {
    if (fields[0] !== 'b128') throw new RangeError('Invalid envelope identifier');
    const header = parseHeader(fields[1]!);
    if (header.alphabetId > 1) throw new RangeError(`Unassigned envelope alphabet ${header.alphabetId}`);
    const declared = header.alphabetId === 0 ? COMPACT_ALPHABET : MATH_ALPHABET;
    const declaredMode = header.mode;
    if (options.alphabet !== undefined && alphabet.text !== declared.text) throw new RangeError('Envelope alphabet does not match selected alphabet');
    if (options.mode !== undefined && options.mode !== declaredMode) throw new RangeError('Envelope mode does not match selected mode');
    alphabet = declared;
    mode = declaredMode;
  }
  const payload = fields[options.prefix ? 2 : 0]!;
  if (options.checksum) {
    const check = fields[fields.length - 1]!;
    if (Array.from(check).length !== 5) throw new RangeError('Checksum must contain five Unicode code points');
    const actual = decode(check, {alphabet}); // Checksum spelling is always strict.
    const body = fields.slice(0, -1).join(SEPARATOR);
    const expectedBytes = checksumBytes(body);
    if (actual.length !== 4 || actual.some((byte, i) => byte !== expectedBytes[i])) throw new RangeError('Checksum mismatch');
  }
  validate(payload, mode, alphabet, options.acceptAliases);
  return {payload, mode, alphabet};
}
