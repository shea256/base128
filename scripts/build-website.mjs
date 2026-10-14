import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'website/vendor'),{recursive:true});
for (const basename of ['index.js','alphabet.js','binary.js','integer.js']) {
  const source=await readFile(resolve(root,'packages/js/dist',basename),'utf8');
  // Version every module dependency so cached v1 modules cannot mix with v4.
  const browserSource=source.replace(/from "(\.\/[^"?]+\.js)"/g,'from "$1?v=alphabet-v4"');
  await writeFile(resolve(root,'website/vendor',basename),browserSource);
}
console.log('Built browser-friendly vendor modules in website/vendor');
