// Reports screen: press report (one press) or cumulative (all presses). Data comes from reports/models.js.
// Styles are injected once (rp-* classes) so this file works without touching reports.css.
(()=>{if(document.getElementById('rp-css'))return;const s=document.createElement('style');s.id='rp-css';s.textContent=`
.rp-ctl{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.rp-ctl input,.rp-ctl select{width:100%;min-width:0}
.rp-act{display:flex;gap:8px;margin-top:12px}
.rp-card{padding:0;margin-top:12px}
.rp-hd{padding:12px 14px 2px}.rp-hd .sub{margin:2px 0 10px}
.rp-sc{overflow:auto;-webkit-overflow-scrolling:touch;max-height:70vh;max-height:70dvh;min-height:200px;border-top:1px solid var(--line)}
.rp-t{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;font-variant-numeric:tabular-nums}
.rp-t th,.rp-t td{padding:8px 10px;text-align:right;white-space:nowrap;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.rp-t th:last-child,.rp-t td:last-child{border-right:0}
.rp-t tr:last-child td{border-bottom:0}
.rp-t th{position:sticky;top:0;z-index:2;background:var(--bg);color:var(--ink);font-weight:700;border-bottom:2px solid var(--mut)}
.rp-t th:nth-child(-n+2),.rp-t tr:not(.ft) td:nth-child(-n+2),.rp-t tr.ft td:first-child{text-align:left}
.rp-t tbody tr:nth-child(even) td{background-image:linear-gradient(rgba(127,127,127,.07),rgba(127,127,127,.07))}
@media(hover:hover){.rp-t tbody tr:hover td{background-image:linear-gradient(rgba(127,127,127,.14),rgba(127,127,127,.14))}}
.rp-t tr:not(.ft) td:empty::after{content:"–";color:var(--mut);font-weight:400}
.rp-t td.g{background-color:var(--gt)}.rp-t td.r{background-color:var(--rt)}
.rp-t tr.ft td{background-color:var(--bg);border-top:2px solid var(--mut);font-weight:700}
.rp-p th:first-child,.rp-p td:first-child{position:sticky;left:0;z-index:1;background-color:var(--card)}
.rp-p th:first-child{z-index:3;background-color:var(--bg)}
.rp-p tr.ft td:first-child{background-color:var(--bg)}
.rp-c{table-layout:fixed}
.rp-c th,.rp-c td{white-space:normal}
.rp-c th:nth-child(1){width:17%}.rp-c th:nth-child(2){width:11%}
.rp-c td:last-child{font-weight:800}
@media(max-width:640px){
.rp-ctl{grid-template-columns:1fr 1fr;gap:10px}.rp-ctl>div:first-child,.rp-ctl>div:last-child:nth-child(2){grid-column:1/-1}
.rp-act .btn{flex:1}
.rp-hd{padding:10px 10px 0}.rp-hd .sub{font-size:12px}
.rp-t{font-size:12.5px}.rp-t th,.rp-t td{padding:8px 8px}
.rp-c{font-size:11.5px}
.rp-c th,.rp-c td{padding:8px 1px;text-align:center}
.rp-c th:first-child,.rp-c td:first-child,.rp-c tr:not(.ft) td:nth-child(2),.rp-c th:nth-child(2){padding-left:6px}
.rp-c th:first-child,.rp-c tr.ft td:first-child{text-align:left}
.rp-c th:nth-child(1){width:19%}.rp-c th:nth-child(2){width:12%}
}`;document.head.appendChild(s)})();
const rpCell=(c,t='td')=>`<${t}${c.c?` class="${c.c}"`:''}${c.s?` colspan="${c.s}"`:''}>${c.v}</${t}>`;
const rpTbl=M=>`<table class="rp-t ${M.cls?'rp-c':'rp-p'}"><thead><tr>${M.head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${M.rows.map(r=>`<tr>${r.map(c=>rpCell(c)).join('')}</tr>`).join('')}${M.foot.map(r=>`<tr class="ft">${r.map(c=>rpCell(c)).join('')}</tr>`).join('')}</tbody></table>`;
V.rep=()=>{const c=S.rt=='c',ps=S.u.role=='admin'?PID:S.u.pr;if(!c&&!ps.includes(S.rp))S.rp=ps[0]||S.rp;
 const none=!c&&!ps.length,M=none?null:curModel();
 return `<h1>Reports</h1><p class="sub">Output is green when the target is met and red when it is not.</p>
 <div class="card"><div class="rp-ctl"><div><label style="margin-top:0">Report</label><select onchange="S.rt=this.value;draw()"><option value="p" ${c?'':'selected'}>Press report (one press)</option><option value="c" ${c?'selected':''}>Cumulative report (all presses)</option></select></div>
 ${c?'':`<div><label style="margin-top:0">Press</label><select onchange="S.rp=this.value;draw()">${ps.map(x=>`<option value="${x}" ${x==S.rp?'selected':''}>${pl(x)}</option>`).join('')}</select></div>`}
 <div><label style="margin-top:0">Month</label><input type="month" value="${S.mo}" onchange="S.mo=this.value||S.mo;draw()"></div></div>
 ${none?'':'<div class="rp-act"><button class="btn s" onclick="xl()">Excel</button><button class="btn s" onclick="prt()">Printable report (PDF)</button></div>'}</div>
 ${none?'<p class="sub" style="margin-top:12px">No presses are assigned to you. Ask an admin.</p>':`<div class="card rp-card"><div class="rp-hd"><b>${M.title}</b><p class="sub">${M.sub}</p></div>${c?rpTbl(M):`<div class="rp-sc">${rpTbl(M)}</div>`}</div>`}`};