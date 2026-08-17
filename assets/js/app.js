/* Compatibility entry for stale browser caches. Local runtime only. */
(() => {
  if (window.__ZNAKOMY_CORE_LOADING__) return;
  window.__ZNAKOMY_CORE_LOADING__=true;
  const s=document.createElement('script');
  s.src='assets/js/core.js?build=20260817-2020';
  s.async=false;
  s.onload=()=>{window.__ZNAKOMY_CORE_LOADING__=false};
  s.onerror=()=>{window.__ZNAKOMY_CORE_LOADING__=false;console.error('Core compatibility load failed')};
  document.head.appendChild(s);
})();
