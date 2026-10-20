import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {wrap, unwrap, encode, decode, encodeInteger, DEFAULT_ALPHABET, TWO_BYTE_ALPHABET, createAlphabet} from '../dist/index.js';
const vectors=JSON.parse(readFileSync(new URL('../../../specs/envelope-vectors.json',import.meta.url),'utf8'));

test('independent envelope fixtures: both modes, alphabets, all four wrapper shapes',()=>{
  for (const v of vectors) {
    const alphabet=[DEFAULT_ALPHABET,TWO_BYTE_ALPHABET][v.alphabet];
    const options={alphabet,mode:v.mode,prefix:v.prefix,checksum:v.checksum};
    const payload=v.mode==='binary'?encode(Buffer.from(v.value,'hex'),{alphabet}):encodeInteger(BigInt(v.value),{alphabet});
    assert.equal(payload,v.payload);
    assert.equal(wrap(payload,options),v.wrapped);
    const result=unwrap(v.wrapped,options);
    assert.equal(result.payload,payload);
    assert.equal(result.alphabet.text,alphabet.text);
    assert.equal(result.mode,v.mode);
    if(v.prefix) {
      const inferred=unwrap(v.wrapped,{prefix:true,checksum:v.checksum});
      assert.equal(inferred.mode,v.mode);
      assert.equal(inferred.alphabet.text,alphabet.text);
    }
  }
});

test('require wrapper shape and checksum; reject malformed headers and tampering',()=>{
  const options={prefix:true,checksum:true};
  const good=wrap(encode(Uint8Array.of(255)),options);
  for (const bad of [good+'·',good+' ',good.replace('b128','B128'),good.replace('1b0','01b0'),good.replace('1b0','1b00'),good.replace('1b0','12b38'),good.replace('1b0','1x0'),good.replace('1b0','1b2'),good.replace('1b0','1i0'),good.replace('∫','÷'),good.slice(0,-1),good.slice(0,-1)+'1']) {
    assert.throws(()=>unwrap(bad,{...options,acceptAliases:true}));
  }
  assert.throws(()=>unwrap('b128·1b0·∫#',options),/field count/);
  assert.throws(()=>unwrap(good,{prefix:true}),/field count/);
  assert.throws(()=>unwrap(good,{checksum:true}),/field count/);
  assert.throws(()=>unwrap(good),/Invalid/);
  assert.throws(()=>unwrap(good,{...options,alphabet:TWO_BYTE_ALPHABET}),/alphabet/);
  assert.throws(()=>unwrap(good,{...options,mode:'integer'}),/mode/);
  assert.throws(()=>wrap('01',{prefix:true}),/padding/);
  assert.throws(()=>wrap('00',{mode:'integer',checksum:true}),/leading zero/);
  assert.throws(()=>wrap('',{mode:'integer',checksum:true}),/empty/);
  assert.throws(()=>wrap('',{prefix:'yes'}),/boolean/);
  assert.throws(()=>unwrap('',{mode:'text'}),/mode/);
  assert.throws(()=>unwrap(null),/string/);
});

test('custom Unicode alphabets and payload aliases retain explicit boundaries',()=>{
  const custom=createAlphabet(Array.from({length:128},(_,i)=>String.fromCodePoint(0x1f300+i)).join(''));
  const payload=encode(Uint8Array.of(255),{alphabet:custom});
  const wrapped=wrap(payload,{alphabet:custom,checksum:true});
  assert.equal(Array.from(wrapped.split('·')[1]).length,5);
  assert.equal(unwrap(wrapped,{alphabet:custom,checksum:true}).payload,payload);
  assert.throws(()=>wrap(payload,{alphabet:custom,prefix:true}),/built-in/);
  const dotted=createAlphabet('·'+DEFAULT_ALPHABET.text.slice(1));
  assert.throws(()=>wrap('',{alphabet:dotted,checksum:true}),/middle dot/);
  assert.equal(unwrap('··',{alphabet:dotted}).payload,'··');
  const mixed='∫÷'.repeat(4);
  assert.throws(()=>wrap(mixed,{prefix:true,checksum:true}),/Invalid/);
  const tolerant={prefix:true,checksum:true,acceptAliases:true};
  const envelope=wrap(mixed,tolerant);
  assert.equal(unwrap(envelope,tolerant).payload,mixed);
  assert.throws(()=>unwrap(envelope,{prefix:true,checksum:true}),/Invalid/);
  assert.throws(()=>unwrap(envelope.replace('÷','∫'),tolerant),/Checksum/);
  assert.deepEqual(decode(unwrap(envelope,tolerant).payload,{acceptAliases:true}),new Uint8Array(7).fill(255));
});
