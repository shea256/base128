import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DEFAULT_ALPHABET_TEXT} from '../../js/dist/index.js';

const cli=new URL('../bin/base128.mjs',import.meta.url).pathname;
function run(args,input){
  return spawnSync('node',[cli,...args],{input,encoding:null});
}

test('CLI supports stdin and files without modifying raw content',()=>{
  const bytes=Buffer.from([0,1,2,253,254,255,0,10]);
  const encoded=run(['encode'],bytes);
  assert.equal(encoded.status,0,encoded.stderr.toString());
  const decoded=run(['decode'],encoded.stdout);
  assert.equal(decoded.status,0,decoded.stderr.toString());
  assert.deepEqual(decoded.stdout,bytes);
  const dir=mkdtempSync(join(tmpdir(),'base128-test-'));
  try {
    const input=join(dir,'source.bin'),text=join(dir,'payload.b128'),output=join(dir,'restored.bin');
    writeFileSync(input,bytes);
    assert.equal(run(['encode',input,'-o',text]).status,0);
    assert.equal(run(['decode',text,'-o',output]).status,0);
    assert.deepEqual(readFileSync(output),bytes);
    writeFileSync(output, Buffer.from('DO NOT REPLACE'));
    writeFileSync(text,Buffer.from('01'));
    assert.notEqual(run(['decode',text,'-o',output]).status,0);
    assert.equal(readFileSync(output).toString(),'DO NOT REPLACE');
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('CLI integers and custom alphabets',()=>{
  assert.equal(run(['integer','encode','1000']).stdout.toString(),'7β');
  assert.equal(run(['integer','decode','7β']).stdout.toString(),'1000');
  const dir=mkdtempSync(join(tmpdir(),'base128-test-'));
  try {
    const abc=join(dir,'alphabet.txt');
    writeFileSync(abc,Array.from(DEFAULT_ALPHABET_TEXT).reverse().join(''),'utf8');
    const encoded=run(['encode','--alphabet-file',abc],Buffer.from('testing'));
    assert.equal(encoded.status,0,encoded.stderr.toString());
    const decoded=run(['decode','--alphabet-file',abc],encoded.stdout);
    assert.equal(decoded.status,0,decoded.stderr.toString());
    assert.equal(decoded.stdout.toString(),'testing');
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('CLI math preset and opt-in aliases',()=>{
  const bytes=Buffer.from([255,255,255,255,255,255,255]);
  const encoded=run(['encode','--alphabet','math'],bytes);
  assert.equal(encoded.status,0,encoded.stderr.toString());
  assert.equal(encoded.stdout.toString(),'∫'.repeat(8));
  assert.equal(run(['decode'],encoded.stdout).status,1);
  for (const args of [['decode','--alphabet','math'],['decode','--accept-aliases']]) {
    const decoded=run(args,encoded.stdout);
    assert.equal(decoded.status,0,decoded.stderr.toString());
    assert.deepEqual(decoded.stdout,bytes);
  }
  assert.deepEqual(run(['decode','--accept-aliases'],Buffer.from('÷∫'.repeat(4))).stdout,bytes);
  assert.equal(run(['integer','encode','122','--alphabet','math']).stdout.toString(),'∂');
  assert.equal(run(['integer','decode','∂','--accept-aliases']).stdout.toString(),'122');
  assert.equal(run(['encode','--accept-aliases'],bytes).status,1);
  assert.equal(run(['encode','--alphabet','unknown'],bytes).status,1);
  assert.equal(run(['encode','--alphabet','math','--alphabet-file','missing'],bytes).status,1);
});

test('CLI prefix/checksum combinations, inferred alphabet, and checked file output',()=>{
  const bytes=Buffer.from([255,0,255]);
  for(const preset of ['compact','math']) {
    for(const flags of [['--prefix'],['--checksum'],['--prefix','--checksum']]) {
      const encoded=run(['encode','--alphabet',preset,...flags],bytes);
      assert.equal(encoded.status,0,encoded.stderr.toString());
      const selection=flags.includes('--prefix')?[]:['--alphabet',preset];
      const decoded=run(['decode',...selection,...flags],encoded.stdout);
      assert.equal(decoded.status,0,decoded.stderr.toString());
      assert.deepEqual(decoded.stdout,bytes);
      const integer=run(['integer','encode','127','--alphabet',preset,...flags]);
      assert.equal(integer.status,0,integer.stderr.toString());
      const result=run(['integer','decode',integer.stdout.toString(),...selection,...flags]);
      assert.equal(result.status,0,result.stderr.toString());
      assert.equal(result.stdout.toString(),'127');
    }
  }
  const wrapped=run(['encode','--prefix','--checksum'],bytes).stdout.toString();
  assert.equal(run(['decode','--prefix'],wrapped).status,1);
  assert.equal(run(['decode','--prefix','--checksum'],'b128·00·÷#').status,1);
  assert.equal(run(['decode','--prefix','--checksum','--alphabet','math'],wrapped).status,1);
  assert.equal(run(['integer','decode',wrapped,'--prefix','--checksum']).status,1);
  const corrupted=wrapped.slice(0,-1)+(wrapped.endsWith('0')?'1':'0');
  const failure=run(['decode','--prefix','--checksum'],corrupted);
  assert.equal(failure.status,1);
  assert.equal(failure.stdout.length,0);
  const dir=mkdtempSync(join(tmpdir(),'base128-envelope-'));
  try {
    const target=join(dir,'target.bin');
    writeFileSync(target,'keep');
    assert.equal(run(['decode','--prefix','--checksum','-o',target],corrupted).status,1);
    assert.equal(readFileSync(target,'utf8'),'keep');
  } finally {rmSync(dir,{recursive:true,force:true});}
});
