/* ZNAKOMY Direct hardening — recipient routing + visible composer */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const drawer = $('#chatDrawer');
  if (!drawer) return;

  function forceOpenDirect() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('chat-open');
  }
  function forceCloseDirect() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    document.body.classList.remove('chat-open');
  }
  async function ensureSession() {
    try { const {data} = await db.auth.getSession(); return data?.session?.user || null; }
    catch (_) { return null; }
  }
  function openSignin(message='Войдите, чтобы пользоваться Direct.') {
    try { if (typeof setAuthMode === 'function') setAuthMode('signin'); } catch (_) {}
    try { if (typeof openModal === 'function') openModal(); } catch (_) { $('#authModal')?.classList.add('open'); }
    const status = $('#authStatus'); if (status) status.textContent = message;
  }
  function showDirectError(message) {
    forceOpenDirect();
    const status = $('#chatStatus'); if (status) { status.textContent = message; status.classList.add('error'); }
  }
  function recipientFromButton(write) {
    const card = write.closest('.member-card');
    if (card?.dataset.profileId) return {id:card.dataset.profileId,name:card.dataset.profileName || 'Музыкант'};
    const previewName = $('#previewName')?.textContent?.trim();
    const preview = [...document.querySelectorAll('.member-card')].find(x => x.dataset.profileName === previewName);
    return preview?.dataset.profileId ? {id:preview.dataset.profileId,name:preview.dataset.profileName || previewName || 'Музыкант'} : null;
  }
  function makeComposerVisible(name='Музыкант') {
    const welcome=$('#chatWelcome'), active=$('#activeChat'), person=$('#activeChatPerson'), field=$("#messageForm textarea[name='message']");
    if (welcome) welcome.hidden=true;
    if (active) active.hidden=false;
    if (person && !person.textContent.trim()) person.innerHTML=`<strong>${String(name).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</strong><small>личный диалог · только для вас двоих</small>`;
    setTimeout(()=>field?.focus(),50);
  }

  document.addEventListener('click', async (event) => {
    const close = event.target.closest('[data-close-chat]');
    if (close) { event.preventDefault(); forceCloseDirect(); return; }

    const messages = event.target.closest('#openMessages,#mobileMessages');
    if (messages) {
      event.preventDefault(); event.stopImmediatePropagation();
      const user = await ensureSession(); if (!user) return openSignin();
      forceOpenDirect();
      try { if (typeof loadConversations === 'function') await loadConversations(); }
      catch (error) { const list=$('#conversationList'); if(list) list.innerHTML='<p class="chat-empty">Не удалось загрузить диалоги. Обновите страницу и попробуйте снова.</p>'; console.error(error); }
      return;
    }

    const write = event.target.closest('.start-chat,[data-preview-chat]');
    if (!write) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const user = await ensureSession(); if (!user) return openSignin('Войдите, чтобы написать музыканту.');
    const recipient = recipientFromButton(write);
    if (!recipient) return showDirectError('Не удалось определить получателя. Закройте Direct и нажмите «Написать» на карточке музыканта.');
    if (recipient.id === user.id) return showDirectError('Это ваша анкета — написать самому себе нельзя.');

    try {
      if (typeof closeProfilePreview === 'function') closeProfilePreview(); else $('#profilePreview')?.classList.remove('open');
      forceOpenDirect();
      const {data: conversationId, error} = await db.rpc('start_conversation',{target_id:recipient.id});
      if (error) throw error;
      if (!conversationId) throw new Error('Сервер не вернул номер диалога.');
      if (typeof loadConversations === 'function') await loadConversations();
      if (typeof selectConversation === 'function') await selectConversation(conversationId,{id:recipient.id,display_name:recipient.name});
      makeComposerVisible(recipient.name);
    } catch (error) {
      console.error('Start conversation failed',error);
      showDirectError(error?.message || 'Не удалось открыть диалог.');
    }
  }, true);

  const style=document.createElement('style');
  style.textContent=`
    #chatDrawer{position:fixed;inset:0;z-index:3000;visibility:hidden;pointer-events:none}
    #chatDrawer.open{visibility:visible!important;pointer-events:auto!important;display:block!important}
    #chatDrawer .chat-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72)}
    #chatDrawer .chat-panel{position:absolute;right:0;top:0;bottom:0;z-index:1;visibility:visible;transform:translateX(105%);transition:transform .22s ease}
    #chatDrawer.open .chat-panel{transform:translateX(0)!important}
    #activeChat:not([hidden]){display:grid!important;grid-template-rows:auto minmax(0,1fr) auto auto!important;height:100%!important;min-height:0!important}
    #messageForm{display:grid!important;grid-template-columns:minmax(0,1fr) 46px!important;visibility:visible!important;opacity:1!important}
    #messageForm textarea{display:block!important;visibility:visible!important;opacity:1!important;min-height:46px!important;width:100%!important}
    #messageArea{min-height:0!important;overflow:hidden!important}
    @media(max-width:560px){#chatDrawer .chat-panel{inset:0!important;width:100%!important}#activeChat:not([hidden]){min-height:420px!important}}
  `;
  document.head.appendChild(style);
})();
