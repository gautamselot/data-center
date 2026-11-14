'use strict';
// Permission helpers for the operator module.
const {q1}=require('./db');const {bad}=require('./util');
const isMgr=(u,dept)=>u.role=='admin'||(u.role=='hod'&&!!u.dept&&u.dept==dept),wpd=id=>{const w=q1('SELECT * FROM workplaces WHERE id=?',+id);if(!w)bad('No such workplace',404);return w};
module.exports={isMgr,wpd};
