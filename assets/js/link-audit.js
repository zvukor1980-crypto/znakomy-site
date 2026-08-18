/* ZNAKOMY link wiring — only assigns destinations, no destructive DOM changes */
(()=>{
  const navRoot=document.querySelector('.main-nav');
  const nav=[...document.querySelectorAll('.main-nav a')];
  const destinations=['#search','#people','bands-haifa.html','jams-haifa.html','ads-haifa.html','music-market-haifa.html'];
  nav.forEach((a,i)=>{if(destinations[i])a.setAttribute('href',destinations[i])});

  if(navRoot&&!document.querySelector('#repairNavLink')){
    const repairLink=document.createElement('a');repairLink.id='repairNavLink';repairLink.href='#repair';repairLink.dataset.openRepair='';repairLink.textContent='Ремонт';navRoot.appendChild(repairLink);
    const setRepairText=()=>{const l=document.documentElement.lang;repairLink.textContent=l==='he'?'תיקון':l==='en'?'Repair':'Ремонт'};setRepairText();document.addEventListener('znakomy:language',setRepairText);
  }

  const cards=[...document.querySelectorAll('.platform-directions .direction-card')];
  const cardDest=['bands-haifa.html','jams-haifa.html','ads-haifa.html','music-market-haifa.html'];
  cards.slice(0,4).forEach((card,i)=>{
    const href=cardDest[i];if(!href)return;
    card.setAttribute('role','link');card.setAttribute('tabindex','0');card.dataset.href=href;card.style.cursor='pointer';
    const go=()=>location.assign(href);
    card.addEventListener('click',e=>{if(e.target.closest('a,button,input,select,textarea'))return;go()});
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
  });

  const repair=document.querySelector('.repair-card');
  if(repair){repair.setAttribute('role','button');repair.setAttribute('tabindex','0');repair.setAttribute('aria-haspopup','dialog');repair.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&window.ZnakomyRepair?.open){e.preventDefault();window.ZnakomyRepair.open(e)}})}
})();
