/* Compatibility entry for very old Safari caches. Same-origin only. */
(() => {
  if (typeof db !== 'undefined' && typeof loadProfiles === 'function') return;
  if (window.__ZNAKOMY_CORE_LOADING__) return;
  window.__ZNAKOMY_CORE_LOADING__=true;
  const s=document.createElement('script');
  s.src='assets/js/core.js?build=20260817-2021';
  s.async=false;
  s.onload=()=>{window.__ZNAKOMY_CORE_LOADING__=false};
  s.onerror=()=>{window.__ZNAKOMY_CORE_LOADING__=false;console.error('Legacy compatibility core load failed')};
  document.head.appendChild(s);
})();
