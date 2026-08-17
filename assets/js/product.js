/* ZNAKOMY product enhancements — 2026-08 */
(() => {
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
})();
