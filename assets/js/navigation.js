/* ZNAKOMY browser-history layer.
   Keeps Back/Forward inside the app for modal, profile preview and Direct. */
(() => {
  const stateKey = "znakomyView";
  const authModal = document.querySelector("#authModal");
  const profilePreview = document.querySelector("#profilePreview");
  const chatDrawer = document.querySelector("#chatDrawer");

  let applyingPopState = false;

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

  // Observe app classes instead of replacing existing application functions.
  const observer = new MutationObserver(() => {
    const view = currentView();
    if (view) pushView(view);
  });
  [authModal, profilePreview, chatDrawer].filter(Boolean).forEach((node) => {
    observer.observe(node, { attributes: true, attributeFilter: ["class"] });
  });

  // Closing an overlay with its UI should consume its history entry as well.
  document.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-modal],[data-close-preview],[data-close-chat]");
    if (!close || applyingPopState) return;
    if (history.state?.[stateKey]) {
      // Existing app handler closes the visual layer; this keeps browser history in sync.
      setTimeout(() => history.back(), 0);
    }
  }, true);

  window.addEventListener("popstate", (event) => {
    applyingPopState = true;
    closeAllOverlays();

    // A forward navigation can restore the requested app layer by reusing its normal trigger.
    const view = event.state?.[stateKey];
    if (view === "auth") {
      document.querySelector("[data-open-auth]")?.click();
    } else if (view === "direct") {
      document.querySelector("#openMessages")?.click();
    }
    // Profile previews are intentionally closed when navigating Back/Forward because
    // their concrete profile id is not stored in the legacy UI state.

    setTimeout(() => { applyingPopState = false; }, 0);
  });
})();
