import {
  DEFAULT_ALPHABET, createAlphabet, encode, decode,
  encodeInteger, decodeInteger,
} from './vendor/index.js?v=alphabet-v2';

const $ = id => document.getElementById(id);
const input = $('payload-input');
const output = $('payload-output');
const inputType = $('input-type');
const customAlphabet = $('custom-alphabet');
const directionButtons = [$('dir-encode'),$('dir-decode')];
let direction = 'encode';
let selectedType = inputType.value;
const encodeDrafts = {text:input.value, hex:'', integer:'1000'};
let lastOutput = '';
let conversionSucceeded = false;
let lastDownload = {bytes:new Uint8Array(), filename:'base128.txt',mime:'text/plain;charset=utf-8'};

function hexToBytes(text) {
  const hex=text.replace(/\s/g,'');
  if (!/^[0-9a-f]*$/i.test(hex)) throw new Error('Use only hexadecimal digits (0–9, A–F) and whitespace');
  if (hex.length % 2) throw new Error(`Incomplete hex byte: ${hex.length} digits. Each byte needs two digits; add or remove a digit.`);
  const bytes=new Uint8Array(hex.length/2);
  for(let i=0;i<bytes.length;i++) bytes[i]=parseInt(hex.slice(i*2,i*2+2),16);
  return bytes;
}
function bytesToHex(bytes) {return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
function setFeedback(message,error=false) { const el=$('feedback'); el.textContent=message; el.classList.toggle('error',error); }
function alphabetOption() {
  const alphabet=customAlphabet.value;
  if (!alphabet) return DEFAULT_ALPHABET;
  return createAlphabet(alphabet);
}
function setMetric(id,value) {$(id).textContent=value;}
function updateComparison(bytes,encoded) {
  if (!bytes || encoded===undefined) {
    for(const id of ['input-bytes','encoded-chars','encoded-bytes','base64-chars']) setMetric(id,'—');
    return;
  }
  setMetric('input-bytes',bytes.length.toLocaleString());
  setMetric('encoded-chars',Array.from(encoded).length.toLocaleString());
  setMetric('encoded-bytes',new TextEncoder().encode(encoded).length.toLocaleString());
  // Base64 uses ceil(8n / 6) characters when unpadded.
  setMetric('base64-chars',Math.ceil(bytes.length*8/6).toLocaleString());
}
function update() {
  $('type-label').textContent=direction==='encode'?'Input type':'Output type';
  $('input-label').textContent=direction==='encode'?'Input':'Base128 input';
  $('input-hint').textContent=direction==='encode'
    ? {text:'Text is converted to UTF-8 bytes',hex:'Two hex digits per byte, e.g. 48 65 6c 6c 6f',integer:'Nonnegative decimal BigInt'}[inputType.value]
    : 'Paste a Base128 payload using the selected alphabet';
  $('output-hint').textContent=direction==='encode'?'Base128 payload':
    {text:'Decoded UTF-8 text',hex:'Decoded binary (hex)',integer:'Decoded decimal integer'}[inputType.value];
  try {
    const alphabet=alphabetOption();
    let result, bytes=null, encoded;
    if (inputType.value==='integer') {
      if (direction==='encode') {
        if (!/^\d+$/.test(input.value.trim())) throw new Error('Enter a nonnegative decimal integer');
        result=encodeInteger(BigInt(input.value.trim()),{alphabet});
      } else {
        result=String(decodeInteger(input.value,{alphabet}));
      }
    } else if (direction==='encode') {
      bytes=inputType.value==='text' ? new TextEncoder().encode(input.value) : hexToBytes(input.value);
      encoded=encode(bytes,{alphabet});
      result=encoded;
    } else {
      encoded=input.value;
      bytes=decode(encoded,{alphabet});
      result=inputType.value==='text'
        ? new TextDecoder('utf-8',{fatal:true}).decode(bytes)
        : bytesToHex(bytes);
    }
    output.value=result;
    lastOutput=result;
    conversionSucceeded=true;
    const downloadable = inputType.value==='hex' && direction==='decode' ? bytes : new TextEncoder().encode(result);
    lastDownload={bytes:downloadable,filename:inputType.value==='hex'&&direction==='decode'?'base128-decoded.bin':'base128-output.txt',mime:inputType.value==='hex'&&direction==='decode'?'application/octet-stream':'text/plain;charset=utf-8'};
    updateComparison(bytes,encoded);
    setFeedback('');
  } catch(error) {
    output.value='';lastOutput='';
    conversionSucceeded=false;
    updateComparison(null);
    setFeedback(error.message||String(error),true);
  }
  $('copy-output').disabled=!conversionSucceeded || !lastOutput;
  $('download-output').disabled=!conversionSucceeded;
  $('swap').disabled=!conversionSucceeded;
}

function setType() {
  const next=inputType.value;
  if (next===selectedType) return;
  if (direction==='encode') {
    encodeDrafts[selectedType]=input.value;
    // Text and hex are two representations of the same bytes.
    if (selectedType==='text' && next==='hex') {
      encodeDrafts.hex=bytesToHex(new TextEncoder().encode(input.value));
    } else if (selectedType==='hex' && next==='text') {
      try { encodeDrafts.text=new TextDecoder('utf-8',{fatal:true}).decode(hexToBytes(input.value)); }
      catch { /* Restore the previous text draft when the bytes are not UTF-8. */ }
    }
    input.value=encodeDrafts[next];
  }
  selectedType=next;
  update();
}

function setDirection(next) {
  if (next===direction) return;
  // The previous result is the input for the inverse conversion.
  input.value=conversionSucceeded?lastOutput:'';
  direction=next;
  directionButtons.forEach(btn=>{
    const isCurrent=btn.id===`dir-${next}`;
    btn.classList.toggle('selected',isCurrent);
    btn.setAttribute('aria-pressed',String(isCurrent));
  });
  update();
}
$('dir-encode').addEventListener('click',()=>setDirection('encode'));
$('dir-decode').addEventListener('click',()=>setDirection('decode'));
[input,customAlphabet].forEach(el=>el.addEventListener('input',update));
inputType.addEventListener('change',setType);
$('reset-alphabet').addEventListener('click',()=>{customAlphabet.value='';update();});
$('swap').addEventListener('click',()=>{
  if (!conversionSucceeded) return;
  const next=direction==='encode'?'decode':'encode';
  setDirection(next);
});
$('copy-output').addEventListener('click',async()=>{
  if (!lastOutput) return;
  try {await navigator.clipboard.writeText(lastOutput);setFeedback('Output copied to clipboard.');}
  catch {setFeedback('Clipboard unavailable; select and copy the output text.',true);}
});
function downloadBytes(bytes,filename,mime) {
  const blob=new Blob([bytes],{type:mime});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('download-output').addEventListener('click',()=>{
  if (conversionSucceeded) downloadBytes(lastDownload.bytes,lastDownload.filename,lastDownload.mime);
});
$('file-run').addEventListener('click',async()=>{
  const status=$('file-status');
  const file=$('file-input').files?.[0];
  if(!file){status.textContent='Choose a file first.';return;}
  try {
    const alphabet=alphabetOption();
    const bytes=new Uint8Array(await file.arrayBuffer());
    const op=$('file-operation').value;
    if(op==='encode') {
      const text=encode(bytes,{alphabet});
      downloadBytes(new TextEncoder().encode(text),file.name+'.b128','text/plain;charset=utf-8');
      status.textContent=`Encoded ${file.name} (${bytes.length.toLocaleString()} bytes) into ${Array.from(text).length.toLocaleString()} Base128 characters.`;
    } else {
      const utf8=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
      const restored=decode(utf8,{alphabet});
      const name=file.name.endsWith('.b128')?file.name.slice(0,-5):file.name+'.decoded';
      downloadBytes(restored,name||'restored.bin','application/octet-stream');
      status.textContent=`Decoded ${file.name} into ${restored.length.toLocaleString()} bytes.`;
    }
  } catch(error) {status.textContent=`Cannot process file: ${error.message}`;}
});

// Render the canonical symbol index without normalization or HTML injection.
const grid=$('alphabet-grid');
for (let i=0;i<128;i++) {
  const glyph=DEFAULT_ALPHABET.symbolAt(i);
  const category=i<94?'ascii':i<103?'upper':i<122?'lower':'math';
  const cp='U+'+glyph.codePointAt(0).toString(16).toUpperCase().padStart(4,'0');
  const button=document.createElement('button');
  button.type='button';button.className=`symbol-cell ${category}`;
  button.title=`Index ${i} · ${cp} · click to copy`;
  button.setAttribute('aria-label',`Copy character ${glyph}, index ${i}, ${cp}`);
  for (const [name,value] of [['glyph',glyph],['number',String(i)],['unicode',cp]]) {
    const span=document.createElement('span');span.className=name;span.textContent=value;button.append(span);
  }
  button.addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(glyph);setFeedback(`Copied ${glyph} (${cp}) to clipboard.`);}
    catch {setFeedback(`Character ${glyph} has index ${i} and code point ${cp}.`,true);}
  });
  grid.append(button);
}
update();
