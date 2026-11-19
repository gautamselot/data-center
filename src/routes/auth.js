'use strict';
// Sign in/out, who am I, the sign-in list, change own password.
const crypto=require('crypto');
const {q,q1,ex}=require('../db');
const {audit,hash,check,bad}=require('../util');
const {pub}=require('../state');
const {route}=require('../router');
// Login throttle (in memory): 5 failures per ID or 20 per IP in 5 minutes.
const fails={},WIN=3e5,YEAR=365*864e5;
const hit=k=>{const f=fails[k];return f&&Date.now()-f.t<WIN?f.n:0};
const bump=k=>{if(Object.keys(fails).length>5000)for(const x in fails)delete fails[x];fails[k]={n:hit(k)+1,t:Date.now()}};
const me=x=>({...pub(x),mc:x.must_change?1:0});
route('POST','/api/login',null,(u,b,res)=>{const id=String(b.id||'').trim().toLowerCase(),ki='u:'+id,kp='p:'+res.ip;
 if(hit(ki)>=5||hit(kp)>=20)bad('Too many attempts. Wait 5 minutes.',429);
 const x=q1('SELECT * FROM users WHERE lower(id)=? OR lower(ini)=?',id,id);if(!x||!x.active||!check(String(b.pw||''),x.pw_hash)){bump(ki);bump(kp);if(x)audit(x.id,'Failed sign-in');bad('ID or password is incorrect, or the account is inactive.',401)}
 delete fails[ki];ex('DELETE FROM sessions WHERE expires<?',Date.now());
 const t=crypto.randomBytes(32).toString('hex');ex('INSERT INTO sessions VALUES(?,?,?)',t,x.id,Date.now()+YEAR);res.cookie=`dc_session=${t}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${YEAR/1000}`;audit(x.id,'Signed in');return{user:me(x)}});
// Signs out THIS device only (other devices stay signed in).
route('POST','/api/logout','any',(u,b,res)=>{ex('DELETE FROM sessions WHERE token=?',res.token||'');res.cookie='dc_session=; HttpOnly; Path=/; Max-Age=0';return{ok:1}});
// Sign-in tiles. lbl = what the tile shows and fills in: initials for Management, the ID (firstname.lastname) for everyone else.
route('GET','/api/people',null,()=>({people:q('SELECT id,ini,role,super sa FROM users WHERE active=1 ORDER BY rowid').map(p=>({ini:p.ini,role:p.role,sa:p.sa,lbl:p.role=='admin'&&!p.sa?p.ini:p.id}))}));
route('GET','/api/me','any',u=>({user:me(u)}));
route('POST','/api/password','any',(u,b,res)=>{if(String(b.pw||'').length<8)bad('Use at least 8 characters');ex('UPDATE users SET pw_hash=?,must_change=0 WHERE id=?',hash(b.pw),u.id);ex('DELETE FROM sessions WHERE user_id=? AND token<>?',u.id,res.token||'');audit(u.id,'Changed own password');return{ok:1}});