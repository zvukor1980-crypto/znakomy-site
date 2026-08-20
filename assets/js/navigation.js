/* ZNAKOMY browser-history + auth-redirect layer.
   Keeps Back/Forward inside the app and forces production auth callbacks. */
(() => {
  const stateKey='znakomyView';
  const AUTH_REDIRECT_URL='https://znakomy.online/';
  const authModal=document.querySelector('#authModal');
  const profilePreview=document.querySelector('#profilePreview');
  const chatDrawer=document.querySelector('#chatDrawer');
  const communityShell=document.querySelector('.community-shell');
  let applyingPopState=false;

  if(typeof db!=='undefined'&&db?.auth){
    const originalSignUp=db.auth.signUp.bind(db.auth);
    db.auth.signUp=(credentials={})=>originalSignUp({...credentials,options:{...(credentials.options||{}),emailRedirectTo:AUTH_REDIRECT_URL}});
    const originalResend=db.auth.resend.bind(db.auth);
    db.auth.resend=(params={})=>originalResend({...params,options:{...(params.options||{}),emailRedirectTo:AUTH_REDIRECT_URL}});
    const originalReset=db.auth.resetPasswordForEmail.bind(db.auth);
    db.auth.resetPasswordForEmail=(email,options={})=>originalReset(email,{...options,redirectTo:AUTH_REDIRECT_URL});
  }

  const publicChat=()=>document.querySelector('.public-chat-shell');
  const repairModal=()=>document.querySelector('#repairModal');

  function currentView(){
    if(authModal?.classList.contains('open'))return'auth';
    if(profilePreview?.classList.contains('open'))return'profile';
    if(chatDrawer?.classList.contains('open'))return'direct';
    if(communityShell?.classList.contains('open'))return'community-section';
    if(publicChat()?.classList.contains('open'))return'public-chat';
    if(repairModal()?.classList.contains('open'))return'repair';
    return null;
  }

  function closeAllOverlays(){
    authModal?.classList.remove('open');authModal?.setAttribute('aria-hidden','true');
    profilePreview?.classList.remove('open');profilePreview?.setAttribute('aria-hidden','true');
    chatDrawer?.classList.remove('open');chatDrawer?.setAttribute('aria-hidden','true');
    communityShell?.classList.remove('open');communityShell?.setAttribute('aria-hidden','true');
    const pc=publicChat();pc?.classList.remove('open');pc?.setAttribute('aria-hidden','true');
    const rm=repairModal();rm?.classList.remove('open');rm?.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open','preview-open','chat-open','public-chat-open');
    document.body.style.overflow='';
  }

  function pushView(view){
    if(applyingPopState||!view)return;
    if(history.state?.[stateKey]===view)return;
    history.pushState({...history.state,[stateKey]:view},'',location.href);
  }

  const observer=new MutationObserver(()=>{const view=currentView();if(view)pushView(view)});
  [authModal,profilePreview,chatDrawer,communityShell].filter(Boolean).forEach(node=>observer.observe(node,{attributes:true,attributeFilter:['class']}));

  document.addEventListener('click',event=>{
    const publicChatOpen=event.target.closest('#publicChatButton,#publicChatNav,#floatingPublicChat,#mobilePublicChat,#publicChatEmergency');
    if(publicChatOpen&&!applyingPopState)setTimeout(()=>pushView('public-chat'),0);

    const communityOpen=event.target.closest('[data-community],.main-nav a:nth-child(3),.main-nav a:nth-child(4),.main-nav a:nth-child(5),.main-nav a:nth-child(6)');
    if(communityOpen&&!applyingPopState)setTimeout(()=>{if(communityShell?.classList.contains('open'))pushView('community-section')},0);

    const repairOpen=event.target.closest('.repair-card,[data-open-repair]');
    if(repairOpen&&!applyingPopState)setTimeout(()=>pushView('repair'),0);

    const close=event.target.closest('[data-close-modal],[data-close-preview],[data-close-chat],[data-public-chat-close],[data-repair-close],.community-close');
    if(!close||applyingPopState)return;
    if(history.state?.[stateKey])setTimeout(()=>history.back(),0);
  },true);

  window.addEventListener('popstate',event=>{
    applyingPopState=true;
    closeAllOverlays();
    const view=event.state?.[stateKey];
    if(view==='auth')document.querySelector('[data-open-auth]')?.click();
    else if(view==='direct')document.querySelector('#openMessages')?.click();
    else if(view==='public-chat')window.ZnakomyPublicChat?.open?.();
    else if(view==='repair')window.ZnakomyRepair?.open?.();
    /* community-section intentionally remains closed when navigating back to it;
       a section is reopened only by an explicit card/nav click because it has a specific key. */
    setTimeout(()=>{applyingPopState=false},0);
  });
})();
