/* ZNAKOMY product enhancements — 2026-08 */
(() => {
  const layoutFix = document.createElement("style");
  layoutFix.id = "znakomy-fluid-layout-fix";
  layoutFix.textContent = `
    .site-header{width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
    .platform-main{width:100%!important;max-width:none!important;margin:0!important}
    .platform-hero{width:100%!important;max-width:none!important;margin:0!important}
    .platform-hero-copy{width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important;text-align:left!important;padding-left:clamp(22px,5vw,86px)!important;padding-right:clamp(22px,5vw,86px)!important}
    .platform-hero-copy h1{max-width:900px!important;margin-left:0!important;margin-right:0!important}
    .platform-hero-copy p{max-width:650px!important;margin-left:0!important;margin-right:0!important}
    .platform-search,.platform-people,.platform-directions,.platform-cta{width:auto!important;max-width:none!important;margin-left:clamp(14px,4vw,64px)!important;margin-right:clamp(14px,4vw,64px)!important}
    @media(max-width:780px){.platform-hero-copy{padding-left:20px!important;padding-right:20px!important}.platform-search,.platform-people,.platform-directions,.platform-cta{margin-left:12px!important;margin-right:12px!important}}
  `;
  document.head.appendChild(layoutFix);
  const loadScript=(src)=>{const s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s)};
  const loadCss=(href)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
  loadScript('assets/js/auth-redirect.js?v=20260817-2');
  loadCss('assets/css/community.css?v=1'); loadScript('assets/js/community.js?v=1');

  const recoveryView=document.querySelector('#recoveryView'), recoveryForm=document.querySelector('#recoveryForm'), mobileMessages=document.querySelector('#mobileMessages'), messageField=document.querySelector("#messageForm textarea[name='message']");
  function showRecoveryView(){if(!recoveryView||!recoveryForm)return;const a=document.querySelector('#authView'),p=document.querySelector('#profileView');if(a)a.hidden=true;if(p)p.hidden=true;recoveryView.hidden=false;if(typeof openModal==='function')openModal();setTimeout(()=>recoveryForm.elements.password?.focus(),60)}
  if(recoveryForm)recoveryForm.addEventListener('submit',async e=>{e.preventDefault();const password=recoveryForm.elements.password.value,confirmPassword=recoveryForm.elements.confirm_password.value,status=document.querySelector('#recoveryStatus'),submit=document.querySelector('#recoverySubmit'),say=(m,er=false)=>typeof showMessage==='function'?showMessage(status,m,er):(status.textContent=m);if(password!==confirmPassword)return say('Пароли не совпадают.',true);if(password.length<8)return say('Пароль должен содержать минимум 8 символов.',true);submit.disabled=true;say('Сохраняю новый пароль…');const{error}=await db.auth.updateUser({password});submit.disabled=false;if(error)return say(error.message||'Не удалось изменить пароль.',true);say('Пароль изменён.');const{data}=await db.auth.getUser();if(data.user&&typeof showAccount==='function')setTimeout(()=>showAccount(data.user),450)});
  if(typeof db!=='undefined')db.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')setTimeout(showRecoveryView,80)});
  if(/type=recovery|type%3Drecovery/i.test(`${location.hash} ${location.search}`))setTimeout(showRecoveryView,180);
  if(mobileMessages)mobileMessages.addEventListener('click',async()=>{if(typeof currentUser!=='undefined'&&currentUser){if(typeof openChatDrawer==='function')openChatDrawer();if(typeof loadConversations==='function')await loadConversations();return}if(typeof setAuthMode==='function')setAuthMode('signin');if(typeof openModal==='function')openModal()});
  if(messageField){messageField.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.currentTarget.form?.requestSubmit()}});messageField.addEventListener('input',e=>{const f=e.currentTarget;f.style.height='auto';f.style.height=`${Math.min(f.scrollHeight,140)}px`})}
  if(typeof profileCard==='function'){profileCard=function(profile){const tags=[...(profile.instruments||[]),...(profile.genres||[])].slice(0,3).map(escapeHtml).join(' · '),looking=(profile.looking_for||[]).slice(0,2).map(escapeHtml).join(' · '),image=photoUrl(profile.avatar_path);return `<article class="musician-card member-card" data-profile-id="${profile.id}" data-profile-name="${escapeHtml(profile.display_name)}" data-tags="${escapeHtml((profile.instruments||[]).join(' ').toLowerCase())}"><div class="card-media">${image?`<img src="${escapeHtml(image)}" alt="${escapeHtml(profile.display_name)}" loading="lazy">`:'<div class="avatar-placeholder">♪</div>'}<div class="card-overlay"></div></div><div class="card-caption"><small>${escapeHtml(profile.city||'Хайфа')}</small><strong>${escapeHtml(profile.display_name)}</strong><span>${tags||'Музыкант'}</span>${looking?`<em>Ищет: ${looking}</em>`:''}</div><button class="start-chat" type="button">Написать</button></article>`};setTimeout(()=>{if(typeof loadProfiles==='function')loadProfiles()},50)}
  loadScript('assets/js/navigation.js?v=20260817-1');
  loadCss('assets/css/profile-flow.css?v=20260817-1'); loadScript('assets/js/profile-flow.js?v=20260817-1');
  loadCss('assets/css/admin-panel.css?v=20260817-1'); loadScript('assets/js/admin-panel.js?v=20260817-1');
  loadScript('assets/js/account-flow.js?v=20260817-1');
})();
