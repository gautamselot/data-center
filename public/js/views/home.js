// Home screen: greeting, today's summary, big icon tiles. Tile list comes from HOMEK / tabsOf in core/nav.js; icon + colour from TI.
V.home=()=>{const u=S.u,all=tabsOf(u).filter(x=>x[0]!='home'),hk=HOMEK[u.sa?'sa':u.role=='admin'?'mgt':''],list=hk?hk.map(k=>all.find(x=>x[0]==k)).filter(Boolean):all;
 let to=0,tt=0,n=0,w=0;PID.forEach(p=>{const t=tg(TD,p);tt+=t;if(t>0)w++;if(E(TD,p)){n++;to+=outT(TD,p)}});to=R2(to);
 const h=new Date().getHours(),gr=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
 return `<div class="hx"><h1>${gr}, ${u.name.split(' ')[0]}</h1><p class="sub">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
 <div class="hx-st"><div><small>Today's output</small><b class="${n?col(to,R2(tt)):''}">${to} t</b><small>Target ${R2(tt)} t</small></div><div><small>Entries made</small><b>${n} of ${w}</b><small>working presses</small></div></div>
 <div class="tiles">${list.map(([k,l])=>`<button class="tile" style="--tc:${TI[k][2]}" onclick="go('${k}')" aria-label="${l}"><span class="ti">${TI[k][0]}</span><b>${l}</b><small>${TI[k][1]}</small></button>`).join('')}</div></div>`};