/* ZNAKOMY account flow: signing in should land on the site, not force-open profile editor. */
(() => {
  function closeAccountModal() {
    const modal = document.querySelector('#authModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  function profileLabel(profile) {
    if (!profile) return 'Моя анкета';
    if (profile.status === 'pending') return 'Анкета · на проверке';
    if (profile.status === 'rejected') return 'Анкета · исправить';
    return 'Моя анкета';
  }

  async function syncSignedInUI(user) {
    if (!user) return;
    try {
      const {data: profile} = await db.from('profiles')
        .select('id,display_name,status,moderation_note')
        .eq('id', user.id).single();
      const profileButton = document.querySelector('.header-button');
      const loginButton = document.querySelector('.header-login');
      const messagesButton = document.querySelector('#openMessages');
      if (profileButton) {
        profileButton.textContent = profileLabel(profile);
        profileButton.title = profile?.display_name ? `Профиль: ${profile.display_name}` : 'Моя анкета';
      }
      if (loginButton) loginButton.hidden = true;
      if (messagesButton) messagesButton.hidden = false;
    } catch (error) {
      console.warn('Account UI sync', error);
    }
  }

  // app.js calls showAccount() after successful sign-in and on page restoration.
  // Keep its data loading, but do not leave the editor modal in the user's face.
  window.addEventListener('load', () => {
    if (typeof showAccount !== 'function') return;
    const originalShowAccount = showAccount;
    showAccount = async function normalAccountLanding(user) {
      await originalShowAccount(user);
      await syncSignedInUI(user);
      // Password recovery is the only auth event that should keep an account modal open automatically.
      const recovery = document.querySelector('#recoveryView');
      if (!recovery || recovery.hidden) closeAccountModal();
    };
  });

  // Explicit click on the profile button is when the editor should open.
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('.header-button');
    if (!button) return;
    const {data} = await db.auth.getSession();
    if (!data?.session?.user) return;
    event.preventDefault();
    if (typeof showAccount === 'function') await showAccount(data.session.user);
    if (typeof openModal === 'function') openModal();
  }, true);

  // A normal SIGNED_IN event lands on the main site. No forced editor.
  if (typeof db !== 'undefined') {
    db.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          await syncSignedInUI(session.user);
          closeAccountModal();
        }, 120);
      }
    });
  }
})();
