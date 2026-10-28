// Credentials are accepted on stdin only. Never commit a plaintext study source.
import {readFile,writeFile} from 'node:fs/promises';
import {seal,unseal} from '../estudos/crypto.mjs';
let input='';for await(const chunk of process.stdin)input+=chunk;
const cfg=JSON.parse(input);input='';
if(!cfg.user||!cfg.password||!cfg.input||!cfg.output)throw Error('Required stdin keys: user, password, input, output');
if(cfg.mode==='decrypt'){
 const plain=await unseal(JSON.parse(await readFile(cfg.input,'utf8')),cfg.user,cfg.password);
 await writeFile(cfg.output,plain,{mode:0o600});
}else{
 const plain=await readFile(cfg.input,'utf8');
 const bundle=await seal(plain,cfg.user,cfg.password);
 if(await unseal(bundle,cfg.user,cfg.password)!==plain)throw Error('Roundtrip mismatch');
 await writeFile(cfg.output,JSON.stringify(bundle));
}
cfg.password='';console.log('Package operation verified.');
