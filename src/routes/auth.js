'use strict';
// Sign in/out, who am I, the sign-in initials list, change own password.
const crypto=require('crypto');
const {q,q1,ex}=require('../db');
const {audit,hash,check,bad}=require('../util');
const {pub}=require('../state');
const {route}=require('../router');
const fails={};
route('POST','/api/login',null,(u,b,res)=>{const id=String(b.id||'').trim().toLowerCase(),k=id,f=fails[k]||{n:0,t:0};if(f.n>=5&&Date.now()-f.t<3e5)bad('Too many attempts. Wait 5 minutes.',429);
 const x=q1('SELECT * FROM users WHERE lower(id)=? OR lower(ini)=?',id,id);if(!x||!x.active||!check(String(b.pw||''),x.pw_hash)){fails[k]={n:f.n+1,t:Date.now()};bad('ID or password is incorrect, or the account is inactive.',401)}
 delete fails[k];const t=crypto.randomBytes(32).toString('hex');ex('INSERT INTO sessions VALUES(?,?,?)',t,x.id,Date.now()+12*36e5);res.cookie=`dc_session=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200`;audit(x.id,'Signed in');return{user:pub(x)}});
route('POST','/api/logout','any',(u,b,res)=>{ex('DELETE FROM sessions WHERE user_id=?',u.id);res.cookie='dc_session=; HttpOnly; Path=/; Max-Age=0';return{ok:1}});
route('GET','/api/people',null,()=>({people:q('SELECT ini,role,super sa FROM users WHERE active=1 ORDER BY rowid')}));
route('GET','/api/me','any',u=>({user:pub(u)}));
route('POST','/api/password','any',(u,b)=>{if(String(b.pw||'').length<5)bad('Use at least 5 characters');ex('UPDATE users SET pw_hash=? WHERE id=?',hash(b.pw),u.id);audit(u.id,'Changed own password');return{ok:1}});
