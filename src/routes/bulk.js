'use strict';
// Super admin: create many operator accounts at once (one name per line) under one HOD or supervisor, optionally assigned to a workplace.
const {db,q1,ex,cols}=require('../db');
const {now,audit,hash,rpw,uid,bad}=require('../util');
const {route}=require('../router');
const L=s=>s.replace(/[^A-Za-z]/g,'').toUpperCase();
const taken=x=>!!q1('SELECT 1 x FROM users WHERE lower(ini)=? OR lower(id)=?',x.toLowerCase(),x.toLowerCase());
function inits(name){const w=name.split(' '),f=L(w[0]),l=L(w[w.length-1]),c=w.length>1?[w.map(x=>L(x)[0]||'').join(''),f.slice(0,2)+l[0],f.slice(0,3)+l[0],f[0]+l.slice(0,2)]:[f.slice(0,3),f.slice(0,2),f.slice(0,4)];
 for(const x of c)if(x&&!taken(x))return x;const b=c[c.length-1]||'U';let i=2;while(taken(b+i))i++;return b+i}
route('POST','/api/users/bulk','super',(u,b)=>{
 const names=[...new Set(String(b.names||'').split(/\r?\n/).map(s=>s.trim().replace(/\s+/g,' ')).filter(Boolean).map(s=>s.replace(/(^|\s)([a-z])/g,(m,a,c)=>a+c.toUpperCase())))];
 if(!names.length)bad('Enter at least one name');if(names.length>60)bad('Add at most 60 names at a time');
 const h=q1("SELECT * FROM users WHERE id=? AND active=1 AND (role='hod' OR (role='operator' AND sup=1))",String(b.boss||''));
 if(!h)bad('Choose who these operators report to (an HOD or a supervisor)');if(!h.dept)bad('That person has no department yet');
 let w=null;if(b.wp){w=q1('SELECT * FROM workplaces WHERE id=?',+b.wp);if(!w||w.dept!=h.dept)bad('Choose a workplace from the same department')}
 const hasBoss=cols('users').includes('boss'),made=[],skipped=[];
 db.exec('BEGIN');try{
  for(const n of names){
   if(q1('SELECT 1 x FROM users WHERE lower(name)=?',n.toLowerCase())){skipped.push(n);continue}
   const id=uid(n),ini=inits(n),p=rpw();
   ex("INSERT INTO users(id,name,ini,role,pw_hash,active,created_at,dept,sup) VALUES(?,?,?,'operator',?,1,?,?,0)",id,n,ini,hash(p),now(),h.dept);
   if(hasBoss)ex('UPDATE users SET boss=? WHERE id=?',h.id,id);
      ex('UPDATE users SET must_change=1 WHERE id=?',id);
   if(w)ex('INSERT OR IGNORE INTO op_workplace VALUES(?,?)',id,w.id);
   made.push({name:n,id,ini,password:p})}
  audit(u.id,`Bulk-created ${made.length} operators under ${h.id}${w?' for '+w.name:''}`);
  db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 return{made,skipped}});
 module.exports={inits};