import {cp, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'website/vendor'),{recursive:true});
for (const basename of ['index.js','alphabet.js','binary.js','integer.js']) {
  await cp(resolve(root,'packages/js/dist',basename),resolve(root,'website/vendor',basename));
}
console.log('Built browser-friendly vendor modules in website/vendor');
