import { resolveDecoderIndex, resolveAlphabet } from "./alphabet.js?v=alphabet-presets";
/** Nonnegative integer → minimal, big-endian positional Base128 numeral. */
export function encodeInteger(value, options = {}) {
    if (typeof value !== "bigint")
        throw new TypeError("Integer input must be bigint");
    if (value < 0n)
        throw new RangeError("Integer input must be nonnegative");
    const alphabet = resolveAlphabet(options.alphabet);
    if (value === 0n)
        return alphabet.symbolAt(0);
    const digits = [];
    while (value > 0n) {
        digits.push(alphabet.symbolAt(Number(value & 127n)));
        value >>= 7n;
    }
    return digits.reverse().join("");
}
/** Minimal, big-endian positional Base128 numeral → nonnegative bigint. */
export function decodeInteger(text, options = {}) {
    if (typeof text !== "string")
        throw new TypeError("Encoded integer must be a string");
    const alphabet = resolveAlphabet(options.alphabet);
    const indexOf = resolveDecoderIndex(alphabet, options.acceptAliases);
    const digits = Array.from(text);
    if (digits.length === 0)
        throw new RangeError("Encoded integer cannot be empty");
    if (digits.length > 1 && digits[0] === alphabet.symbolAt(0)) {
        throw new RangeError("Noncanonical integer: leading zero digit");
    }
    let value = 0n;
    for (const digit of digits) {
        value = (value << 7n) | BigInt(indexOf(digit));
    }
    return value;
}
