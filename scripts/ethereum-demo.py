# /// script
# requires-python = ">=3.11"
# dependencies = ["cryptography>=46"]
# ///
"""Generate or verify the public, disposable Ethereum encoding example."""

import argparse
import base64
import html
import json
import sys
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages/python"))
from base128 import decode, encode

DATA = ROOT / "website/ethereum-demo.json"
START = "<!-- ethereum-demo:start -->"
END = "<!-- ethereum-demo:end -->"


def public_bytes(private_key: ec.EllipticCurvePrivateKey) -> bytes:
    """Ethereum uses x || y, without SEC1's uncompressed-point tag 0x04."""
    point = private_key.public_key().public_bytes(
        serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint
    )
    if len(point) != 65 or point[0] != 4:
        raise ValueError("Expected a 65-byte uncompressed secp256k1 point")
    return point[1:]


def representations(raw: bytes) -> dict[str, str]:
    return {
        "base16": "0x" + raw.hex(),
        "base32": base64.b32encode(raw).decode("ascii"),
        "base64": base64.b64encode(raw).decode("ascii"),
        "base128": encode(raw),
    }


def generate() -> dict[str, dict[str, str]]:
    key = ec.generate_private_key(ec.SECP256K1())
    private = key.private_numbers().private_value.to_bytes(32, "big")
    return {
        "private": representations(private),
        "public": representations(public_bytes(key)),
    }


def verify(data: dict[str, dict[str, str]]) -> None:
    private = bytes.fromhex(data["private"]["base16"][2:])
    public = bytes.fromhex(data["public"]["base16"][2:])
    if len(private) != 32 or len(public) != 64:
        raise ValueError("Expected a 32-byte private key and 64-byte public key")
    key = ec.derive_private_key(int.from_bytes(private, "big"), ec.SECP256K1())
    if public_bytes(key) != public:
        raise ValueError("Public key does not match the demo private key")
    for name, raw in [("private", private), ("public", public)]:
        values = data[name]
        if values != representations(raw):
            raise ValueError(f"Noncanonical {name} key encoding")
        restored = [
            bytes.fromhex(values["base16"][2:]),
            base64.b32decode(values["base32"]),
            base64.b64decode(values["base64"], validate=True),
            decode(values["base128"]),
        ]
        if any(value != raw for value in restored):
            raise ValueError(f"Failed to round-trip {name} key")


def markdown(data: dict[str, dict[str, str]]) -> str:
    lines = [START]
    for kind, size in [("private", 32), ("public", 64)]:
        lines += [
            f"**{kind.capitalize()} key ({size} bytes)**",
            "",
            "| Encoding | Characters | UTF-8 bytes | Display |",
            "| --- | ---: | ---: | --- |",
        ]
        for encoding, text in data[kind].items():
            escaped = html.escape(text, quote=False)
            for char, entity in [("|", "&#124;"), ("\\", "&#92;"), ("`", "&#96;")]:
                escaped = escaped.replace(char, entity)
            lines.append(
                f"| {encoding.replace('base', 'Base')} | {len(text)} | "
                f"{len(text.encode('utf-8'))} | <code>{escaped}</code> |"
            )
        lines.append("")
    return "\n".join(lines + [END])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--generate",
        action="store_true",
        help="publish a fresh disposable example to the fixture and README",
    )
    group.add_argument(
        "--check",
        action="store_true",
        help="verify the keypair, all encodings, and README tables",
    )
    args = parser.parse_args()
    data = generate() if args.generate else json.loads(DATA.read_text(encoding="utf-8"))
    verify(data)
    table = markdown(data)
    readme = ROOT / "README.md"
    text = readme.read_text(encoding="utf-8")
    before, remainder = text.split(START, 1)
    _, after = remainder.split(END, 1)
    expected = before + table + after
    if args.generate:
        DATA.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        readme.write_text(expected, encoding="utf-8")
        print(
            "Published a disposable demo keypair. Never use it for funds. Run npm run build next."
        )
    elif args.check:
        if text != expected:
            raise ValueError("README demo tables are out of sync with the fixture")
        print("PASS: secp256k1 keypair, eight encoding round-trips, and README tables")
    else:
        print(table)


if __name__ == "__main__":
    main()
