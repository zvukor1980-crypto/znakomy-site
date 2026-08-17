/* ZNAKOMY stable runtime loader — same-origin only */
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
  const stable='assets/js/app-stable.js?build=20260817-1948';
  const s=document.createElement('script');
  s.src=stable;
  s.async=false;
  s.onerror=()=>{console.error('ZNAKOMY local runtime load failed');document.body.insertAdjacentHTML('afterbegin','<div style="position:fixed;z-index:99999;inset:0 auto auto 0;width:100%;padding:12px;background:#7f1d1d;color:white;text-align:center">Не удалось загрузить приложение. Обновите страницу.</div>')};
  document.head.appendChild(s);
})();
