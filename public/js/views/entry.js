// Press daily entry (HOD/admin): form, live hour tally, shift off, reasons, save/lock.
V.entry=()=>{const adm=S.u.role=='admin',al=adm?PID:S.u.pr,d=S.ed;if(!al.includes(S.ep))S.ep=al[0];const p=S.ep,e=E(d,p),lk=e&&e.st=='locked'&&!adm;
 if(!al.length)return '<h1>Entry</h1><p class="sub">No presses are assigned to you. Ask an admin.</p>';
 const v=(k,s)=>{const x=e&&e[s=='A'?'a':'b'][k];return x==null?'':x},inp=(k,s)=>`<input id="${k}${s}" type="number" step="0.01" min="0" inputmode="decimal" value="${v(k,s)}" oninput="calc()" ${lk?'disabled':''}>`,
 hm=(k,s)=>{const t=Math.round((+v(k,s)||0)*60),hh=Math.floor(t/60),mm=t%60,id=k+s,d0=lk?'disabled':'';return `<div class="tm"><input class="tx" id="${id}t" inputmode="numeric" autocomplete="off" placeholder="00:00" maxlength="5" value="${pad2(hh)}:${pad2(mm)}" oninput="tmType('${id}')" onblur="tmFmt('${id}')" onfocus="this.select()" ${d0}><span class="hm"><select id="${id}h" onchange="tmSel('${id}')" ${d0} aria-label="hours">${o2(13,hh)}</select><b>:</b><select id="${id}m" onchange="tmSel('${id}')" ${d0} aria-label="minutes">${o2(60,mm)}</select></span></div>`},
 inpAll=(k,s)=>HF.includes(k)?hm(k,s):inp(k,s);
 const offc=s=>`<td><label class="offl"><input type="checkbox" id="off${s}" ${e&&e[s.toLowerCase()].off?'checked':''} ${lk?'disabled':''} onchange="offchg('${s}')"> Off</label></td>`;
 const rows=`<tr><td>Shift off (no production)</td>${offc('A')}${offc('B')}<td></td><td>Tick only if the whole shift was off. A reason is required.</td></tr>`+ROWS.map(([k,l,lim])=>(k=='run'?'<tr><th colspan="5">Shift hours: each shift must add up to 12 h, the day to 24 h</th></tr>':k=='hc'?'<tr><th colspan="5">Shift details</th></tr>':'')+(k=='rec'?`<tr><td>${l}</td><td id="recA">-</td><td id="recB">-</td><td id="recT">-</td><td></td></tr>`:`<tr><td>${l}</td><td>${inpAll(k,'A')}</td><td>${inpAll(k,'B')}</td><td id="t_${k}">-</td><td id="lm_${k}">${lim?'Limit '+lim:''}</td></tr>`)).join('');
 const rs=(k,l)=>`<div id="rw_${k}" style="display:none"><label>${l}: reason and action</label><input id="rs_${k}" value="${String((e&&e.rs[k])||'').replace(/"/g,'&quot;')}" ${lk?'disabled':''}></div>`;
 return `<h1>Daily entry</h1><p class="sub">One entry per press per day, in two 12 hour shifts. Target for this press today: <b>${tgB(d,p)} t</b> (reports halve it for each shift marked off). Type hours as hh:mm (11:30 is eleven and a half hours) or pick them from the lists. Input and output are entered as written on the sheet. ${p=='P10'?'P10 reports show them as entered.':'Reports and the dashboard show 5 times these values for this press.'}</p>
 <div class="card"><div class="row"><div><label style="margin-top:0">Date</label><input type="date" value="${d}" max="${TD}" onchange="S.ed=this.value||TD;draw()"></div><div><label style="margin-top:0">Press</label><select onchange="S.ep=this.value;draw()">${al.map(x=>`<option value="${x}" ${x==p?'selected':''}>${pl(x)}</option>`).join('')}</select></div><div><label style="margin-top:0">Status</label><div style="padding-top:8px">${e?`<span class="b ${e.st=='locked'?'r':'g'}">${e.st}</span> by ${usr(e.by)?usr(e.by).name:e.by}`:'<span class="b r">not entered</span>'}${adm&&e?` <button class="btn s" onclick="lockE()">${e.st=='locked'?'Unlock':'Lock'}</button>`:''}</div></div></div></div>
 <div class="card tw" style="margin-top:12px"><table class="et"><tr class="hd"><th></th><th>Shift A (Day)</th><th>Shift B (Night)</th><th>Total</th><th>Daily allowable limit</th></tr>${rows}</table></div>
 <div class="card" style="margin-top:12px">${rs('offa','Shift A off')}${rs('offb','Shift B off')}${rs('log','Log shortage')}${rs('brk','Breakdown')}${rs('oth','Other hours')}<div class="pv" id="tal"></div>${lk?'<p class="sub">This entry is locked. Ask an admin to unlock it.</p>':'<button class="btn w" onclick="saveE()">Save entry</button>'}</div>`};
