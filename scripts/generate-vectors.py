"""Generate fixed, independently calculated v3 compatibility vectors."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
abc = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" + "".join(chr(i) for i in range(33, 127) if not chr(i).isalnum()) + "ΓΔΘΛΞΠΦΨΩ" + "αβγδεζηθικλμξπστφψω" + "∑∏∫∂∇√"
assert len(abc) == len(set(abc)) == 128


def binary_reference(data: bytes, alphabet: str) -> str:
    bits = "".join(f"{byte:08b}" for byte in data)
    return "".join(alphabet[int(bits[i:i+7].ljust(7, "0"), 2)] for i in range(0, len(bits), 7))


def integer_reference(n: int, alphabet: str) -> str:
    if n == 0: return alphabet[0]
    digits = []
    while n:
        n, r = divmod(n, 128)
        digits.append(alphabet[r])
    return "".join(reversed(digits))

binary_data = [b"", b"\0", b"\1", b"\x7f", b"\x80", b"\xff", b"\0\0", b"\x01\x00", b"\0\1", b"\xff\xff\xff", b"Hello", b"Hello world!", b"Hello, Base128!", "Hi, 世界 🌍".encode("utf-8"), bytes(range(256))]
integer_data = [0, 1, 7, 15, 16, 35, 36, 61, 62, 63, 64, 65, 127, 128, 129, 255, 256, 1000, 65535, 2**64-1, 2**128, 2**256-1, 10**100]
reversed_abc = abc[::-1]

out = {
    "format": "base128-v3-test-vectors",
    "alphabet": abc,
    "binary": [{"hex": value.hex(), "encoded": binary_reference(value, abc)} for value in binary_data],
    "integer": [{"decimal": str(value), "encoded": integer_reference(value, abc)} for value in integer_data],
    "custom": {
        "alphabet": reversed_abc,
        "binary": [{"hex": value.hex(), "encoded": binary_reference(value, reversed_abc)} for value in binary_data[:13]],
        "integer": [{"decimal": str(value), "encoded": integer_reference(value, reversed_abc)} for value in integer_data],
    },
}
(ROOT / "specs" / "test-vectors.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(ROOT / "specs" / "alphabet-v3.json").write_text(json.dumps({
    "name": "Base128 default Unicode alphabet v3",
    "version": 3,
    "alphabet": abc,
    "symbols": [{"index": i, "character": s, "unicode": f"U+{ord(s):04X}"} for i,s in enumerate(abc)],
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {len(out['binary'])} binary / {len(out['integer'])} integer vectors")
