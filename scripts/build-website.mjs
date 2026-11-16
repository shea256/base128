import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'website/vendor'),{recursive:true});
for (const basename of ['index.js','alphabet.js','binary.js','integer.js','envelope.js']) {
  const source=await readFile(resolve(root,'packages/js/dist',basename),'utf8');
  // Version every module dependency so cached modules cannot mix across API revisions.
  const browserSource=source.replace(/from ["'](\.\/[^"'?]+\.js)["']/g,'from "$1?v=ethereum-demo-0.1"');
  await writeFile(resolve(root,'website/vendor',basename),browserSource);
}
console.log('Built browser-friendly vendor modules in website/vendor');
const ethereumDemo=JSON.parse(await readFile(resolve(root,'website/ethereum-demo.json'),'utf8'));
await writeFile(resolve(root,'website/vendor/ethereum-demo.js'),
  '// Generated from website/ethereum-demo.json by scripts/build-website.mjs.\n' +
  `export const ETHEREUM_DEMO = ${JSON.stringify(ethereumDemo,null,2)};\n`);
