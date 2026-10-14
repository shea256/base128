import {encode,decode,encodeInteger,decodeInteger} from '../packages/js/dist/index.js';
let input='';
for await (const chunk of process.stdin) input+=chunk.toString();
const data=JSON.parse(input);
const result = {
  binary: data.binary.map(item=>{
    const bytes=Uint8Array.from(Buffer.from(item, 'hex'));
    const encoded=encode(bytes, data.custom ? {alphabet:data.custom} : {});
    const roundtrip=Buffer.from(decode(encoded, data.custom ? {alphabet:data.custom} : {})).toString('hex');
    return {encoded, roundtrip};
  }),
  integer: data.integer.map(item=>{
    const encoded=encodeInteger(BigInt(item), data.custom ? {alphabet:data.custom} : {});
    const roundtrip=String(decodeInteger(encoded, data.custom ? {alphabet:data.custom} : {}));
    return {encoded, roundtrip};
  }),
};
process.stdout.write(JSON.stringify(result));
