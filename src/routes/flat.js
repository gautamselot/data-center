'use strict';
// Flatness shift entry: rows of section / C/L / PCS / WT/PC / O/P. Final pieces = floor(C/L / section length) * PCS, computed here.
// The shift total is stored in op_entries so targets, authorization and locking work like every other workplace.
const {db,q1,ex}=require('../db');const {now,today,audit,bad}=require('../util');const {can}=require('../access');const SEC=require('../sections');const {route}=require('../router');
route('POST','/api/op/flat','any',(u,b)=>{if(u.role!='operator'||!can(u,'house'))bad('Only operators use this form',403);
 const date=String(b.date||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>today())bad('Invalid or future date');if(!['A','B'].includes(b.shift))bad('Choose a shift');
 const w=q1('SELECT * FROM workplaces WHERE id=?',+b.wp);if(!w||w.name!='Flatness'||!q1('SELECT 1 x FROM op_workplace WHERE user_id=? AND workplace_id=?',u.id,w.id))bad('This workplace is not assigned to you',403);
 const o=q1('SELECT status FROM op_entries WHERE date=? AND shift=? AND workplace_id=? AND machine_id=0 AND operator=?',date,b.shift,w.id,u.id);if(o&&o.status=='authorized')bad('This entry is authorized and locked. Ask your supervisor or HOD.',403);
 const rows=(Array.isArray(b.rows)?b.rows:[]).slice(0,60).map(r=>{const[c,n]=String(r.sec||'').split('|'),s=SEC.find(x=>x[0]==c&&x[1]==+n),cl=+r.cl,pcs=Math.round(+r.pcs);if(!s||!(cl>0)||!(pcs>0))bad('Each row needs a section, C/L and PCS');return{c:s[0],un:s[1],cl,pcs,wt:Math.max(0,+r.wt||0),op:Math.max(0,+r.op||0),fin:Math.floor(cl/s[1])*pcs}});
 if(!rows.length)bad('Add at least one row');const tot=rows.reduce((a,r)=>a+r.fin,0);
 db.exec('BEGIN');try{ex('DELETE FROM flat_rows WHERE date=? AND shift=? AND workplace_id=? AND operator=?',date,b.shift,w.id,u.id);
  rows.forEach(r=>ex('INSERT INTO flat_rows(date,shift,workplace_id,operator,section,unit,cl,pcs,wt,opv,fin) VALUES(?,?,?,?,?,?,?,?,?,?,?)',date,b.shift,w.id,u.id,r.c,r.un,r.cl,r.pcs,r.wt,r.op,r.fin));
  ex('INSERT INTO op_entries(date,shift,workplace_id,machine_id,operator,actual,target,entered_at) VALUES(?,?,?,0,?,?,?,?) ON CONFLICT(date,shift,workplace_id,machine_id,operator) DO UPDATE SET actual=excluded.actual,target=excluded.target,entered_at=excluded.entered_at',date,b.shift,w.id,u.id,tot,w.target,now());db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 audit(u.id,`Flatness entry ${date} ${b.shift} = ${tot} pcs`);return{ok:1,total:tot}});