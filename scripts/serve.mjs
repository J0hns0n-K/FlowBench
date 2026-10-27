import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

if(!existsSync('dist/index.html'))execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit',windowsHide:true});
const root=resolve('dist');
const port=Number(process.env.PORT??4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.map':'application/json'};
const server=createServer(async(req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Method not allowed');return;}
  try{
    const path=decodeURIComponent(new URL(req.url??'/',`http://127.0.0.1:${port}`).pathname);
    const file=resolve(root,`.${path==='/'?'/index.html':path}`);
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    if(!(await stat(file)).isFile()){res.writeHead(404);res.end('Not found');return;}
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`FlowBench Local: http://127.0.0.1:${port}`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
