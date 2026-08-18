/* ZNAKOMY i18n safety stub — temporarily disabled after production regression. */
(()=>{
  try{localStorage.removeItem('znakomy-lang')}catch(_){}
  document.documentElement.lang='ru';
  document.documentElement.dir='ltr';
  if(document.body) document.body.classList.remove('rtl-ui');
  document.getElementById('languageSwitch')?.remove();
  window.ZnakomyI18n={disabled:true,apply(){return false},lang:'ru'};
})();
