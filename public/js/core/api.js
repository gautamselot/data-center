// Talking to the server: api(path,body), run(fn) (shows errors as a toast), load() (refreshes all data).
async function api(p,b){const r=await fetch(p,{method:b===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:b===undefined?undefined:JSON.stringify(b)});const j=await r.json().catch(()=>({}));if(!r.ok){if(r.status==401&&S.u){S.u=null;draw()}throw new Error(j.error||'Request failed')}return j}
const run=async f=>{try{await f()}catch(e){toast(e.message)}};
async function load(){const s=await api('/api/state');U=s.users;S.ents=s.ents;S.tgo=s.tgo;S.dflt=s.dflt;S.audit=s.audit;Object.keys(S.ents).forEach(k=>S.ents[k].p=k.split('|')[1]);S.op=s.op||{depts:[],wps:[],asg:{},ents:[]};if(S.u)S.u=U.find(x=>x.id==S.u.id)||S.u}
