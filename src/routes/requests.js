'use strict';
// Requests: Management accounts raise them (text + optional photo); only the super admin changes the status.
const {q,q1,ex}=require('../db');const {today,audit,bad}=require('../util');const {route}=require('../router');
const ST=['pending','ongoing','completed'],IMG=/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/;
route('GET','/api/requests','admin',()=>({list:q("SELECT id,text,status,created_by u,at,done_at,photo IS NOT NULL ph FROM requests ORDER BY (status='completed'),id DESC")}));
route('GET','/api/requests/photo','admin',(u,b,res)=>{const r=q1('SELECT photo FROM requests WHERE id=?',+res.query.get('id'));if(!r||!r.photo)bad('No photo',404);return{img:r.photo}});
route('POST','/api/requests','admin',(u,b)=>{if(u.super)bad('Requests are raised from Management accounts',403);
 const t=String(b.text||'').trim().slice(0,1000);if(!t)bad('Write the request');
 const p=String(b.photo||'');if(p&&(p.length>900000||!IMG.test(p)))bad('Photo is too large or not valid');
 const id=+ex('INSERT INTO requests(text,photo,created_by,at) VALUES(?,?,?,?)',t,p||null,u.id,today()).lastInsertRowid;audit(u.id,'Raised request #'+id);return{ok:1,id}});
route('POST','/api/requests/status','super',(u,b)=>{if(!ST.includes(b.status))bad('Invalid status');
 if(!ex('UPDATE requests SET status=?,done_at=? WHERE id=?',b.status,b.status=='completed'?today():null,+b.id).changes)bad('No such request',404);
 audit(u.id,`Request #${+b.id} set to ${b.status}`);return{ok:1}});