'use strict';
// What the browser receives from /api/state, shaped per role. pub() = the safe public view of a user.
const {q,q1}=require('./db');const {F}=require('./config');
const pub=u=>({sa:u.super?1:0,dept:u.dept||'',remark:u.remark||'',sup:u.sup?1:0,id:u.id,name:u.role=='admin'&&!u.super?u.ini:u.name,ini:u.ini,role:u.role,on:u.active,pr:q('SELECT press FROM hod_press WHERE user_id=?',u.id).map(x=>x.press)});
function opState(u){const asg={};q('SELECT * FROM op_workplace').forEach(a=>(asg[a.user_id]=asg[a.user_id]||[]).push(a.workplace_id));const mine=asg[u.id]||[],own=u.role=='operator'&&!u.sup;
 let wps=q('SELECT * FROM workplaces ORDER BY pos,id');if(own)wps=wps.filter(w=>mine.includes(w.id));else if(u.role=='operator'||u.role=='hod')wps=wps.filter(w=>w.dept==u.dept);
 wps=wps.map(w=>({id:w.id,dept:w.dept,name:w.name,target:w.target,mine:mine.includes(w.id)?1:0,m:q('SELECT id,name FROM machines WHERE workplace_id=? ORDER BY id',w.id)}));
 const ids=wps.map(w=>w.id);let ents=[];if(ids.length)ents=q(`SELECT id,date,shift,workplace_id wp,machine_id mc,operator op,actual,target,status st,authorized_by ab FROM op_entries WHERE workplace_id IN(${ids.join(',')})${own?' AND operator=?':''} ORDER BY date DESC,id DESC LIMIT 600`,...(own?[u.id]:[]));
 return{depts:q('SELECT name FROM departments ORDER BY name').map(x=>x.name),wps,asg,ents}}
function state(u){if(u.role=='operator'){let us=u.sup?q("SELECT * FROM users WHERE dept=? AND role='operator' ORDER BY rowid",u.dept).map(pub):[];if(!us.some(x=>x.id==u.id))us.unshift(pub(u));return{users:us,dflt:{},tgo:{},ents:{},audit:[],op:opState(u)}}
 const users=q('SELECT * FROM users ORDER BY rowid').map(pub),dflt={},tgo={},ents={};
 q('SELECT code,default_target t FROM presses').forEach(p=>dflt[p.code]=p.t);q('SELECT * FROM targets').forEach(t=>tgo[t.date+'|'+t.press]=t.tons);
 q('SELECT * FROM entry_meta').forEach(m=>ents[m.date+'|'+m.press]={oa:m.off_a,ob:m.off_b,a:{},b:{},rs:{log:m.reason_log||'',brk:m.reason_brk||'',oth:m.reason_oth||'',offa:m.reason_offa||'',offb:m.reason_offb||''},by:m.entered_by,st:m.status});
 q('SELECT * FROM entries').forEach(r=>{const e=ents[r.date+'|'+r.press];if(!e)return;const o={};F.forEach(k=>o[k]=r[k]);if(r.shift=='A'?e.oa:e.ob){F.forEach(k=>o[k]=0);o.off=1}e[r.shift.toLowerCase()]=o});
 return{users,dflt,tgo,ents,audit:q('SELECT at,user_id u,action t FROM audit_log ORDER BY id DESC LIMIT 300'),op:opState(u)}}
module.exports={pub,opState,state};
