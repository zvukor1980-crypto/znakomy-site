/* ZNAKOMY Direct hardening — browser-safe click routing */
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
    try {
      const {data} = await db.auth.getSession();
      return data?.session?.user || null;
    } catch (_) { return null; }
  }
  function openSignin(message='Войдите, чтобы пользоваться Direct.') {
    try { if (typeof setAuthMode === 'function') setAuthMode('signin'); } catch (_) {}
    try { if (typeof openModal === 'function') openModal(); } catch (_) {
      $('#authModal')?.classList.add('open');
    }
    const status = $('#authStatus');
    if (status) status.textContent = message;
  }

  // Capture phase makes the primary Direct controls reliable even if another layer has stale listeners.
  document.addEventListener('click', async (event) => {
    const close = event.target.closest('[data-close-chat]');
    if (close) {
      event.preventDefault();
      forceCloseDirect();
      return;
    }

    const messages = event.target.closest('#openMessages,#mobileMessages');
    if (messages) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const user = await ensureSession();
      if (!user) return openSignin();
      forceOpenDirect();
      try { if (typeof loadConversations === 'function') await loadConversations(); }
      catch (error) {
        const list = $('#conversationList');
        if (list) list.innerHTML = '<p class="chat-empty">Не удалось загрузить диалоги. Обновите страницу и попробуйте снова.</p>';
        console.error('Direct load failed', error);
      }
      return;
    }

    const write = event.target.closest('.start-chat,[data-preview-chat]');
    if (!write) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const user = await ensureSession();
    if (!user) return openSignin('Войдите, чтобы написать музыканту.');

    let id, name;
    const card = write.closest('.member-card');
    if (card) { id = card.dataset.profileId; name = card.dataset.profileName; }
    if (!id) {
      const previewName = $('#previewName')?.textContent?.trim();
      const preview = [...document.querySelectorAll('.member-card')].find(x => x.dataset.profileName === previewName);
      if (preview) { id = preview.dataset.profileId; name = preview.dataset.profileName; }
    }
    if (!id) return;
    try {
      if (typeof closeProfilePreview === 'function') closeProfilePreview();
      else $('#profilePreview')?.classList.remove('open');
      if (typeof startConversation === 'function') await startConversation(id, name || 'Музыкант');
      else forceOpenDirect();
    } catch (error) {
      forceOpenDirect();
      const status = $('#chatStatus');
      if (status) status.textContent = error?.message || 'Не удалось открыть диалог.';
      console.error('Start conversation failed', error);
    }
  }, true);

  // Last-resort presentation rules: an opened drawer must always be visible.
  const style = document.createElement('style');
  style.textContent = `
    #chatDrawer{position:fixed;inset:0;z-index:3000;visibility:hidden;pointer-events:none}
    #chatDrawer.open{visibility:visible!important;pointer-events:auto!important;display:block!important}
    #chatDrawer .chat-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72)}
    #chatDrawer .chat-panel{position:absolute;right:0;top:0;bottom:0;z-index:1;visibility:visible;transform:translateX(105%);transition:transform .22s ease}
    #chatDrawer.open .chat-panel{transform:translateX(0)!important}
  `;
  document.head.appendChild(style);
})();
