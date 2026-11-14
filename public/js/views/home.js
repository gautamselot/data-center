// Home screen: big tiles.
V.home=()=>`<h1>Welcome, ${S.u.name.split(' ')[0]}</h1><p class="sub">Choose what you want to open.</p><div class="tiles">${tabsOf(S.u).filter(x=>x[0]!='home').map(([k,l])=>`<button class="tile" style="--tc:${TI[k][2]}" onclick="go('${k}')"><span class="ti">${TI[k][0]}</span><b>${l}</b><small>${TI[k][1]}</small></button>`).join('')}</div>`;
