"""Randomized Python ↔ Node interoperability without dependencies."""
import json
import random
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'packages'/'python'))
from base128 import DEFAULT_ALPHABET_TEXT, encode, decode, encode_integer, decode_integer

rng=random.Random(128)
hex_cases=[rng.randbytes(n).hex() for n in range(150)]
integer_cases=[str(rng.getrandbits(i)) for i in range(0,500,3)]
for custom in (None, DEFAULT_ALPHABET_TEXT[::-1]):
    payload={'binary':hex_cases, 'integer':integer_cases, 'custom':custom}
    process=subprocess.run(['node','scripts/interop-node.mjs'],input=json.dumps(payload),cwd=ROOT,text=True,capture_output=True,check=True)
    from_node=json.loads(process.stdout)
    for hex_text,result in zip(hex_cases,from_node['binary'],strict=True):
        kwargs={'alphabet':custom} if custom else {}
        assert encode(bytes.fromhex(hex_text),**kwargs)==result['encoded']
        assert decode(result['encoded'],**kwargs).hex()==result['roundtrip']==hex_text
    for decimal,result in zip(integer_cases,from_node['integer'],strict=True):
        kwargs={'alphabet':custom} if custom else {}
        assert encode_integer(int(decimal),**kwargs)==result['encoded']
        assert str(decode_integer(result['encoded'],**kwargs))==result['roundtrip']==decimal
print(f'PASS: two alphabets, {len(hex_cases)*2} byte inputs and {len(integer_cases)*2} integers match in Python and Node')
