/** Run Python 3.10+ using PYTHON, python3, python, or the Windows launcher. */
import {spawnSync} from 'node:child_process';
const candidates=process.env.PYTHON
  ? [[process.env.PYTHON]]
  : [['python3'],['python'],['py','-3']];
const probe='import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)';
let selected;
for (const [command,...prefix] of candidates) {
  const result=spawnSync(command,[...prefix,'-c',probe],{stdio:'ignore'});
  if (!result.error && result.status===0) {selected=[command,...prefix];break;}
}
if (!selected) {
  console.error('Python 3.10+ is required. Install it or set PYTHON to its executable path.');
  process.exit(1);
}
const [command,...prefix]=selected;
const result=spawnSync(command,[...prefix,...process.argv.slice(2)],{stdio:'inherit'});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
