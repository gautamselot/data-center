// Screen constants. The press list (PR) comes from the server: see src/config.js (served as /config.js).
// HF = hour columns, LIM = limits, ROWS = rows of the press entry form.
const PID=PR.map(p=>p[0]),pl=p=>{const x=PR.find(y=>y[0]==p);return `${x[0]} (${x[1]}${x[2]?', '+x[2]:''})`};
const HF=['run','die','pow','man','log','brk','noo','oth'],LIM={die:.5,pow:0,man:0,log:0,brk:1};
const ROWS=[['inp','Press Input (kg)'],['out','Press Output (kg)'],['rec','Recovery %'],['run','Running Hours'],['die','Die Change Hours','30 min'],['pow','Power Failure Hours','0'],['man','Manpower Shortage Hours','0'],['log','Log Shortage Hours','0'],['brk','Breakdown Hours','60 min'],['noo','No Orders in Hand Hours'],['oth','Other Hours (with reasons)'],['hc','Head Count in Shift'],['dies','Dies Used'],['ord','Open Orders Run (of the above)']];
