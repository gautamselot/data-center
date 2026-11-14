// Tiny helpers: DOM query ($), padding, rounding, dates, month days.
const $=s=>document.querySelector(s),pad=(n,l=2)=>String(n).padStart(l,'0'),R2=x=>Math.round(x*100)/100,eq=(a,b)=>Math.abs(a-b)<0.005;
const iso=d=>{const x=new Date(d);return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate())},TD=iso(Date.now());
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],dow=d=>new Date(d+'T00:00').getDay();
const mdays=mo=>{const[y,m]=mo.split('-').map(Number);return Array.from({length:new Date(y,m,0).getDate()},(_,i)=>mo+'-'+pad(i+1))};
const fd=d=>pad(+d.slice(8))+' '+MN[+d.slice(5,7)-1],mlab=mo=>new Date(mo+'-01T00:00').toLocaleString('en-IN',{month:'long',year:'numeric'});
