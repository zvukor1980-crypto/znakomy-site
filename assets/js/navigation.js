/* ZNAKOMY browser-history + auth-redirect layer.
   Keeps Back/Forward inside the app and forces production auth callbacks. */
(() => {
  const stateKey = "znakomyView";
  const AUTH_REDIRECT_URL = "https://znakomy.online/";
  const authModal = document.querySelector("#authModal");
  const profilePreview = document.querySelector("#profilePreview");
  const chatDrawer = document.querySelector("#chatDrawer");

  let applyingPopState = false;

  // Supabase hosted Auth only honors redirect URLs that are allowed in Auth URL Configuration.
  // The client must still explicitly request the production URL so it never derives localhost.
  if (typeof db !== "undefined" && db?.auth) {
    const originalSignUp = db.auth.signUp.bind(db.auth);
    db.auth.signUp = (credentials = {}) => originalSignUp({
      ...credentials,
      options: {
        ...(credentials.options || {}),
        emailRedirectTo: AUTH_REDIRECT_URL
      }
    });

    const originalResend = db.auth.resend.bind(db.auth);
    db.auth.resend = (params = {}) => originalResend({
      ...params,
      options: {
        ...(params.options || {}),
        emailRedirectTo: AUTH_REDIRECT_URL
      }
    });

    const originalReset = db.auth.resetPasswordForEmail.bind(db.auth);
    db.auth.resetPasswordForEmail = (email, options = {}) => originalReset(email, {
      ...options,
      redirectTo: AUTH_REDIRECT_URL
    });
  }

  function currentView() {
    if (authModal?.classList.contains("open")) return "auth";
    if (profilePreview?.classList.contains("open")) return "profile";
    if (chatDrawer?.classList.contains("open")) return "direct";
    return null;
  }

  function closeAllOverlays() {
    authModal?.classList.remove("open");
    authModal?.setAttribute("aria-hidden", "true");
    profilePreview?.classList.remove("open");
    profilePreview?.setAttribute("aria-hidden", "true");
    chatDrawer?.classList.remove("open");
    chatDrawer?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open", "preview-open", "chat-open");
  }

  function pushView(view) {
    if (applyingPopState || !view) return;
    if (history.state?.[stateKey] === view) return;
    history.pushState({ ...(history.state || {}), [stateKey]: view }, "", location.href);
  }

  const observer = new MutationObserver(() => {
    const view = currentView();
    if (view) pushView(view);
  });
  [authModal, profilePreview, chatDrawer].filter(Boolean).forEach((node) => {
    observer.observe(node, { attributes: true, attributeFilter: ["class"] });
  });

  document.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-modal],[data-close-preview],[data-close-chat]");
    if (!close || applyingPopState) return;
    if (history.state?.[stateKey]) setTimeout(() => history.back(), 0);
  }, true);

  window.addEventListener("popstate", (event) => {
    applyingPopState = true;
    closeAllOverlays();
    const view = event.state?.[stateKey];
    if (view === "auth") {
      document.querySelector("[data-open-auth]")?.click();
    } else if (view === "direct") {
      document.querySelector("#openMessages")?.click();
    }
    setTimeout(() => { applyingPopState = false; }, 0);
  });
})();
