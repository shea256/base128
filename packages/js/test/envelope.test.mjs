import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {wrap, unwrap, encode, decode, encodeInteger, DEFAULT_ALPHABET, MATH_ALPHABET, createAlphabet} from '../dist/index.js';
const vectors=JSON.parse(readFileSync(new URL('../../../specs/envelope-vectors.json',import.meta.url),'utf8'));

test('independent envelope fixtures: both modes, alphabets, all four wrapper shapes',()=>{
  for (const v of vectors) {
    const alphabet=[DEFAULT_ALPHABET,MATH_ALPHABET][v.alphabet];
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
  for (const bad of [good+'·',good+' ',good.replace('b128','B128'),good.replace('00','000'),good.replace('00','000'),good.replace('00','12b38'),good.replace('00','1x0'),good.replace('00','1b2'),good.replace('00','01'),good.replace('÷','∫'),good.slice(0,-1),good.slice(0,-1)+'1']) {
    assert.throws(()=>unwrap(bad,{...options,acceptAliases:true}));
  }
  assert.throws(()=>unwrap('b128·00·÷#',options),/field count/);
  assert.throws(()=>unwrap(good,{prefix:true}),/field count/);
  assert.throws(()=>unwrap(good,{checksum:true}),/field count/);
  assert.throws(()=>unwrap(good),/Invalid/);
  assert.throws(()=>unwrap(good,{...options,alphabet:MATH_ALPHABET}),/alphabet/);
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
  const mixed='÷∫'.repeat(4);
  assert.throws(()=>wrap(mixed,{prefix:true,checksum:true}),/Invalid/);
  const tolerant={prefix:true,checksum:true,acceptAliases:true};
  const envelope=wrap(mixed,tolerant);
  assert.equal(unwrap(envelope,tolerant).payload,mixed);
  assert.throws(()=>unwrap(envelope,{prefix:true,checksum:true}),/Invalid/);
  assert.throws(()=>unwrap(envelope.replace('∫','÷'),tolerant),/Checksum/);
  assert.deepEqual(decode(unwrap(envelope,tolerant).payload,{acceptAliases:true}),new Uint8Array(7).fill(255));
});

test('version 0 packs alphabet before mode and requires strict canonical headers',()=>{
  for (const [alphabet, mode, header] of [
    [DEFAULT_ALPHABET,'binary','00'],[DEFAULT_ALPHABET,'integer','01'],
    [MATH_ALPHABET,'binary','08'],[MATH_ALPHABET,'integer','09'],
  ]) {
    const payload=mode==='binary'?encode(Uint8Array.of(255),{alphabet}):encodeInteger(127n,{alphabet});
    assert.equal(wrap(payload,{alphabet,mode,prefix:true}),`b128·${header}·${payload}`);
  }
  const cases=[
    ['',/version/],['0',/configuration/],['000',/length/],['00🙂',/length/],
    ['10',/version/],['¶0',/version/],['÷00',/Reserved.*version/],
    ['∫00',/Invalid/],['0∫0',/Invalid/], // Header aliases never apply.
    ['02',/mode/],['07',/mode/],['0F',/mode/],
    ['0G',/alphabet 2$/],['0κ',/alphabet 14$/], // Direct IDs 2 and 14.
    ['0ψ',/length/],['0ψ00',/length/],['0ψ0',/alphabet 15$/], // Escaped ID 15.
    ['0ψ1',/alphabet 16$/],['0ψ÷',/alphabet 142$/], // Escaped IDs 16 and 142.
    ['0ω0',/alphabet 15$/],['0¥0',/mode/], // Mode 1/2 with escape.
    ['0ψ∫',/Invalid/],['0ψ🙂',/Invalid/],['0ψ ',/Invalid/],
  ];
  for (const [header,error] of cases) {
    assert.throws(()=>unwrap(`b128·${header}·00`,{prefix:true,acceptAliases:true}),error,header);
  }
});
