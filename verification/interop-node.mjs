// Test adapter only: exercise the real JS API with numeric reference digits.
import {encode, decode, encodeInteger, decodeInteger} from '../packages/js/dist/index.js';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const {alphabet, requests} = JSON.parse(input);
const symbols = Array.from(alphabet);
const indices = new Map(symbols.map((symbol, index) => [symbol, index]));
const options = {alphabet};
const digits = text => Array.from(text, symbol => indices.get(symbol));
const results = requests.map(request => {
  const text = request.values?.map(index => symbols[index]).join('');
  switch (request.op) {
    case 'encode': return digits(encode(Uint8Array.from(request.values), options));
    case 'encodeInteger': return digits(encodeInteger(BigInt(request.decimal), options));
    case 'decode':
      try { return Array.from(decode(text, options)); } catch { return null; }
    case 'decodeInteger':
      try { return String(decodeInteger(text, options)); } catch { return null; }
    default: throw new Error(`Unknown operation: ${request.op}`);
  }
});
process.stdout.write(JSON.stringify(results));
