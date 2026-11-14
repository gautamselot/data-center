'use strict';
// Super-admin maintenance. BACKUPS: create, list, download, delete. PURGE: delete a date range, or everything.
// Every purge makes a 'prepurge' backup first, so it can be undone by restoring that file (see DEPLOY.md).
const path=require('path');
const {db,q1,ex}=require('../db');const {audit,bad}=require('../util');
const {BACKUP_DIR,BACKUP_KEEP}=require('../config');const {snapshot,list,fileOf,remove}=require('../backup');
const {route}=require('../router');
route('GET','/api/backups','super',()=>({dir:BACKUP_DIR,keep:BACKUP_KEEP,list:list()}));
route('POST','/api/backup','super',u=>{const name=snapshot('manual');audit(u.id,'Backup created '+name);return{name}});
route('GET','/api/backup/download','super',(u,b,res)=>{const f=fileOf(res.query.get('name'));if(!f)bad('No such backup',404);res.file=f;res.fileName=path.basename(f);return{}});
route('POST','/api/backup/delete','super',(u,b)=>{if(!remove(b.name))bad('No such backup',404);audit(u.id,'Backup deleted '+b.name);return{ok:1}});
// ---- purge
const D=/^\d{4}-\d{2}-\d{2}$/;
function scopeOf(b){const sc=b.scope;if(!['press','operator'].includes(sc))bad('Choose what to purge');const from=String(b.from||''),to=String(b.to||'');if(!D.test(from)||!D.test(to)||from>to)bad('Choose a valid date range');
 const t=String(b.target||'');
 if(sc=='press'){if(t&&!q1('SELECT 1 x FROM presses WHERE code=?',t))bad('Unknown press');return{sc,from,to,where:`date BETWEEN ? AND ?${t?' AND press=?':''}`,args:t?[from,to,t]:[from,to]}}
 if(t&&!q1('SELECT 1 x FROM workplaces WHERE id=?',+t))bad('Unknown workplace');return{sc,from,to,where:`date BETWEEN ? AND ?${t?' AND workplace_id=?':''}`,args:t?[from,to,+t]:[from,to]}}
const count=s=>({entries:q1(`SELECT COUNT(*) c FROM ${s.sc=='press'?'entry_meta':'op_entries'} WHERE ${s.where}`,...s.args).c});
const inTx=fn=>{db.exec('BEGIN');try{fn();db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}};
route('POST','/api/purge/preview','super',(u,b)=>count(scopeOf(b)));
route('POST','/api/purge','super',(u,b)=>{if(b.confirm!=='PURGE')bad('Type PURGE to confirm');const s=scopeOf(b),n=count(s).entries,bk=snapshot('prepurge');
 inTx(()=>{if(s.sc=='press'){ex(`DELETE FROM entries WHERE ${s.where}`,...s.args);ex(`DELETE FROM entry_meta WHERE ${s.where}`,...s.args)}else ex(`DELETE FROM op_entries WHERE ${s.where}`,...s.args)});
 audit(u.id,`Purged ${n} ${s.sc} entries ${s.from} to ${s.to}. Backup ${bk}`);return{deleted:n,backup:bk}});
route('POST','/api/purge/all','super',(u,b)=>{if(b.confirm!=='PURGE ALL')bad('Type PURGE ALL to confirm');
 const n={press:q1('SELECT COUNT(*) c FROM entry_meta').c,operator:q1('SELECT COUNT(*) c FROM op_entries').c},bk=snapshot('prepurge');
 inTx(()=>{ex('DELETE FROM entries');ex('DELETE FROM entry_meta');ex('DELETE FROM op_entries')});
 audit(u.id,`Purged ALL entries (${n.press} press days, ${n.operator} operator entries). Backup ${bk}`);return{deleted:n,backup:bk}});
