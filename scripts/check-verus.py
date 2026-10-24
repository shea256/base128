"""Verify the production numeric codec bodies with pinned Verus (no runtime dependency)."""
import argparse
import os
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def verification_source():
    source = (ROOT / 'packages/rust/src/binary_core.rs').read_text()
    # This deliberately small source format permits only comments and free functions.
    # Reject unsupported syntax rather than silently omitting production code.
    source = re.sub(r'//[^\n]*', '', source)
    if any(token in source for token in ['"', "'", '/*', '*/', '#']) or re.search(r'\w+\s*!\s*[({\[]', source):
        raise ValueError('Numeric core must not contain strings, attributes, macros, or block comments')
    template = (ROOT / 'verification/verus/binary.rs.in').read_text()
    count = 0
    while source.strip():
        match = re.match(r'\s*(pub\(crate\) fn (\w+)\([^{}]*?\)) -> ([^{]+)\{', source)
        if not match:
            raise ValueError('Unsupported binary_core.rs syntax')
        signature, name, result_type = match.groups()
        start = match.end()
        depth = 1
        end = start
        while depth and end < len(source):
            depth += (source[end] == '{') - (source[end] == '}')
            end += 1
        if depth:
            raise ValueError(f'Unclosed body: {name}')
        body = source[start:end - 1]
        for marker, replacement in [
            (f'/* @signature {name} */', f'{signature} -> (result: {result_type.strip()})'),
            (f'/* @body {name} */', body),
        ]:
            if template.count(marker) != 1:
                raise ValueError(f'Expected exactly one {marker}')
            template = template.replace(marker, replacement)
        source = source[end:]
        count += 1
    if count != 6 or '/* @' in template:
        raise ValueError('Incomplete production-body coverage')
    return template


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verus', default=os.environ.get('VERUS', 'verus'))
    parser.add_argument('--check-mutations', action='store_true',
                        help='also require representative broken implementations to fail verification')
    args = parser.parse_args()
    version = (ROOT / 'verification/verus/version.txt').read_text().strip()
    info = subprocess.check_output([args.verus, '--version'], text=True)
    if version not in info:
        raise SystemExit(f'Expected Verus {version}; got {info}')
    with tempfile.TemporaryDirectory(prefix='base128-verus-') as directory:
        path = Path(directory) / 'binary.rs'
        source = verification_source()
        path.write_text(source)
        command = [args.verus, str(path), '--crate-type=lib', '--no-cheating']
        subprocess.run(command, check=True)
        if args.check_mutations:
            mutations = [
                ('byte packing', '\n    let combined = (buffer << 8)', '\n    let combined = (buffer << 7)'),
                ('tail padding', 'Some((buffer << (7 - bits)) as u8)', 'Some((buffer << (6 - bits)) as u8)'),
                ('length rejection', '    symbols_mod8 != 1', '    symbols_mod8 != 2'),
            ]
            for label, original, broken in mutations:
                if source.count(original) != 1:
                    raise ValueError(f'Mutation target changed: {label}')
                path.write_text(source.replace(original, broken))
                result = subprocess.run(command, text=True, capture_output=True)
                output = result.stdout + result.stderr
                if result.returncode == 0 or 'postcondition not satisfied' not in output:
                    raise RuntimeError(f'Mutation did not fail its contract: {label}\n{output}')
                print(f'PASS: rejected {label} mutation', flush=True)
    print('PASS: all six production numeric functions verified (no cheating)')


if __name__ == '__main__':
    main()
