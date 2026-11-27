// Global state: U = users, S = screen state, V = view registry (V.name = ()=>html).
// Also data accessors: usr, E (entry), tg (target), val (scaled value), C/N (report cells), toast.
let U=[];
let S={u:null,tab:'dash',dt:YD,ed:TD,ep:'P10',rt:'p',rp:'P10',mo:TD.slice(0,7),err:'',ents:{},tgo:{},dflt:{...DEFAULT_TARGETS},audit:[{t:'System started',u:'System',at:new Date().toLocaleString()}]};
const usr=id=>U.find(u=>u.id==id),E=(d,p)=>S.ents[d+'|'+p],tgB=(d,p)=>S.tgo[d+'|'+p]??(dow(d)==6?0:S.dflt[p]),tg=(d,p)=>{const b=tgB(d,p),e=E(d,p);if(!e)return b;const lost=s=>(s.off||(+s.man||0)>6)?1:0,off=lost(e.a)+lost(e.b);return off?R2(b*(2-off)/2):b};
const SC=p=>p=='P10'?1:5,val=(e,k)=>HF.includes(k)?Math.round(((+e.a[k]||0)+(+e.b[k]||0))*60)/60:R2(((+e.a[k]||0)+(+e.b[k]||0))*((k=='inp'||k=='out')?SC(e.p):1)),outT=(d,p)=>{const e=E(d,p);return e?R2(val(e,'out')/1000):null},hsum=s=>s.off?12:HF.reduce((a,k)=>a+(+s[k]||0),0);
const col=(v,t)=>v==null?'':v>=t?'g':'r',C=(v,n,c)=>({v,n,c}),N=x=>x==null?C(''):C(R2(x).toFixed(2),R2(x)),Hc=x=>C(fh(x));
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t.k);t.k=setTimeout(()=>t.style.display='none',2600)};
const V={};
