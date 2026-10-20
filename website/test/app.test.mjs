import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// A small DOM harness runs the actual page module without a browser dependency.
class Element {
  value=''; textContent=''; children=[]; disabled=false; checked=false; hidden=false;
  listeners=new Map(); classList={toggle(){}};
  setAttribute() {}
  append(...children) {this.children.push(...children);}
  replaceChildren(...children) {this.children=children;}
  addEventListener(event,callback) {this.listeners.set(event,callback);}
  async fire(event) {await this.listeners.get(event)?.();}
  click() {}
  remove() {}
}

test('website presets, strict and mixed decode, custom reset, explorer, and files', async () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const elements=new Map([...html.matchAll(/id="([^"]+)"/g)].map(([,id])=>[id,new Element()]));
  const get=id=>{assert.ok(elements.has(id),`HTML contains ${id}`);return elements.get(id);};
  for(const id of ['dir-encode','dir-decode']) get(id).id=id;
  get('input-type').value='integer';
  get('payload-input').value='122';
  get('alphabet-preset').value='default';
  globalThis.document={getElementById:get,createElement:()=>new Element(),body:new Element()};
  const {DEFAULT_ALPHABET_TEXT}=await import('../vendor/index.js');
  await import('../app.js');
  assert.equal(get('payload-output').value,'∂');
  assert.equal(get('alphabet-grid').children.length,128);
  const glyph=i=>get('alphabet-grid').children[i].children[0].textContent;
  assert.equal(glyph(122),'∂');
  get('alphabet-preset').value='two-byte';
  await get('alphabet-preset').fire('change');
  assert.equal(get('payload-output').value,'§');
  assert.equal(glyph(122),'§');
  assert.equal(glyph(127),'÷');
  await get('dir-decode').fire('click');
  assert.equal(get('payload-output').value,'122');
  get('payload-input').value='∂©';
  await get('payload-input').fire('input');
  assert.equal(get('payload-output').value,'');
  assert.match(get('feedback').textContent,/Invalid/);
  get('accept-aliases').checked=true;
  await get('accept-aliases').fire('change');
  assert.equal(get('payload-output').value,String(122*128+123));
  // Binary decoder must use the same alias option, and preserve padding checks.
  get('input-type').value='hex';
  await get('input-type').fire('change');
  get('payload-input').value='∫÷'.repeat(4);
  await get('payload-input').fire('input');
  assert.equal(get('payload-output').value,'ff'.repeat(7));
  get('payload-input').value='0÷';
  await get('payload-input').fire('input');
  assert.match(get('feedback').textContent,/padding/);
  // Custom alphabets disable aliases and render their actual indices.
  get('custom-alphabet').value=Array.from(DEFAULT_ALPHABET_TEXT).reverse().join('');
  await get('custom-alphabet').fire('input');
  assert.equal(get('alphabet-preset').value,'custom');
  assert.equal(get('accept-aliases').disabled,true);
  assert.equal(get('accept-aliases').checked,false);
  assert.equal(glyph(0),'∫');
  get('custom-alphabet').value='bad';
  await get('custom-alphabet').fire('input');
  assert.equal(get('alphabet-grid').children.length,0);
  assert.equal(get('download-output').disabled,true);
  await get('reset-alphabet').fire('click');
  assert.equal(get('alphabet-preset').value,'default');
  assert.equal(get('accept-aliases').disabled,false);
  assert.equal(glyph(122),'∂');
  // File decoding follows the shared preset/alias controls.
  get('alphabet-preset').value='two-byte';
  await get('alphabet-preset').fire('change');
  const bytes=new TextEncoder().encode('∫÷'.repeat(4));
  get('file-input').files=[{name:'mixed.b128',arrayBuffer:async()=>bytes.buffer}];
  get('file-operation').value='decode';
  await get('file-run').fire('click');
  assert.match(get('file-status').textContent,/Cannot process file/);
  get('accept-aliases').checked=true;
  let downloaded;
  const original=URL.createObjectURL;
  URL.createObjectURL=blob=>{downloaded=blob;return 'blob:test';};
  try {
    await get('file-run').fire('click');
    assert.match(get('file-status').textContent,/Decoded mixed.b128 into 7 bytes/);
    assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()),new Uint8Array(7).fill(255));
    // The two independent wrapper controls round-trip and require the requested shape.
    get('input-type').value='integer';
    await get('input-type').fire('change');
    await get('dir-encode').fire('click');
    get('payload-input').value='127';
    get('wrap-prefix').checked=true;
    get('wrap-checksum').checked=true;
    await get('wrap-checksum').fire('change');
    const envelope=get('payload-output').value;
    assert.ok(envelope.startsWith('b128·1i1·÷·'));
    await get('dir-decode').fire('click');
    assert.equal(get('payload-output').value,'127');
    get('payload-input').value=envelope.slice(0,-1)+(envelope.endsWith('0')?'1':'0');
    await get('payload-input').fire('input');
    assert.equal(get('payload-output').value,'');
    assert.equal(get('download-output').disabled,true);
    get('payload-input').value=envelope;
    get('wrap-checksum').checked=false;
    await get('wrap-checksum').fire('change');
    assert.match(get('feedback').textContent,/field count/);
    get('alphabet-preset').value='custom';
    await get('alphabet-preset').fire('change');
    assert.equal(get('wrap-prefix').disabled,true);
    assert.equal(get('wrap-prefix').checked,false);
  } finally {URL.createObjectURL=original;delete globalThis.document;}
});
