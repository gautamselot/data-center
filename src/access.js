'use strict';
// Permission helpers: module access (modsOf/can), manager check (isMgr), workplace lookup (wpd).
const {q1}=require('./db');const {bad}=require('./util');
const ALLM=['press','disp','house','mach','found'];
// users.mods = comma list set in User Management; NULL = default for the role.
const modsOf=u=>u.mods!=null?String(u.mods).split(',').filter(Boolean):u.role=='admin'?ALLM:u.role=='operator'?['house']:['press'].concat(u.dept?['house']:[]);
const can=(u,m)=>modsOf(u).includes(m);
const isMgr=(u,dept)=>can(u,'house')&&(u.role=='admin'||(u.role=='hod'&&!!u.dept&&u.dept==dept)),wpd=id=>{const w=q1('SELECT * FROM workplaces WHERE id=?',+id);if(!w)bad('No such workplace',404);return w};
module.exports={ALLM,modsOf,can,isMgr,wpd};