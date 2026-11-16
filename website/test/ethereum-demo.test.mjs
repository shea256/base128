import test from 'node:test';
import assert from 'node:assert/strict';
import {createECDH} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {encode, decode} from '../vendor/index.js';
import {ETHEREUM_DEMO} from '../vendor/ethereum-demo.js';

test('demo keypair and every encoding agree with independent byte representations',()=>{
  const fixture=JSON.parse(readFileSync(new URL('../ethereum-demo.json',import.meta.url),'utf8'));
  assert.deepEqual(ETHEREUM_DEMO,fixture);
  const key=createECDH('secp256k1');
  key.setPrivateKey(Buffer.from(fixture.private.base16.slice(2),'hex'));
  assert.equal(key.getPublicKey('hex','uncompressed').slice(2),fixture.public.base16.slice(2));
  for (const [kind,size] of [['private',32],['public',64],['address',20]]) {
    const values=fixture[kind];
    const bytes=Buffer.from(values.base16.slice(2),'hex');
    assert.equal(bytes.length,size);
    assert.equal(values.base16,'0x'+bytes.toString('hex'));
    assert.equal(values.base64,bytes.toString('base64'));
    // Independently expand RFC 4648 Base32 digits to bits and check zero padding.
    const digits=values.base32.replace(/=+$/,'');
    const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    assert.match(digits,/^[A-Z2-7]+$/);
    const bits=Array.from(digits,c=>alphabet.indexOf(c).toString(2).padStart(5,'0')).join('');
    assert.equal(bits.slice(0,size*8),Array.from(bytes,b=>b.toString(2).padStart(8,'0')).join(''));
    assert.match(bits.slice(size*8),/^0*$/);
    assert.equal(digits.length,Math.ceil(size*8/5));
    assert.equal(values.base32,digits+'='.repeat((8-digits.length%8)%8));
    assert.equal(values.base128,encode(bytes));
    assert.deepEqual(Buffer.from(decode(values.base128)),bytes);
    assert.equal(Array.from(values.base128).length,Math.ceil(size*8/7));
  }
});
