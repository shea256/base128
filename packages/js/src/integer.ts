import { type Options, resolveAlphabet } from "./alphabet.js";

/** Nonnegative integer → minimal, big-endian positional Base128 numeral. */
export function encodeInteger(value: bigint, options: Options = {}): string {
  if (typeof value !== "bigint") throw new TypeError("Integer input must be bigint");
  if (value < 0n) throw new RangeError("Integer input must be nonnegative");
  const alphabet = resolveAlphabet(options.alphabet);
  if (value === 0n) return alphabet.symbolAt(0);
  const digits: string[] = [];
  while (value > 0n) {
    digits.push(alphabet.symbolAt(Number(value & 127n)));
    value >>= 7n;
  }
  return digits.reverse().join("");
}

/** Minimal, big-endian positional Base128 numeral → nonnegative bigint. */
export function decodeInteger(text: string, options: Options = {}): bigint {
  if (typeof text !== "string") throw new TypeError("Encoded integer must be a string");
  const alphabet = resolveAlphabet(options.alphabet);
  const digits = Array.from(text);
  if (digits.length === 0) throw new RangeError("Encoded integer cannot be empty");
  if (digits.length > 1 && digits[0] === alphabet.symbolAt(0)) {
    throw new RangeError("Noncanonical integer: leading zero digit");
  }
  let value = 0n;
  for (const digit of digits) {
    value = (value << 7n) | BigInt(alphabet.indexOf(digit));
  }
  return value;
}
