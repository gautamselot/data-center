// Reports screen (press report / cumulative, Excel, print).
V.rep=()=>{const M=curModel(),c=S.rt=='c';return `<h1>Reports</h1><p class="sub">Output font is green when the target is met and red when it is not.</p>
 <div class="card"><div class="row"><div><label style="margin-top:0">Report</label><select onchange="S.rt=this.value;draw()"><option value="p" ${c?'':'selected'}>Press report (one press)</option><option value="c" ${c?'selected':''}>Cumulative report (all presses)</option></select></div>
 ${c?'':`<div><label style="margin-top:0">Press</label><select onchange="S.rp=this.value;draw()">${(S.u.role=='admin'?PID:S.u.pr).map(x=>`<option value="${x}" ${x==S.rp?'selected':''}>${pl(x)}</option>`).join('')}</select></div>`}
 <div><label style="margin-top:0">Month</label><input type="month" value="${S.mo}" onchange="S.mo=this.value||S.mo;draw()"></div></div>
 <div style="margin-top:12px"><button class="btn s" onclick="xl()">Excel</button> <button class="btn s" onclick="prt()">Printable report (PDF)</button></div></div>
 <div class="card rep" style="margin-top:12px"><b>${M.title}</b>
 <p class="sub">${M.sub}</p>${tbl(M)}</div>`};
