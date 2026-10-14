import { type Options } from "./alphabet.js";
/** Streaming MSB-first 7-bit byte encoder. No metadata or padding characters. */
export declare class BinaryEncoder {
    #private;
    constructor(options?: Options);
    write(bytes: Uint8Array): string;
    finish(): string;
}
/** Streaming decoder. Canonical trailing bits and encoded length checked in finish(). */
export declare class BinaryDecoder {
    #private;
    constructor(options?: Options);
    write(text: string): Uint8Array;
    finish(): void;
}
export declare function encode(bytes: Uint8Array, options?: Options): string;
export declare function decode(text: string, options?: Options): Uint8Array;
