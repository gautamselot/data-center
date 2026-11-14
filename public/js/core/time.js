// hh:mm helpers: two-digit formatting (fh) and parsing typed text (tmParse).
const pad2=n=>String(n).padStart(2,'0'),o2=(n,sel)=>Array.from({length:n},(_,i)=>`<option value="${i}" ${i==sel?'selected':''}>${pad2(i)}</option>`).join('');
const fh=x=>{const t=Math.round(x*60);return pad2(Math.floor(t/60))+':'+pad2(t%60)};
function tmParse(s){s=String(s).trim();let h=0,m=0;if(s.includes(':')){const[a,b]=s.split(':');h=parseInt(a)||0;m=parseInt((b||'').slice(0,2))||0}else{const d=s.replace(/\D/g,'');if(d.length<=2)h=parseInt(d)||0;else{m=parseInt(d.slice(-2));h=parseInt(d.slice(0,-2))}}return[Math.min(12,h),Math.min(59,m)]}
