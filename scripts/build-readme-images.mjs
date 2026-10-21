import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {encode} from '../packages/js/dist/index.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const alphabet=JSON.parse(await readFile(resolve(root,'specs/alphabet.json'),'utf8'));
const dest=resolve(root,'docs/images');
await mkdir(dest,{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(x,y,value,size=18,color='#dce7ed',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(value)}</text>`;
const box=(x,y,w,h,color='#141e27',stroke='#293a45')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${color}" stroke="${stroke}"/>`;
const svg=(height,title,description,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="${height}" viewBox="0 0 1120 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc>
<rect width="1120" height="${height}" rx="18" fill="#0c1117"/>
<g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif">${body}</g></svg>\n`;
const groups=[
  [10,'Digits','#9ee8b0'],[36,'Uppercase Latin','#82d6c9'],[62,'Lowercase Latin','#8cbde3'],
  [94,'Punctuation','#a9b7c6'],[103,'Uppercase Greek','#c6b3ed'],[122,'Lowercase Greek','#e5b59c'],[128,'Compact','#edcf82'],
];
let chart=text(40,52,'Base128 Alphabet',28)+'<g transform="translate(0,-50)">';
for(const [i,symbol] of alphabet.symbols.entries()) {
  const x=40+(i%16)*65,y=144+Math.floor(i/16)*70;
  const color=groups.find(([end])=>i<end)[2];
  chart+=box(x,y,57,62)+`<path d="M${x+10} ${y+61}h37" stroke="${color}" stroke-width="2"/>`;
  chart+=text(x+28.5,y+32,symbol.character,27,color,'text-anchor="middle" font-family="Menlo, Consolas, monospace"');
  chart+=text(x+28.5,y+51,i,11,'#9aaebd','text-anchor="middle"');
}
for(const [i,[,label,color]] of groups.entries()) {
  const x=40+(i%4)*267,y=740+Math.floor(i/4)*30;
  chart+=`<circle cx="${x+5}" cy="${y-5}" r="4" fill="${color}"/>`+text(x+18,y,label,15,'#bccbd5');
}
await writeFile(resolve(dest,'base128-alphabet.svg'),svg(750,'Base128 v0.1 alphabet chart','All 128 symbols in canonical order, with indices and seven color-coded character groups. Compact symbols at indices 122 through 127 are ¥ § © ® ¶ ÷.',chart+'</g>'));

const bytes=new TextEncoder().encode('Hi');
const bits=Array.from(bytes,b=>b.toString(2).padStart(8,'0')).join('');
const chunks=Array.from({length:Math.ceil(bits.length/7)},(_,i)=>bits.slice(i*7,i*7+7));
const indices=chunks.map(s=>parseInt(s.padEnd(7,'0'),2));
const symbols=indices.map(i=>alphabet.symbols[i].character);
if(symbols.join('')!==encode(bytes)) throw new Error('Diagram does not match the current library');
let diagram=text(40,52,'How Base128 Encodes Bytes',28)+'<g transform="translate(0,-50)">';
diagram+=text(40,177,'Bytes',14,'#9ee8b0')+text(40,206,'2 bytes = 16 bits',15,'#9aaebd');
for(const [i,b] of bytes.entries()) {
 const x=314+i*330;diagram+=box(x,142,300,86)+text(x+150,173,`${String.fromCharCode(b)} · hex ${b.toString(16).toUpperCase()}`,16,'#9aaebd','text-anchor="middle"')+text(x+150,209,b.toString(2).padStart(8,'0'),26,'#dce7ed','text-anchor="middle" font-family="Menlo, Consolas, monospace"');
}
diagram+=text(630,260,'↓  Regroup the bitstream from the left',16,'#9aaebd','text-anchor="middle"');
diagram+=text(40,318,'7-bit groups',14,'#82d6c9')+text(40,347,'7 bits per symbol',15,'#9aaebd');
for(const [i,chunk] of chunks.entries()) {
 const x=314+i*220;diagram+=box(x,282,190,83);
 diagram+=`<text x="${x+95}" y="320" font-size="26" fill="#dce7ed" text-anchor="middle" font-family="Menlo, Consolas, monospace"><tspan>${chunk}</tspan><tspan fill="#edcf82">${'0'.repeat(7-chunk.length)}</tspan></text>`;
 diagram+=text(x+95,348,`index ${indices[i]}`,15,'#9aaebd','text-anchor="middle"');
}
diagram+=text(630,398,'↓  Look up each index in the v0.1 alphabet',16,'#9aaebd','text-anchor="middle"');
diagram+=text(40,457,'Base128 symbols',14,'#8cbde3')+text(40,486,'Payload: '+symbols.join(''),18,'#dce7ed');
for(const [i,symbol] of symbols.entries()) {
 const x=314+i*220;diagram+=box(x,420,190,82,'#14261f','#365e4a')+text(x+95,475,symbol,42,'#9ee8b0','text-anchor="middle" font-family="Menlo, Consolas, monospace"');
}
diagram+=text(40,550,'Gold bits are zero-filled tail bits, not extra input bytes. No padding character is added.',16,'#edcf82');
diagram+=text(40,579,'Seven bits per symbol describes information content; a Unicode symbol may use multiple UTF-8 bytes.',15,'#9aaebd');
await writeFile(resolve(dest,'how-base128-encodes-bytes.svg'),svg(560,'How Base128 Encodes Bytes','The UTF-8 bytes for Hi are 01001000 and 01101001. Regrouped and zero-filled: 0100100, 0011010, 0100000. Indices 36, 26, 32 map to a, Q, W. The payload is aQW.',diagram+'</g>'));
console.log('Generated base128-alphabet.svg and how-base128-encodes-bytes.svg from the v0.1 alphabet.');
