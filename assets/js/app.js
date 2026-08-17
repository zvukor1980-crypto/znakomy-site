/* ZNAKOMY stable runtime + persistent login */
(() => {
  const originalCreateClient=window.supabase?.createClient;
  if(originalCreateClient){
    window.supabase.createClient=function(url,key,options={}){
      return originalCreateClient.call(this,url,key,{
        ...options,
        auth:{...(options.auth||{}),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage,storageKey:'znakomy-auth-v1'}
      });
    };
  }
  const stable='https://raw.githubusercontent.com/zvukor1980-crypto/znakomy-site/fc124a066742f93b5acbcfd7013650334d84b0c8/assets/js/app.js';
  fetch(stable,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('runtime '+r.status);return r.text()}).then(code=>(0,eval)(code)).catch(err=>{console.error('ZNAKOMY runtime load failed',err);document.body.insertAdjacentHTML('afterbegin','<div style="position:fixed;z-index:99999;inset:0 auto auto 0;width:100%;padding:12px;background:#7f1d1d;color:white;text-align:center">Не удалось загрузить приложение. Обновите страницу.</div>')});
})();