/* Local stable runtime. Loaded from same origin to avoid Safari cross-origin/CSP failures. */
fetch('https://raw.githubusercontent.com/zvukor1980-crypto/znakomy-site/fc124a066742f93b5acbcfd7013650334d84b0c8/assets/js/app.js',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('runtime '+r.status);return r.text()})
  .then(code=>(0,eval)(code))
  .catch(err=>{console.error('Legacy runtime bootstrap failed',err);document.dispatchEvent(new CustomEvent('znakomy-runtime-error',{detail:String(err)}));});
