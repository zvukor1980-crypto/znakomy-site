/* ZNAKOMY profile flow UX — clear save/review workflow without changing backend rules. */
(() => {
  const form = document.querySelector("#profileForm");
  const legacyReview = document.querySelector("#submitReview");
  const statusNode = document.querySelector("#profileStatus");
  const stateNode = document.querySelector("#profileState");
  const modal = document.querySelector("#authModal");
  if (!form || !statusNode) return;

  const submit = form.querySelector('button[type="submit"]');
  if (!submit) return;

  // Remove the confusing two-step UI. One primary action is enough.
  if (legacyReview) legacyReview.hidden = true;
  submit.textContent = "Сохранить и отправить на проверку";
  submit.classList.add("profile-main-action");

  const hint = document.createElement("div");
  hint.className = "profile-flow-hint";
  hint.innerHTML = '<strong>Как это работает</strong><span>Заполните анкету и нажмите одну кнопку. Мы сохраним данные и отправим анкету на проверку. После одобрения она появится в поиске музыкантов.</span>';
  form.querySelector(".profile-actions")?.before(hint);

  function setBusy(busy, text) {
    submit.disabled = busy;
    submit.classList.toggle("is-loading", busy);
    submit.textContent = text || (busy ? "Сохраняю…" : "Сохранить и отправить на проверку");
  }

  function say(message, kind = "info") {
    statusNode.textContent = message;
    statusNode.classList.remove("error", "success");
    if (kind === "error") statusNode.classList.add("error");
    if (kind === "success") statusNode.classList.add("success");
  }

  function successPanel(message) {
    let panel = document.querySelector("#profileSuccessPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "profileSuccessPanel";
      panel.className = "profile-success-panel";
      document.body.appendChild(panel);
    }
    panel.innerHTML = `<div class="profile-success-card"><div class="profile-success-icon">✓</div><small>ZNAKOMY</small><h3>Анкета принята</h3><p>${message}</p><button type="button">Понятно</button></div>`;
    panel.classList.add("open");
    const close = () => panel.classList.remove("open");
    panel.querySelector("button")?.addEventListener("click", close, {once:true});
    panel.addEventListener("click", (event) => { if (event.target === panel) close(); }, {once:true});
  }

  function profileStatusLabel(status) {
    const map = {
      draft: "Черновик",
      pending: "На проверке",
      approved: "Опубликована",
      rejected: "Нужны исправления",
      suspended: "Приостановлена"
    };
    return map[status] || status || "Анкета";
  }

  function updateHeaderStatus(status) {
    const button = document.querySelector(".header-button");
    if (!button) return;
    button.textContent = status === "approved" ? "Моя анкета" : status === "pending" ? "Анкета · на проверке" : "Моя анкета";
  }

  // Capture phase prevents the older form listener from executing in parallel.
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      if (typeof currentUser === "undefined" || !currentUser || typeof currentProfile === "undefined" || !currentProfile) {
        throw new Error("Сессия истекла. Войдите снова и повторите сохранение.");
      }

      setBusy(true, "Сохраняю анкету…");
      say("Проверяю данные…");

      let avatarPath = currentProfile.avatar_path;
      const file = form.avatar?.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Фото слишком большое. Максимальный размер — 5 МБ.");
        if (!["image/jpeg","image/png","image/webp"].includes(file.type)) throw new Error("Используйте JPG, PNG или WebP.");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        avatarPath = `${currentUser.id}/avatar-${Date.now()}.${ext}`;
        setBusy(true, "Загружаю фото…");
        const upload = await db.storage.from("profile-photos").upload(avatarPath, file, {upsert:true});
        if (upload.error) throw upload.error;
      }

      const values = {
        display_name: form.display_name.value.trim(),
        birth_year: Number(form.birth_year.value),
        city: form.city.value.trim(),
        instruments: splitList(form.instruments.value),
        genres: splitList(form.genres.value),
        looking_for: splitList(form.looking_for.value),
        bio: form.bio.value.trim(),
        song_url: form.song_url.value.trim() || null,
        avatar_path: avatarPath
      };

      if (!values.display_name) throw new Error("Укажите имя.");
      if (!values.birth_year || values.birth_year > new Date().getFullYear() - 18) throw new Error("ZNAKOMY доступен только пользователям 18+.");
      if (!values.instruments.length && !values.looking_for.length) throw new Error("Укажите инструмент/роль или кого вы ищете.");
      if (values.bio.length < 20) throw new Error("Расскажите о себе чуть подробнее — минимум 20 символов.");

      setBusy(true, "Сохраняю…");
      const saved = await db.from("profiles").update(values).eq("id", currentUser.id).select().single();
      if (saved.error) throw saved.error;
      currentProfile = saved.data;

      // If already pending, approved or suspended, do not create a redundant transition.
      if (["draft","rejected"].includes(currentProfile.status)) {
        setBusy(true, "Отправляю на проверку…");
        const review = await db.rpc("submit_profile_for_review");
        if (review.error) throw review.error;
        currentProfile = review.data;
      }

      const status = currentProfile.status;
      if (stateNode) stateNode.textContent = `Статус анкеты: ${profileStatusLabel(status)}`;
      updateHeaderStatus(status);
      say(status === "approved" ? "Изменения сохранены. Анкета опубликована." : "Готово. Анкета сохранена и находится на проверке.", "success");
      setBusy(false, status === "approved" ? "Сохранить изменения" : "Анкета на проверке ✓");

      setTimeout(() => {
        modal?.classList.remove("open");
        modal?.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        successPanel(status === "approved"
          ? "Изменения сохранены. Ваша анкета уже видна участникам ZNAKOMY."
          : "Всё сохранено. Анкета отправлена модератору. После одобрения она автоматически появится в поиске музыкантов.");
      }, 650);
    } catch (error) {
      console.error("Profile flow error", error);
      const message = error?.message || "Не удалось сохранить анкету. Попробуйте ещё раз.";
      say(message, "error");
      setBusy(false, "Попробовать снова");
    }
  }, true);

  // Reflect current state whenever the profile screen is opened/updated.
  const observer = new MutationObserver(() => {
    if (typeof currentProfile === "undefined" || !currentProfile) return;
    const status = currentProfile.status;
    updateHeaderStatus(status);
    if (status === "pending") {
      submit.textContent = "Сохранить изменения";
      hint.querySelector("span").textContent = "Анкета уже на проверке. Если вы что-то измените, нажмите «Сохранить изменения» — повторно отправлять её не нужно.";
    } else if (status === "approved") {
      submit.textContent = "Сохранить изменения";
      hint.querySelector("span").textContent = "Анкета опубликована. Изменения сохраняются сразу в вашем профиле.";
    } else {
      submit.textContent = "Сохранить и отправить на проверку";
    }
  });
  observer.observe(document.querySelector("#profileView") || form, {attributes:true, childList:true, subtree:false});
})();
