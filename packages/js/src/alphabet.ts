/** The v4 alphabet is ordered, not normalized, and immutable. */
export const DEFAULT_ALPHABET_TEXT =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
  Array.from({ length: 94 }, (_, i) => String.fromCharCode(i + 33))
    .filter(symbol => !/[0-9A-Za-z]/.test(symbol)).join("") +
  "ΓΔΘΛΞΠΦΨΩ" +
  "αβγδεζηθικλμξπστφψω" +
  "∂∇∏∑√∫";

/** Two-byte UTF-8 preset, with the final six symbols in code-point order. */
export const TWO_BYTE_ALPHABET_TEXT = Array.from(DEFAULT_ALPHABET_TEXT).slice(0, 122).join("") + "§©®°¶÷";

/** A compiled alphabet: 128 unique Unicode scalar values, in index order. */
export class Alphabet {
  readonly #symbols: readonly string[];
  readonly #indices: ReadonlyMap<string, number>;
  readonly #text: string;

  constructor(text: string) {
    if (typeof text !== "string") {
      throw new TypeError("Alphabet must be a string");
    }
    const symbols = Array.from(text);
    if (symbols.length !== 128) {
      throw new RangeError(`Alphabet must contain exactly 128 Unicode code points; got ${symbols.length}`);
    }
    const indices = new Map<string, number>();
    symbols.forEach((symbol, index) => {
      const cp = symbol.codePointAt(0)!;
      if (cp >= 0xd800 && cp <= 0xdfff) {
        throw new RangeError(`Alphabet contains an unpaired surrogate at index ${index}`);
      }
      if (indices.has(symbol)) {
        throw new RangeError(`Alphabet contains duplicate symbol ${JSON.stringify(symbol)}`);
      }
      indices.set(symbol, index);
    });
    this.#symbols = Object.freeze(symbols);
    this.#indices = indices;
    this.#text = text;
    Object.freeze(this);
  }

  get text(): string { return this.#text; }
  get length(): number { return 128; }

  symbolAt(index: number): string {
    if (!Number.isInteger(index) || index < 0 || index >= 128) {
      throw new RangeError("Base128 digit must be an integer from 0 to 127");
    }
    return this.#symbols[index]!;
  }

  indexOf(symbol: string): number {
    const result = this.#indices.get(symbol);
    if (result === undefined) {
      throw new RangeError(`Invalid Base128 character ${JSON.stringify(symbol)}`);
    }
    return result;
  }
}

export const DEFAULT_ALPHABET = new Alphabet(DEFAULT_ALPHABET_TEXT);
export const TWO_BYTE_ALPHABET = new Alphabet(TWO_BYTE_ALPHABET_TEXT);
export type AlphabetInput = Alphabet | string;
export interface Options { alphabet?: AlphabetInput; }

export function createAlphabet(text: string): Alphabet { return new Alphabet(text); }

export function resolveAlphabet(input?: AlphabetInput): Alphabet {
  if (input === undefined) return DEFAULT_ALPHABET;
  if (input instanceof Alphabet) return input;
  return new Alphabet(input);
}

/** Alias acceptance is opt-in and limited to the two compatible built-in layouts. */
export interface DecodeOptions extends Options { acceptAliases?: boolean; }

export function resolveDecoderIndex(alphabet: Alphabet, acceptAliases = false): (symbol: string) => number {
  if (!acceptAliases) return symbol => alphabet.indexOf(symbol);
  if (alphabet.text !== DEFAULT_ALPHABET_TEXT && alphabet.text !== TWO_BYTE_ALPHABET_TEXT) {
    throw new RangeError("Alias decoding requires the default or two-byte alphabet");
  }
  const aliases = new Map<string, number>();
  for (const text of [DEFAULT_ALPHABET_TEXT, TWO_BYTE_ALPHABET_TEXT]) {
    Array.from(text).forEach((symbol, index) => aliases.set(symbol, index));
  }
  return symbol => aliases.get(symbol) ?? alphabet.indexOf(symbol);
}
