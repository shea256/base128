/** Zero-dependency local preview server for the self-contained website folder. */
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('.',import.meta.url)));
const port=Number(process.env.PORT||8080);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url||'/',`http://${req.headers.host||'localhost'}`).pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if (!file.startsWith(root+sep)) {res.writeHead(403).end('Forbidden');return;}
    const info=await stat(file);
    if (!info.isFile()) {res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(await readFile(file));
  } catch {res.writeHead(404).end('Not found');}
}).listen(port,()=>console.log(`Base128 playground: http://localhost:${port}/`));
