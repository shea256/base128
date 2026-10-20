/** The v4 alphabet is ordered, not normalized, and immutable. */
export declare const DEFAULT_ALPHABET_TEXT: string;
/** Two-byte UTF-8 preset, with the final six symbols in code-point order. */
export declare const TWO_BYTE_ALPHABET_TEXT: string;
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
export declare const TWO_BYTE_ALPHABET: Alphabet;
export type AlphabetInput = Alphabet | string;
export interface Options {
    alphabet?: AlphabetInput;
}
export declare function createAlphabet(text: string): Alphabet;
export declare function resolveAlphabet(input?: AlphabetInput): Alphabet;
/** Alias acceptance is opt-in and limited to the two compatible built-in layouts. */
export interface DecodeOptions extends Options {
    acceptAliases?: boolean;
}
export declare function resolveDecoderIndex(alphabet: Alphabet, acceptAliases?: boolean): (symbol: string) => number;
