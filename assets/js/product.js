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
    @media(max-width:780px){
      .platform-hero-copy{padding-left:20px!important;padding-right:20px!important}
      .platform-search,.platform-people,.platform-directions,.platform-cta{margin-left:12px!important;margin-right:12px!important}
    }
  `;
  document.head.appendChild(layoutFix);

  const communityCss = document.createElement("link");
  communityCss.rel = "stylesheet";
  communityCss.href = "assets/css/community.css?v=1";
  document.head.appendChild(communityCss);
  const communityScript = document.createElement("script");
  communityScript.src = "assets/js/community.js?v=1";
  communityScript.defer = true;
  document.head.appendChild(communityScript);

  const recoveryView = document.querySelector("#recoveryView");
  const recoveryForm = document.querySelector("#recoveryForm");
  const mobileMessages = document.querySelector("#mobileMessages");
  const messageField = document.querySelector("#messageForm textarea[name='message']");

  function showRecoveryView() {
    if (!recoveryView || !recoveryForm) return;
    const authView = document.querySelector("#authView");
    const profileView = document.querySelector("#profileView");
    if (authView) authView.hidden = true;
    if (profileView) profileView.hidden = true;
    recoveryView.hidden = false;
    if (typeof openModal === "function") openModal();
    setTimeout(() => recoveryForm.elements.password?.focus(), 60);
  }

  if (recoveryForm) {
    recoveryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = recoveryForm.elements.password.value;
      const confirmPassword = recoveryForm.elements.confirm_password.value;
      const status = document.querySelector("#recoveryStatus");
      const submit = document.querySelector("#recoverySubmit");
      const say = (message, error = false) => {
        if (typeof showMessage === "function") return showMessage(status, message, error);
        status.textContent = message;
        status.classList.toggle("error", error);
      };
      if (password !== confirmPassword) return say("Пароли не совпадают.", true);
      if (password.length < 8) return say("Пароль должен содержать минимум 8 символов.", true);
      submit.disabled = true;
      say("Сохраняю новый пароль…");
      const {error} = await db.auth.updateUser({password});
      submit.disabled = false;
      if (error) return say(error.message || "Не удалось изменить пароль.", true);
      say("Пароль изменён. Личный кабинет открыт.");
      const {data} = await db.auth.getUser();
      if (data.user && typeof showAccount === "function") setTimeout(() => showAccount(data.user), 450);
    });
  }

  if (typeof db !== "undefined") {
    db.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setTimeout(showRecoveryView, 80);
    });
  }

  const recoveryHint = `${location.hash} ${location.search}`;
  if (/type=recovery|type%3Drecovery/i.test(recoveryHint)) setTimeout(showRecoveryView, 180);

  if (mobileMessages) {
    mobileMessages.addEventListener("click", async () => {
      if (typeof currentUser !== "undefined" && currentUser) {
        if (typeof openChatDrawer === "function") openChatDrawer();
        if (typeof loadConversations === "function") await loadConversations();
        return;
      }
      if (typeof setAuthMode === "function") setAuthMode("signin");
      if (typeof openModal === "function") openModal();
      const status = document.querySelector("#authStatus");
      if (status && typeof showMessage === "function") showMessage(status, "Войдите, чтобы открыть Direct.");
    });
  }

  if (messageField) {
    messageField.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
      }
    });
    messageField.addEventListener("input", (event) => {
      const field = event.currentTarget;
      field.style.height = "auto";
      field.style.height = `${Math.min(field.scrollHeight, 140)}px`;
    });
  }

  if (typeof profileCard === "function") {
    profileCard = function enhancedProfileCard(profile) {
      const tags = [...(profile.instruments || []), ...(profile.genres || [])].slice(0, 3).map(escapeHtml).join(" · ");
      const looking = (profile.looking_for || []).slice(0, 2).map(escapeHtml).join(" · ");
      const image = photoUrl(profile.avatar_path);
      return `<article class="musician-card member-card" data-profile-id="${profile.id}" data-profile-name="${escapeHtml(profile.display_name)}" data-tags="${escapeHtml((profile.instruments || []).join(" ").toLowerCase())}">
        <div class="card-media">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(profile.display_name)}" loading="lazy">` : '<div class="avatar-placeholder">♪</div>'}<div class="card-overlay"></div></div>
        <div class="card-caption"><small>${escapeHtml(profile.city || "Хайфа")}</small><strong>${escapeHtml(profile.display_name)}</strong><span>${tags || "Музыкант"}</span>${looking ? `<em>Ищет: ${looking}</em>` : ""}</div>
        <button class="start-chat" type="button" aria-label="Написать ${escapeHtml(profile.display_name)}">Написать</button>
      </article>`;
    };
    setTimeout(() => {
      if (typeof loadProfiles === "function") loadProfiles();
    }, 50);
  }

  const navigationScript = document.createElement("script");
  navigationScript.src = "assets/js/navigation.js?v=20260817-1";
  navigationScript.defer = true;
  document.head.appendChild(navigationScript);
})();
