"""Build/audit the Lean model and compare strict codecs in JS, Python, and Rust.

Requires lake, cargo, Node, and Python on PATH. Never rewrites reference fixtures.
"""
import itertools
import json
import random
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEAN = ROOT / 'verification' / 'lean'
sys.path.insert(0, str(ROOT / 'packages' / 'python'))
from base128 import encode, decode, encode_integer, decode_integer


def run(command, *, data=None, cwd=ROOT):
    result = subprocess.run(command, cwd=cwd, input=None if data is None else json.dumps(data),
                            text=True, capture_output=True)
    if result.returncode:
        sys.stderr.write(result.stdout + result.stderr)
        result.check_returncode()
    return result.stdout


def assert_equal(actual, expected, label, requests):
    if len(actual) != len(expected):
        raise AssertionError(f'{label}: wrong result count')
    for i, (got, want) in enumerate(zip(actual, expected, strict=True)):
        if got != want:
            raise AssertionError(f'{label}, case {i}: {requests[i]!r}: {got!r} != {want!r}')


def main():
    run(['lake', 'build'], cwd=LEAN)
    audit = run(['lake', 'env', 'lean', '-DwarningAsError=true', 'Audit.lean'], cwd=LEAN)
    declarations = re.findall(r"^'([^']+)' (?:depends on axioms: \[([^]]*)\]|does not depend on any axioms)$", audit, re.M)
    expected_names = re.findall(r'^#print axioms (\S+)$', (LEAN / 'Audit.lean').read_text(), re.M)
    if [name for name, _ in declarations] != expected_names or not declarations:
        raise AssertionError(f'Incomplete axiom audit:\n{audit}')
    allowed = {'propext', 'Classical.choice', 'Quot.sound'}
    for name, axioms in declarations:
        unexpected = {a.strip() for a in axioms.split(',') if a.strip()} - allowed
        if unexpected:
            raise AssertionError(f'{name} uses unapproved axioms: {unexpected}')
    print(f'PASS: {len(declarations)} theorem axiom audits (no sorryAx or additional axioms)', flush=True)

    run(['npm', 'run', 'build'])
    run(['cargo', 'build', '--manifest-path', 'packages/rust/Cargo.toml', '--locked',
         '--example', 'lean_conformance'])
    metadata = json.loads(run(['cargo', 'metadata', '--manifest-path', 'packages/rust/Cargo.toml',
                              '--no-deps', '--format-version', '1']))
    suffix = '.exe' if sys.platform == 'win32' else ''
    rust = Path(metadata['target_directory']) / 'debug' / 'examples' / ('lean_conformance' + suffix)
    reference = LEAN / '.lake' / 'build' / 'bin' / ('base128_reference' + suffix)

    compact = json.loads((ROOT / 'specs/test-vectors.json').read_text())
    math = json.loads((ROOT / 'specs/test-vectors-math.json').read_text())
    rng = random.Random(128)
    byte_cases = [list(bytes.fromhex(row['hex'])) for row in compact['binary']]
    byte_cases += [[n] for n in range(256)]
    byte_cases += [list(rng.randbytes(n)) for n in list(range(129)) + [255, 256, 511, 512]]
    byte_cases += [[0] * n for n in range(33)]
    decimals = [row['decimal'] for row in compact['integer']]
    decimals += [str(rng.getrandbits(n)) for n in range(0, 2049, 17)]
    decimals.append(str((1 << 2048) - 1))
    requests = [{'op': 'encode', 'values': b} for b in byte_cases]
    requests += [{'op': 'encodeInteger', 'decimal': n} for n in decimals]
    expected = json.loads(run([str(reference)], data=requests))

    # The independent, pre-existing fixtures anchor the model to the published wire format.
    for fixture in [compact, math, compact['custom']]:
        indices = {c: i for i, c in enumerate(fixture['alphabet'])}
        fixture_requests = [{'op': 'encode', 'values': list(bytes.fromhex(r['hex']))} for r in fixture['binary']]
        fixture_requests += [{'op': 'encodeInteger', 'decimal': r['decimal']} for r in fixture['integer']]
        fixture_expected = [[indices[c] for c in r['encoded']] for r in fixture['binary'] + fixture['integer']]
        assert_equal(json.loads(run([str(reference)], data=fixture_requests)), fixture_expected,
                     'independent fixtures', fixture_requests)

    # Include valid long payloads, every one/two-symbol binary string, invalid lengths,
    # nonzero padding, and integer leading zeroes. No implementation supplies the oracle.
    decode_requests = [{'op': 'decode', 'values': ds} for ds in expected[:len(byte_cases)]]
    decode_requests += [{'op': 'decodeInteger', 'values': ds} for ds in expected[len(byte_cases):]]
    decode_requests += [{'op': 'decode', 'values': list(ds)} for size in [0, 1, 2]
                        for ds in itertools.product(range(128), repeat=size)]
    for size in range(3, 41):
        for _ in range(8):
            ds = [rng.randrange(128) for _ in range(size)]
            decode_requests.append({'op': 'decode', 'values': ds})
            decode_requests.append({'op': 'decodeInteger', 'values': ds})
    decode_requests += [{'op': 'decodeInteger', 'values': ds} for ds in [[], [0], [0, 0], [0, 1], [0, 127], [0] * 30]]
    expected += json.loads(run([str(reference)], data=decode_requests))
    requests += decode_requests

    alphabets = [('Compact', compact['alphabet']), ('Math', math['alphabet']),
                 ('reversed', compact['custom']['alphabet']),
                 ('supplementary Unicode', ''.join(chr(0x1f600 + i) for i in range(128)))]
    for name, alphabet in alphabets:
        payload = {'alphabet': alphabet, 'requests': requests}
        for language, command in [('JavaScript', ['node', 'verification/interop-node.mjs']), ('Rust', [str(rust)])]:
            assert_equal(json.loads(run(command, data=payload)), expected, f'{language}/{name}', requests)
        indices = {c: i for i, c in enumerate(alphabet)}
        actual = []
        for request in requests:
            op = request['op']
            if op == 'encode':
                result = [indices[c] for c in encode(bytes(request['values']), alphabet=alphabet)]
            elif op == 'encodeInteger':
                result = [indices[c] for c in encode_integer(int(request['decimal']), alphabet=alphabet)]
            else:
                text = ''.join(alphabet[d] for d in request['values'])
                try:
                    result = list(decode(text, alphabet=alphabet)) if op == 'decode' else str(decode_integer(text, alphabet=alphabet))
                except ValueError:
                    result = None
            actual.append(result)
        assert_equal(actual, expected, f'Python/{name}', requests)
        print(f'PASS: {name}: {len(requests)} cases agree with Lean in all three libraries', flush=True)


if __name__ == '__main__':
    main()
