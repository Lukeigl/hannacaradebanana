import {unseal} from './crypto.mjs';
const form=document.querySelector('#login'),button=document.querySelector('#submit'),status=document.querySelector('#status');
form.addEventListener('submit',async e=>{
 e.preventDefault();if(button.disabled)return;
 button.disabled=true;status.textContent='Abrindo seu material…';
 let bundle;
 try{
  if(!globalThis.crypto?.subtle)throw Error('Use HTTPS ou localhost para abrir esta página.');
  const r=await fetch('./content.enc.json',{cache:'no-store'});if(!r.ok)throw Error('Não foi possível carregar o material. Tente novamente.');bundle=await r.json();
 }catch{status.textContent='Não foi possível carregar o material. Confira sua conexão e abra o link por HTTPS.';button.disabled=false;return}
 try{
  const html=await unseal(bundle,form.elements.username.value,form.elements.password.value);
  form.elements.password.value='';document.open();document.write(html);document.close();
 }catch{status.textContent='Usuário ou senha incorretos, ou material indisponível. Confira os dados e tente novamente.';button.disabled=false;form.elements.password.value='';form.elements.password.focus()}
});
