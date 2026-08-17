/* ZNAKOMY production module loader — Core 3.0 */
(() => {
  const style=document.createElement('style');
  style.id='znakomy-fluid-layout-fix';
  style.textContent=`.site-header,.platform-main,.platform-hero{width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important}.platform-hero-copy{width:100%!important;max-width:none!important;text-align:left!important;padding-left:clamp(22px,5vw,86px)!important;padding-right:clamp(22px,5vw,86px)!important}.platform-hero-copy h1{max-width:900px!important;margin-left:0!important}.platform-hero-copy p{max-width:650px!important;margin-left:0!important}.platform-search,.platform-people,.platform-directions,.platform-cta{max-width:none!important;margin-left:clamp(14px,4vw,64px)!important;margin-right:clamp(14px,4vw,64px)!important}@media(max-width:780px){.platform-search,.platform-people,.platform-directions,.platform-cta{margin-left:12px!important;margin-right:12px!important}}`;
  document.head.appendChild(style);
  const js=src=>{const s=document.createElement('script');s.src=src;s.defer=true;s.onerror=()=>console.error('Module failed:',src);document.head.appendChild(s)};
  const css=href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
  css('assets/css/community.css?build=20260817-2010');
  css('assets/css/profile-flow.css?build=20260817-2010');
  css('assets/css/admin-panel.css?build=20260817-2010');
  css('assets/css/public-chat.css?build=20260817-2004');
  js('assets/js/community.js?build=20260817-2010');
  js('assets/js/navigation.js?build=20260817-2010');
  js('assets/js/profile-flow.js?build=20260817-2010');
  js('assets/js/admin-panel.js?build=20260817-2010');
  js('assets/js/direct-fix.js?build=20260817-2010');
  js('assets/js/notifications.js?build=20260817-2002');
  js('assets/js/public-chat.js?build=20260817-2004');
})();