const isOff=s=>{const c=$('#off'+s);return !!(c&&c.checked)};
const g=id=>{if(/^(inp|out|run|die|pow|man|log|brk|noo|oth|hc|dies|ord)[AB]$/.test(id)&&isOff(id.slice(-1)))return 0;const el=$('#'+id);if(el)return parseFloat(el.value)||0;const h=$('#'+id+'h');return h?(+h.value)+(+$('#'+id+'m').value)/60:0};
function tmType(id){const[h,m]=tmParse($('#'+id+'t').value);$('#'+id+'h').value=h;$('#'+id+'m').value=m;calc()}
function tmFmt(id){$('#'+id+'t').value=pad2(+$('#'+id+'h').value)+':'+pad2(+$('#'+id+'m').value)}
function tmSel(id){tmFmt(id);calc()}
function offchg(s){const off=$('#off'+s).checked;ROWS.forEach(([k])=>{if(k=='rec')return;[k+s,k+s+'t',k+s+'h',k+s+'m'].forEach(i=>{const e=$('#'+i);if(e)e.disabled=off})});calc()}
function calc(){const H={A:0,B:0};['A','B'].forEach(s=>{H[s]=isOff(s)?12:HF.reduce((x,k)=>x+g(k+s),0);const i=g('inp'+s),o=g('out'+s);$('#rec'+s).textContent=i?R2(o/i*100)+'%':'-'});
 ROWS.forEach(([k])=>{if(k=='rec')return;const t0=g(k+'A')+g(k+'B'),t=R2(t0);$('#t_'+k).textContent=HF.includes(k)?fh(t0):t;if(LIM[k]!=null)$('#lm_'+k).className=Math.round(t0*60)>LIM[k]*60?'r':''});
 ['log','brk','oth'].forEach(k=>{const w=$('#rw_'+k);if(w)w.style.display=(g(k+'A')+g(k+'B'))>0?'':'none'});
 ['A','B'].forEach(s=>{const w=$('#rw_off'+s.toLowerCase());if(w)w.style.display=isOff(s)?'':'none'});
 const ti=g('inpA')+g('inpB'),to=g('outA')+g('outB');$('#recT').textContent=ti?R2(to/ti*100)+'%':'-';
 const f=(l,h,m)=>`<span class="b ${eq(h,m)?'g':'r'}">${l}: ${fh(h)} of ${fh(m)} h${eq(h,m)?'':h<m?' (left '+fh(m-h)+')':' (over '+fh(h-m)+')'}</span>`;
 $('#tal').innerHTML=f('Shift A',H.A,12)+f('Shift B',H.B,12)+f('Day total',H.A+H.B,24)}
function saveE(){const mk=s=>{const o={};if(isOff(s))o.off=1;ROWS.forEach(([k])=>{if(k!='rec')o[k]=g(k+s)});return o};const a=mk('A'),b=mk('B');
 if(!eq(hsum(a),12)||!eq(hsum(b),12))return toast('Each shift must add up to exactly 12 hours');
 const tl=k=>g(k+'A')+g(k+'B')>0,rv=(k,on)=>on?$('#rs_'+k).value.trim():'';
 const rs={log:rv('log',tl('log')),brk:rv('brk',tl('brk')),oth:rv('oth',tl('oth')),offa:rv('offa',isOff('A')),offb:rv('offb',isOff('B'))};
 if(isOff('A')&&!rs.offa)return toast('Give a reason for Shift A being off');if(isOff('B')&&!rs.offb)return toast('Give a reason for Shift B being off');
 if(tl('log')&&!rs.log)return toast('Give a reason for log shortage');if(tl('brk')&&!rs.brk)return toast('Give a reason for breakdown');if(tl('oth')&&!rs.oth)return toast('Give a reason for other hours');
 run(async()=>{await api('/api/entry',{date:S.ed,press:S.ep,a,b,rs});await load();toast('Entry saved to the database');draw()})}
function lockE(){run(async()=>{await api('/api/entry/lock',{date:S.ed,press:S.ep});await load();draw()})}
