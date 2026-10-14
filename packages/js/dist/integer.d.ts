import { type Options } from "./alphabet.js";
/** Nonnegative integer → minimal, big-endian positional Base128 numeral. */
export declare function encodeInteger(value: bigint, options?: Options): string;
/** Minimal, big-endian positional Base128 numeral → nonnegative bigint. */
export declare function decodeInteger(text: string, options?: Options): bigint;
