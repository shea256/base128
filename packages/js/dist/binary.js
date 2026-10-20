import { resolveDecoderIndex, resolveAlphabet } from "./alphabet.js";
/** Streaming MSB-first 7-bit byte encoder. No metadata or padding characters. */
export class BinaryEncoder {
    #alphabet;
    #buffer = 0;
    #bits = 0;
    #finished = false;
    constructor(options = {}) {
        this.#alphabet = resolveAlphabet(options.alphabet);
    }
    write(bytes) {
        if (this.#finished)
            throw new Error("Encoder is finalized");
        if (!(bytes instanceof Uint8Array))
            throw new TypeError("Input must be Uint8Array");
        const result = [];
        for (const byte of bytes) {
            this.#buffer = (this.#buffer << 8) | byte;
            this.#bits += 8;
            while (this.#bits >= 7) {
                this.#bits -= 7;
                result.push(this.#alphabet.symbolAt((this.#buffer >> this.#bits) & 127));
                this.#buffer &= (1 << this.#bits) - 1;
            }
        }
        return result.join("");
    }
    finish() {
        if (this.#finished)
            throw new Error("Encoder is already finalized");
        this.#finished = true;
        if (this.#bits === 0)
            return "";
        return this.#alphabet.symbolAt(this.#buffer << (7 - this.#bits));
    }
}
/** Streaming decoder. Canonical trailing bits and encoded length checked in finish(). */
export class BinaryDecoder {
    #indexOf;
    #buffer = 0;
    #bits = 0;
    #symbols = 0;
    #bytes = 0;
    #pendingHighSurrogate = "";
    #finished = false;
    constructor(options = {}) {
        this.#indexOf = resolveDecoderIndex(resolveAlphabet(options.alphabet), options.acceptAliases);
    }
    write(text) {
        if (this.#finished)
            throw new Error("Decoder is finalized");
        if (typeof text !== "string")
            throw new TypeError("Encoded input must be a string");
        let segment = this.#pendingHighSurrogate + text;
        this.#pendingHighSurrogate = "";
        if (segment.length > 0) {
            const last = segment.charCodeAt(segment.length - 1);
            if (last >= 0xd800 && last <= 0xdbff) {
                this.#pendingHighSurrogate = segment.slice(-1);
                segment = segment.slice(0, -1);
            }
        }
        const result = [];
        for (const symbol of segment) {
            const digit = this.#indexOf(symbol);
            this.#symbols++;
            this.#buffer = (this.#buffer << 7) | digit;
            this.#bits += 7;
            if (this.#bits >= 8) {
                this.#bits -= 8;
                result.push((this.#buffer >> this.#bits) & 255);
                this.#buffer &= (1 << this.#bits) - 1;
                this.#bytes++;
            }
        }
        return Uint8Array.from(result);
    }
    finish() {
        if (this.#finished)
            throw new Error("Decoder is already finalized");
        this.#finished = true;
        if (this.#pendingHighSurrogate) {
            throw new RangeError("Incomplete Unicode surrogate pair");
        }
        // Encoded lengths 1 mod 8 cannot represent any whole-byte input.
        if (Math.ceil((this.#bytes * 8) / 7) !== this.#symbols) {
            throw new RangeError("Noncanonical Base128 binary length");
        }
        if (this.#buffer !== 0) {
            throw new RangeError("Nonzero trailing padding bits");
        }
    }
}
export function encode(bytes, options = {}) {
    const encoder = new BinaryEncoder(options);
    return encoder.write(bytes) + encoder.finish();
}
export function decode(text, options = {}) {
    const decoder = new BinaryDecoder(options);
    const bytes = decoder.write(text);
    decoder.finish();
    return bytes;
}
