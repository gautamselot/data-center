'use strict';
// Operator module: workplaces, machines, targets, assignments, operator entries, authorization.
const {q,q1,ex}=require('../db');
const {now,today,audit,bad}=require('../util');
const {isMgr,wpd}=require('../access');
const {route}=require('../router');
route('POST','/api/op/workplace','any',(u,b)=>{const dept=u.role=='hod'?u.dept:String(b.dept||(q1('SELECT name FROM departments ORDER BY name')||{}).name||'');if(!dept||!isMgr(u,dept))bad('Not allowed',403);const n=String(b.name||'').trim();if(!n)bad('Enter a workplace name');const t=b.target===''||b.target==null?null:Math.max(0,+b.target||0);
 try{ex('INSERT INTO workplaces(dept,name,target) VALUES(?,?,?)',dept,n,t)}catch(e){bad('That workplace already exists')}audit(u.id,`Added workplace ${n} (${dept})`);return{ok:1}});
route('POST','/api/op/machine','any',(u,b)=>{const w=wpd(b.wp);if(!isMgr(u,w.dept))bad('Not allowed',403);const n=String(b.name||'').trim();if(!n)bad('Enter a machine name');try{ex('INSERT INTO machines(workplace_id,name) VALUES(?,?)',w.id,n)}catch(e){bad('That machine already exists')}audit(u.id,`Added machine ${n} to ${w.name}`);return{ok:1}});
route('POST','/api/op/target','any',(u,b)=>{const w=wpd(b.wp);if(!isMgr(u,w.dept))bad('Not allowed',403);const t=b.target===''||b.target==null?null:Math.max(0,+b.target||0);ex('UPDATE workplaces SET target=? WHERE id=?',t,w.id);audit(u.id,`Target of ${w.name} = ${t==null?'none':t}`);return{ok:1}});
route('POST','/api/op/assign','any',(u,b)=>{const w=wpd(b.wp);if(!isMgr(u,w.dept))bad('Not allowed',403);const t=q1('SELECT * FROM users WHERE id=?',b.user);if(!t||t.role!='operator'||t.dept!=w.dept)bad('The operator and the workplace must be in the same department');
 if(q1('SELECT 1 x FROM op_workplace WHERE user_id=? AND workplace_id=?',t.id,w.id))ex('DELETE FROM op_workplace WHERE user_id=? AND workplace_id=?',t.id,w.id);else ex('INSERT INTO op_workplace VALUES(?,?)',t.id,w.id);audit(u.id,`Changed workplaces for ${t.id}`);return{ok:1}});
route('POST','/api/op/entry','any',(u,b)=>{if(u.role!='operator')bad('Only operators use this form',403);const date=String(b.date||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>today())bad('Invalid or future date');if(!['A','B'].includes(b.shift))bad('Choose a shift');
 const w=q1('SELECT * FROM workplaces WHERE id=?',+b.wp);if(!w||!q1('SELECT 1 x FROM op_workplace WHERE user_id=? AND workplace_id=?',u.id,w.id))bad('This workplace is not assigned to you',403);
 const ms=q('SELECT id FROM machines WHERE workplace_id=?',w.id);let mc=0;if(ms.length){mc=+b.mc;if(!ms.some(x=>x.id==mc))bad('Choose a machine')}
 const a=Math.round(+b.actual);if(!isFinite(a)||a<0)bad('Enter the actual output');
 const o=q1('SELECT status FROM op_entries WHERE date=? AND shift=? AND workplace_id=? AND machine_id=? AND operator=?',date,b.shift,w.id,mc,u.id);if(o&&o.status=='authorized')bad('This entry is authorized and locked. Ask your supervisor or HOD.',403);
 ex('INSERT INTO op_entries(date,shift,workplace_id,machine_id,operator,actual,target,entered_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(date,shift,workplace_id,machine_id,operator) DO UPDATE SET actual=excluded.actual,target=excluded.target,entered_at=excluded.entered_at',date,b.shift,w.id,mc,u.id,a,w.target,now());
 audit(u.id,`Operator entry ${date} ${b.shift} ${w.name} = ${a}`);return{ok:1}});
route('POST','/api/op/authorize','any',(u,b)=>{const e=q1('SELECT * FROM op_entries WHERE id=?',+b.id);if(!e)bad('No such entry',404);const w=wpd(e.workplace_id),mgr=isMgr(u,w.dept),sup=u.role=='operator'&&!!u.sup&&u.dept==w.dept&&e.operator!=u.id;if(!mgr&&!sup)bad('You cannot authorize this entry',403);
 if(e.status=='authorized'){if(!mgr)bad('Only the HOD or an admin can undo an authorization',403);ex("UPDATE op_entries SET status='pending',authorized_by=NULL,authorized_at=NULL WHERE id=?",e.id)}else ex("UPDATE op_entries SET status='authorized',authorized_by=?,authorized_at=? WHERE id=?",u.id,now(),e.id);
 audit(u.id,`${e.status=='authorized'?'Undid authorization of':'Authorized'} operator entry ${e.date} ${e.shift} ${w.name}`);return{ok:1}});
