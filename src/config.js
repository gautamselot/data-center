'use strict';
// Central settings. Change the port, the data folder or the list of presses here.
// Adding a press: add a row to PRESSES (code, location, size, default daily target in tons), restart the server.
const path=require('path');
// Environment overrides: PORT, HOST (0.0.0.0 to allow LAN), DATA_DIR (move the database to another drive), BACKUP_KEEP (how many automatic daily backups to keep).
const PORT=process.env.PORT||3000,HOST=process.env.HOST||'127.0.0.1',DIR=process.env.DATA_DIR||path.join(__dirname,'..','data');
const DEFAULT_PW='Data@987';
const BACKUP_DIR=path.join(DIR,'backups'),BACKUP_KEEP=+process.env.BACKUP_KEEP||14;
const F=['inp','out','run','die','pow','man','log','brk','noo','oth','hc','dies','ord'],HF=['run','die','pow','man','log','brk','noo','oth'];
const PRESSES=[['P10','Bhalwani','',30],['P9','Bhalwani','5"',8],['P5','SUPA','',15],['P6','SUPA','5"',8],['P7','SUPA','5"',8]];
module.exports={PORT,HOST,DIR,DEFAULT_PW,BACKUP_DIR,BACKUP_KEEP,F,HF,PRESSES};