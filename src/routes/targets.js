'use strict';
// Press targets: per-day, default per press, reset month.
const {ex}=require('../db');
const {audit}=require('../util');
const {route}=require('../router');
route('POST','/api/target','admin',(u,b)=>{ex('INSERT INTO targets VALUES(?,?,?) ON CONFLICT(date,press) DO UPDATE SET tons=excluded.tons',b.date,b.press,Math.max(0,+b.tons||0));audit(u.id,`Target ${b.date} ${b.press} = ${b.tons}`);return{ok:1}});
route('POST','/api/default','admin',(u,b)=>{ex('UPDATE presses SET default_target=? WHERE code=?',Math.max(0,+b.tons||0),b.press);audit(u.id,`Default target ${b.press} = ${b.tons}`);return{ok:1}});
route('POST','/api/targets/reset','admin',(u,b)=>{ex("DELETE FROM targets WHERE date LIKE ?",String(b.mo||'')+'%');audit(u.id,'Reset targets for '+b.mo);return{ok:1}});
