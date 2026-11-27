// Report tables as data (rows/foot) for the screen, Excel and print: pressModel (one press) and cumModel (all presses).
const cell=(c,t='td')=>`<${t} class="${c.c||''}"${c.s?` colspan="${c.s}"`:''}>${c.v}</${t}>`;
const tbl=M=>`<div class="tw ${M.cls||''}"><table class="${M.cls||''}"><tr>${M.head.map(h=>`<th>${h}</th>`).join('')}</tr>${M.rows.map(r=>`<tr>${r.map(c=>cell(c)).join('')}</tr>`).join('')}${M.foot.map(r=>`<tr class="ft">${r.map(c=>cell(c)).join('')}</tr>`).join('')}</table></div>`;
function pressModel(p,mo){const H=['Date','Day','Target (t)','Input (t)','Output (t)','Rec %','Running Hrs','Die Change','Power Failure','Manpower Short.','Logs Short.','Breakdown','No Orders','Other','Total Hrs','Head Count','Dies Used','Open Orders Run'],K=HF;
 let ti=0,to=0,tt=0,tm=0;const sm=Array(12).fill(0),bl=n=>Array(n).fill(0).map(()=>C(''));
 const rows=mdays(mo).map(d=>{const e=E(d,p),t=tg(d,p);tm+=t;if(!e)return[C(fd(d)),C(DN[dow(d)]),N(t),...bl(15)];
  const i=R2(val(e,'inp')/1000),o=R2(val(e,'out')/1000),hs=K.map(k=>val(e,k)),th=hs.reduce((a,b)=>a+b,0),x=[...hs,th,val(e,'hc'),val(e,'dies'),val(e,'ord')];ti+=i;to+=o;tt+=t;x.forEach((v,j)=>sm[j]+=v);
  return[C(fd(d)),C(DN[dow(d)]),N(t),N(i),{...N(o),c:col(o,t)},C(i?R2(o/i*100)+'%':'-'),...x.map((v,j)=>j<9?Hc(v):N(v))]});
 const pc=tm?Math.floor(to/tm*100):0;
 return{title:'Press report: '+pl(p),sub:mlab(mo)+' · output in tons · green = target met, red = not met',head:H,rows,foot:[[C('Total (reported days)'),C(''),N(tt),N(ti),{...N(to),c:col(to,tt)},C(ti?R2(to/ti*100)+'%':'-'),...sm.map((v,j)=>j<9?Hc(v):N(v))],[C('Monthly target'),C(''),N(tm),...bl(15)],[C('Achieved of monthly target'),C(''),C(''),C(''),{v:pc+'%',c:col(pc,100)},...bl(13)]]}}
const N3=x=>x==null?C(''):{...C(x.toFixed(2),+x.toFixed(2)),f:'0.00'},outT3=(d,p)=>{const e=E(d,p);return e?val(e,'out')/1000:null};
 function cumModel(mo){const H=['Date','Day',...PID,'Total'],ps=PID.map(()=>0);let T=0,TT=0,pt=PID.map(()=>0);
 const rows=mdays(mo).map(d=>{const ts=PID.map(p=>tg(d,p)),tsum=ts.reduce((a,b)=>a+b,0);pt=pt.map((x,i)=>x+ts[i]);TT+=tsum;const os=PID.map(p=>outT3(d,p));
  if(os.every(x=>x==null))return[C(fd(d)),C(DN[dow(d)]),...PID.map(()=>C('')),C('')];os.forEach((x,i)=>ps[i]+=x||0);const s=os.reduce((a,b)=>a+(b||0),0);T+=s;
  return[C(fd(d)),C(DN[dow(d)]),...os.map((x,i)=>({...N3(x),c:col(x,ts[i])})),	{...N3(s),c:col(s,tsum)}]});
 const q=(x,t)=>{const v=t?Math.floor(x/t*100):0;return{v:v+'%',c:col(v,100)}};
 return{title:'Cumulative press-wise output',cls:'cum',sub:mlab(mo)+' · output in tons · green = target met, red = not met · '+PR.map(x=>x[0]+' = '+x[1]+(x[2]?' '+x[2]:'')).join(', '),head:H,rows,foot:[[{...C('Total'),s:2},...ps.map(x=>N3(x)),N3(T)],[{...C('Target'),s:2},...pt.map(x=>N3(x)),N3(TT)],[{...C('Achieved'),s:2},...ps.map((x,i)=>q(x,pt[i])),q(T,TT)]]}}
const curModel=()=>S.rt=='c'?cumModel(S.mo):pressModel(S.rp,S.mo),fname=()=>'Data-Center-'+(S.rt=='c'?'cumulative':'press-'+S.rp)+'-'+S.mo;
