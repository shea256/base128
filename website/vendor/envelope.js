import { DEFAULT_ALPHABET, TWO_BYTE_ALPHABET, resolveAlphabet, } from "./alphabet.js?v=envelopes-0.1";
import { encode, decode } from "./binary.js?v=envelopes-0.1";
import { decodeInteger } from "./integer.js?v=envelopes-0.1";
const SEPARATOR = '·';
/** CRC-32/ISO-HDLC over UTF-8 text, returned as four big-endian bytes. */
function checksumBytes(text) {
    let crc = 0xffffffff;
    for (const byte of new TextEncoder().encode(text)) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++)
            crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    return Uint8Array.of(crc >>> 24, (crc >>> 16) & 255, (crc >>> 8) & 255, crc & 255);
}
function checkOptions(options) {
    for (const flag of ['prefix', 'checksum', 'acceptAliases']) {
        if (options[flag] !== undefined && typeof options[flag] !== 'boolean')
            throw new TypeError(`${flag} must be boolean`);
    }
    if (options.mode !== undefined && options.mode !== 'binary' && options.mode !== 'integer') {
        throw new RangeError('Envelope mode must be binary or integer');
    }
}
function checkAlphabet(alphabet, options) {
    if ((options.prefix || options.checksum) && alphabet.text.includes(SEPARATOR)) {
        throw new RangeError('Envelope alphabet must exclude middle dot (U+00B7)');
    }
}
function validate(payload, mode, alphabet, acceptAliases = false) {
    if (mode === 'binary')
        decode(payload, { alphabet, acceptAliases });
    else
        decodeInteger(payload, { alphabet, acceptAliases });
}
function alphabetId(alphabet) {
    if (alphabet.text === DEFAULT_ALPHABET.text)
        return '0';
    if (alphabet.text === TWO_BYTE_ALPHABET.text)
        return '1';
    throw new RangeError('Prefixes require a built-in alphabet');
}
/** Wrap an already encoded payload. Bare output remains the default. */
export function wrap(payload, options = {}) {
    if (typeof payload !== 'string')
        throw new TypeError('Encoded payload must be a string');
    checkOptions(options);
    const alphabet = resolveAlphabet(options.alphabet);
    const mode = options.mode ?? 'binary';
    checkAlphabet(alphabet, options);
    validate(payload, mode, alphabet, options.acceptAliases);
    const body = options.prefix ? `b128·1${mode === 'binary' ? 'b' : 'i'}${alphabetId(alphabet)}·${payload}` : payload;
    return options.checksum ? `${body}·${encode(checksumBytes(body), { alphabet })}` : body;
}
/** Require the selected wrapper shape; verify the checksum before returning payload. */
export function unwrap(text, options = {}) {
    if (typeof text !== 'string')
        throw new TypeError('Encoded envelope must be a string');
    checkOptions(options);
    let alphabet = resolveAlphabet(options.alphabet);
    let mode = options.mode ?? 'binary';
    if (!options.prefix && !options.checksum) {
        validate(text, mode, alphabet, options.acceptAliases);
        return { payload: text, mode, alphabet };
    }
    checkAlphabet(alphabet, options);
    const fields = text.split(SEPARATOR);
    const expected = 1 + (options.prefix ? 2 : 0) + (options.checksum ? 1 : 0);
    if (fields.length !== expected)
        throw new RangeError('Invalid envelope field count');
    if (options.prefix) {
        if (fields[0] !== 'b128')
            throw new RangeError('Invalid envelope identifier');
        const header = /^([1-9][0-9]*)([bi])(0|[1-9][0-9]*)$/.exec(fields[1]);
        if (!header)
            throw new RangeError('Invalid envelope header');
        if (header[1] !== '1')
            throw new RangeError('Unsupported envelope version');
        if (header[3] !== '0' && header[3] !== '1')
            throw new RangeError('Unknown envelope alphabet');
        const declared = header[3] === '0' ? DEFAULT_ALPHABET : TWO_BYTE_ALPHABET;
        const declaredMode = header[2] === 'b' ? 'binary' : 'integer';
        if (options.alphabet !== undefined && alphabet.text !== declared.text)
            throw new RangeError('Envelope alphabet does not match selected alphabet');
        if (options.mode !== undefined && options.mode !== declaredMode)
            throw new RangeError('Envelope mode does not match selected mode');
        alphabet = declared;
        mode = declaredMode;
    }
    const payload = fields[options.prefix ? 2 : 0];
    if (options.checksum) {
        const check = fields[fields.length - 1];
        if (Array.from(check).length !== 5)
            throw new RangeError('Checksum must contain five Unicode code points');
        const actual = decode(check, { alphabet }); // Checksum spelling is always strict.
        const body = fields.slice(0, -1).join(SEPARATOR);
        const expectedBytes = checksumBytes(body);
        if (actual.length !== 4 || actual.some((byte, i) => byte !== expectedBytes[i]))
            throw new RangeError('Checksum mismatch');
    }
    validate(payload, mode, alphabet, options.acceptAliases);
    return { payload, mode, alphabet };
}
