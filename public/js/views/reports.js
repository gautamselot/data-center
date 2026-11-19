// Reports: Press report (cumulative, tab 'crep') and Press wise report (one press, tab 'rep'). Data comes from reports/models.js.
// Styles are injected once (rp-* classes) so this file works without touching reports.css.
(()=>{if(document.getElementById('rp-css'))return;const s=document.createElement('style');s.id='rp-css';s.textContent=`
.rp-ctl{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.rp-ctl input,.rp-ctl select{width:100%;min-width:0}
.rp-act{display:flex;gap:8px;margin-top:12px}
.rp-card{padding:0;margin-top:12px;overflow:hidden;border-radius:14px}
.rp-hd{padding:14px 16px 4px}.rp-hd b{font-size:16px}.rp-hd .sub{margin:3px 0 12px;font-size:13px}
.rp-sc{overflow:auto;-webkit-overflow-scrolling:touch;max-height:72vh;max-height:72dvh;min-height:200px;border-top:1px solid var(--line)}
.rp-t{width:100%;border-collapse:separate;border-spacing:0;font-size:14px;font-variant-numeric:tabular-nums}
.rp-t th,.rp-t td{padding:11px 14px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--line)}
.rp-t tr:last-child td{border-bottom:0}
.rp-t th{position:sticky;top:0;z-index:2;background:var(--bg);color:var(--mut);font-size:12.5px;font-weight:700;border-bottom:2px solid var(--line)}
.rp-t th:nth-child(-n+2),.rp-t tr:not(.ft) td:nth-child(-n+2),.rp-t tr.ft td:first-child{text-align:left}
.rp-t td:first-child{font-weight:700}
.rp-t tbody tr:nth-child(even) td{background-image:linear-gradient(rgba(127,127,127,.06),rgba(127,127,127,.06))}
@media(hover:hover){.rp-t tbody tr:hover td{background-image:linear-gradient(rgba(127,127,127,.13),rgba(127,127,127,.13))}}
.rp-t tr:not(.ft) td:empty::after{content:"–";color:var(--mut);font-weight:400}
.rp-t td.g{background-color:var(--gt)}.rp-t td.r{background-color:var(--rt)}
.rp-t tr.ft td{background-color:var(--bg);border-top:2px solid var(--mut);font-weight:800;font-size:14.5px}
.rp-today td:first-child{box-shadow:inset 4px 0 0 var(--acc)}.rp-today td{font-weight:700}
.rp-fut td{opacity:.4}.rp-off td{color:var(--mut)}
.rp-p th:first-child,.rp-p td:first-child{position:sticky;left:0;z-index:1;background-color:var(--card)}
.rp-p th:first-child{z-index:3;background-color:var(--bg)}
.rp-p tr.ft td:first-child{background-color:var(--bg)}
.rp-c{table-layout:fixed}
.rp-c th,.rp-c td{white-space:normal;text-align:center}
.rp-c th:nth-child(-n+2),.rp-c tr:not(.ft) td:nth-child(-n+2),.rp-c tr.ft td:first-child{text-align:left}
.rp-c th:nth-child(1){width:17%}.rp-c th:nth-child(2){width:11%}
.rp-c th:last-child,.rp-c td:last-child{border-left:2px solid var(--line);font-weight:800}
@media(max-width:640px){
.rp-ctl{grid-template-columns:1fr 1fr;gap:10px}.rp-ctl>div:first-child,.rp-ctl>div:last-child:nth-child(2){grid-column:1/-1}
.rp-act .btn{flex:1}
.rp-hd{padding:12px 12px 0}.rp-hd .sub{font-size:12px}
.rp-t{font-size:12.5px}.rp-t th,.rp-t td{padding:9px 8px}
.rp-c{font-size:11.5px}
.rp-c th,.rp-c td{padding:9px 1px}
.rp-c th:first-child,.rp-c td:first-child,.rp-c tr:not(.ft) td:nth-child(2),.rp-c th:nth-child(2){padding-left:6px}
.rp-c th:nth-child(1){width:19%}.rp-c th:nth-child(2){width:12%}
}`;document.head.appendChild(s)})();
const rpCell=(c,t='td')=>`<${t}${c.c?` class="${c.c}"`:''}${c.s?` colspan="${c.s}"`:''}>${c.v}</${t}>`;
const rpTbl=(M,rc=[])=>`<table class="rp-t ${M.cls?'rp-c':'rp-p'}"><thead><tr>${M.head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${M.rows.map((r,i)=>`<tr${rc[i]?` class="${rc[i]}"`:''}>${r.map(c=>rpCell(c)).join('')}</tr>`).join('')}${M.foot.map(r=>`<tr class="ft">${r.map(c=>rpCell(c)).join('')}</tr>`).join('')}</tbody></table>`;
const repV=m=>{S.rt=m;const c=m=='c',ps=S.u.role=='admin'?PID:S.u.pr;if(!c&&!ps.includes(S.rp))S.rp=ps[0]||S.rp;
 const none=!c&&!ps.length,M=none?null:curModel(),sel=c?PID:[S.rp],rc=mdays(S.mo).map(d=>d==TD?'rp-today':d>TD?'rp-fut':sel.every(p=>tg(d,p)==0)?'rp-off':'');
 return `<h1>${c?'Press report':'Press wise report'}</h1><p class="sub">Output is green when the target is met and red when it is not.</p>
 <div class="card"><div class="rp-ctl">
 ${c?'':`<div><label style="margin-top:0">Press</label><select onchange="S.rp=this.value;draw()">${ps.map(x=>`<option value="${x}" ${x==S.rp?'selected':''}>${pl(x)}</option>`).join('')}</select></div>`}
 <div><label style="margin-top:0">Month</label><input type="month" value="${S.mo}" onchange="S.mo=this.value||S.mo;draw()"></div></div>
 ${none?'':'<div class="rp-act"><button class="btn s" onclick="xl()">Excel</button><button class="btn s" onclick="prt()">Printable report (PDF)</button></div>'}</div>
 ${none?'<p class="sub" style="margin-top:12px">No presses are assigned to you. Ask an admin.</p>':`<div class="card rp-card"><div class="rp-hd"><b>${M.title}</b><p class="sub">${M.sub}</p></div>${c?rpTbl(M,rc):`<div class="rp-sc">${rpTbl(M,rc)}</div>`}</div>`}`};
V.rep=()=>repV('p');V.crep=()=>repV('c');