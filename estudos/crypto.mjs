const enc = new TextEncoder();
const decode = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const encode = a => {let s='';for(const b of a)s+=String.fromCharCode(b);return btoa(s)};
async function keyFor(user,password,salt,usage){
 const material=await crypto.subtle.importKey('raw',enc.encode(user.trim().toLowerCase()+'\0'+password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,[usage]);
}
export async function seal(text,user,password){
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await keyFor(user,password,salt,'encrypt');
 const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(text));
 return {version:1,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:600000,salt:encode(salt),iv:encode(iv),data:encode(new Uint8Array(data))};
}
export async function unseal(bundle,user,password){
 if(bundle.version!==1||bundle.iterations!==600000||bundle.algorithm!=='AES-256-GCM'||bundle.kdf!=='PBKDF2-SHA256')throw Error('Unsupported bundle');
 const key=await keyFor(user,password,decode(bundle.salt),'decrypt');
 return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(bundle.iv)},key,decode(bundle.data)));
}
