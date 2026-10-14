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
    writeFileSync(text,Buffer.from('!"'));
    assert.notEqual(run(['decode',text,'-o',output]).status,0);
    assert.equal(readFileSync(output).toString(),'DO NOT REPLACE');
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('CLI integers and custom alphabets',()=>{
  assert.equal(run(['integer','encode','1000']).stdout.toString(),'(β');
  assert.equal(run(['integer','decode','(β']).stdout.toString(),'1000');
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
