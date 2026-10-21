import { Alphabet, type DecodeOptions } from './alphabet.js';
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
/** Wrap an already encoded payload. Bare output remains the default. */
export declare function wrap(payload: string, options?: EnvelopeOptions): string;
/** Require the selected wrapper shape; verify the checksum before returning payload. */
export declare function unwrap(text: string, options?: EnvelopeOptions): Unwrapped;
