/* Stable ZNAKOMY runtime loader. Keeps the last known-good application code pinned while auth persistence is handled locally before startup. */
(() => {
  const stable='https://raw.githubusercontent.com/zvukor1980-crypto/znakomy-site/fc124a066742f93b5acbcfd7013650334d84b0c8/assets/js/app.js';
  fetch(stable,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('runtime '+r.status);return r.text()}).then(code=>(0,eval)(code)).catch(err=>{console.error('ZNAKOMY runtime load failed',err);document.body.insertAdjacentHTML('afterbegin','<div style="position:fixed;z-index:99999;inset:0 auto auto 0;width:100%;padding:12px;background:#7f1d1d;color:white;text-align:center">Не удалось загрузить приложение. Обновите страницу.</div>')});
})();