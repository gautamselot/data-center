// Home screen: 5 module tiles. Active ones open their first screen; the rest are greyed out until built.
V.home=()=>{const has=k=>tabsOf(S.u).some(x=>x[0]==k);
 const M=[['Press Production','dash','#2f6fb5',IC('<path d="M4 21h16M7 21V9h10v12M12 3v6M9 6l3 3 3-3"/>')],
  ['Dispatch Management',null,'#55697c',IC('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>')],
  ['Machine Shop Production',null,'#55697c',IC('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>')],
  ['Housing Correction','ops','#c0601d',TI.ops[0]],
  ['Foundry Production',null,'#55697c',IC('<path d="M5 8h14l-2 11H7zM9 8V5M15 8V5M8 13h8"/>')]];
 return `<h1>Welcome, ${S.u.name.split(' ')[0]}</h1><p class="sub">Choose a module.</p><div class="tiles">${M.map(([l,k,c,i])=>{const on=k&&has(k);return `<button class="tile" style="--tc:${c}" ${on?`onclick="go('${k}')"`:'disabled'} aria-label="${l}"><span class="ti">${i}</span><b>${l}</b><small>${on?'Open':k?'No access':'Coming soon'}</small></button>`}).join('')}</div>`};