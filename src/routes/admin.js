'use strict';
// Super-admin tools: sample data, clear entries, read-only database viewer.
const {q,q1,ex}=require('../db');
const {PRESSES}=require('../config');
const {today,audit,bad}=require('../util');
const {saveEntry}=require('../entries');
const {snapshot}=require('../backup');
const {route}=require('../router');
const tgt=(d,p)=>{const o=q1('SELECT tons FROM targets WHERE date=? AND press=?',d,p);if(o)return o.tons;return new Date(d+'T00:00:00Z').getUTCDay()==6?0:q1('SELECT default_target t FROM presses WHERE code=?',p).t};
route('POST','/api/sample','super',(u,b)=>{let k=7;const r=()=>(k=(k*9301+49297)%233280)/233280,mo=String(b.mo||today().slice(0,7)),n=new Date(+mo.slice(0,4),+mo.slice(5,7),0).getDate();
 if(!/^\d{4}-\d{2}$/.test(mo))bad('Invalid month');if(q1('SELECT 1 x FROM entry_meta WHERE date LIKE ?',mo+'-%'))bad('Sample data loads only into a month with no entries');
 for(let i=1;i<=n;i++){const d=mo+'-'+String(i).padStart(2,'0');if(d>today())break;for(const p of PRESSES){const t=tgt(d,p[0]);if(!t)continue;const R2=x=>Math.round(x*100)/100,sh=()=>{const o=Math.round(t*100*(.78+r()*.4)),die=R2(r()*.5),brk=r()<.25?R2(1+r()):R2(r()*.5),lg=r()<.1?.5:0;return{inp:Math.round(o/(.76+r()*.1)),out:o,run:R2(12-die-brk-lg),die,pow:0,man:0,log:lg,brk,noo:0,oth:0,hc:8+Math.floor(r()*5),dies:2+Math.floor(r()*5),ord:3+Math.floor(r()*5)}};
  saveEntry(d,p[0],sh(),sh(),{log:'Sample reason',brk:'Sample reason',oth:''},'ukhaji.khaire')}}audit(u.id,'Loaded sample data for '+mo);return{ok:1}});
route('POST','/api/clear','super',(u,b)=>{if(b.confirm!=='CLEAR')bad('Type CLEAR to confirm');const bk=snapshot('prepurge');ex('DELETE FROM entries');ex('DELETE FROM entry_meta');audit(u.id,'Cleared all press entries. Backup '+bk);return{ok:1}});
route('GET','/api/db','super',()=>({tables:['users','presses','hod_press','targets','entries','entry_meta','audit_log','departments','workplaces','machines','op_workplace','op_entries'].map(t=>{const rows=q(`SELECT * FROM ${t} ORDER BY rowid DESC LIMIT 300`).map(r=>{if(r.pw_hash)r.pw_hash=r.pw_hash.slice(0,10)+'…(hashed)';return r});return{name:t,count:q1(`SELECT COUNT(*) c FROM ${t}`).c,cols:rows[0]?Object.keys(rows[0]):q(`PRAGMA table_info(${t})`).map(c=>c.name),rows}})}));
