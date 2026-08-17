/* ZNAKOMY production module loader — Core 3.2 */
(() => {
  const style=document.createElement('style');
  style.id='znakomy-fluid-layout-fix';
  style.textContent=`.site-header,.platform-main,.platform-hero{width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important}.platform-hero-copy{width:100%!important;max-width:none!important;text-align:left!important;padding-left:clamp(22px,5vw,86px)!important;padding-right:clamp(22px,5vw,86px)!important}.platform-hero-copy h1{max-width:900px!important;margin-left:0!important}.platform-hero-copy p{max-width:650px!important;margin-left:0!important}.platform-search,.platform-people,.platform-directions,.platform-cta{max-width:none!important;margin-left:clamp(14px,4vw,64px)!important;margin-right:clamp(14px,4vw,64px)!important}#publicChatEmergency{position:fixed!important;right:18px!important;bottom:24px!important;z-index:9998!important;display:flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;gap:8px!important;border:1px solid rgba(255,255,255,.2)!important;background:linear-gradient(135deg,#6d28d9,#8b5cf6)!important;color:#fff!important;border-radius:999px!important;padding:14px 18px!important;font-weight:900!important;font:800 14px Inter,sans-serif!important;box-shadow:0 14px 42px rgba(109,40,217,.45)!important;cursor:pointer!important}@media(max-width:780px){.platform-search,.platform-people,.platform-directions,.platform-cta{margin-left:12px!important;margin-right:12px!important}#publicChatEmergency{right:12px!important;bottom:82px!important}}`;
  document.head.appendChild(style);
  let emergency=document.getElementById('publicChatEmergency');
  if(!emergency){emergency=document.createElement('button');emergency.id='publicChatEmergency';emergency.type='button';emergency.textContent='💬 Общий чат';document.body.appendChild(emergency)}
  emergency.addEventListener('click',()=>{if(window.ZnakomyPublicChat?.open)window.ZnakomyPublicChat.open();else{const wait=setInterval(()=>{if(window.ZnakomyPublicChat?.open){clearInterval(wait);window.ZnakomyPublicChat.open()}},100);setTimeout(()=>clearInterval(wait),5000)}});
  const js=src=>{const s=document.createElement('script');s.src=src;s.async=false;s.onerror=()=>console.error('Module failed:',src);document.head.appendChild(s)};
  const css=href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
  css('assets/css/community.css?build=20260817-2010');
  css('assets/css/profile-flow.css?build=20260817-2010');
  css('assets/css/admin-panel.css?build=20260817-2010');
  css('assets/css/public-chat.css?build=20260817-2038');
  js('assets/js/community.js?build=20260817-2010');
  js('assets/js/navigation.js?build=20260817-2010');
  js('assets/js/profile-flow.js?build=20260817-2010');
  js('assets/js/admin-panel.js?build=20260817-2010');
  js('assets/js/direct-fix.js?build=20260817-2010');
  js('assets/js/public-chat.js?build=20260817-2038');
  js('assets/js/notifications.js?build=20260817-2015');
  css('assets/css/final-power.css?build=20260817-2113');
})();
