import test from 'node:test';
import assert from 'node:assert/strict';
import {seal,unseal} from '../estudos/crypto.mjs';
test('encryption roundtrip preserves unicode and hides content',async()=>{
 const data=await seal('Olá, conteúdo de teste','tester','test-only-pass');
 assert.equal(await unseal(data,'TESTER','test-only-pass'),'Olá, conteúdo de teste');
 assert.ok(!JSON.stringify(data).includes('conteúdo'));
});
test('wrong password, wrong user and modified data are rejected',async()=>{
 const data=await seal('private','tester','test-only-pass');
 await assert.rejects(unseal(data,'tester','wrong'));
 await assert.rejects(unseal(data,'another','test-only-pass'));
 const modified={...data,data:(data.data[0]==='A'?'B':'A')+data.data.slice(1)};
 await assert.rejects(unseal(modified,'tester','test-only-pass'));
});
