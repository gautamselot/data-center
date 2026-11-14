'use strict';
// Opens the SQLite database (data/datacenter.db) and exposes tiny query helpers.
//   q(sql,...args)  -> all rows      q1(sql,...args) -> first row      ex(sql,...args) -> run (insert/update/delete)
const fs=require('fs'),path=require('path');const {DatabaseSync}=require('node:sqlite');
const {DIR}=require('./config');fs.mkdirSync(DIR,{recursive:true});
const db=new DatabaseSync(path.join(DIR,'datacenter.db'));
db.exec('PRAGMA busy_timeout=10000');
const q=(s,...a)=>db.prepare(s).all(...a),q1=(s,...a)=>db.prepare(s).get(...a),ex=(s,...a)=>db.prepare(s).run(...a);
const cols=t=>q(`PRAGMA table_info(${t})`).map(c=>c.name);
module.exports={db,q,q1,ex,cols};
