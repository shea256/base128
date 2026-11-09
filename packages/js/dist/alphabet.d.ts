/** The v0.1 alphabet is ordered, not normalized, and immutable. */
export declare const DEFAULT_ALPHABET_TEXT = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BE\u03C0\u03C3\u03C4\u03C6\u03C8\u03C9\u0393\u0394\u0398\u039B\u039E\u03A0\u03A3\u03A6\u03A8\u03A9!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~\u00A5\u00F7\u2207\u221A\u222B";
/** A compiled alphabet: 128 unique Unicode scalar values, in index order. */
export declare class Alphabet {
    #private;
    constructor(text: string);
    get text(): string;
    get length(): number;
    symbolAt(index: number): string;
    indexOf(symbol: string): number;
}
export declare const DEFAULT_ALPHABET: Alphabet;
export type AlphabetInput = Alphabet | string;
export interface Options {
    alphabet?: AlphabetInput;
}
export declare function createAlphabet(text: string): Alphabet;
export declare function resolveAlphabet(input?: AlphabetInput): Alphabet;
export type DecodeOptions = Options;
export declare function resolveDecoderIndex(alphabet: Alphabet): (symbol: string) => number;
