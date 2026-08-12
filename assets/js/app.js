const SUPABASE_URL = "https://kfxhmjbdyovododkndpu.supabase.co";
const SUPABASE_KEY = "sb_publishable_iZakAF0HwDNE774ZX939fg_P5mtH8GC";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const ADMIN_EMAILS = ["digitalaleksei@gmail.com", "zvukor1980@gmail.com"];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const splitList = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const statusNames = {draft:"Черновик",pending:"Ожидает проверки",approved:"Опубликована",rejected:"Нужны исправления",suspended:"Приостановлена"};

const menuButton = $(".menu-button");
const nav = $(".main-nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  $$("a", nav).forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
}

const modal = $("#authModal");
const authView = $("#authView");
const profileView = $("#profileView");
const authForm = $("#authForm");
const profileForm = $("#profileForm");
let authMode = "signup";
let currentUser = null;
let currentProfile = null;

function showMessage(target, message, error = false) {
  target.textContent = message;
  target.classList.toggle("error", error);
}
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
$$("[data-open-auth], a[href='#auth']").forEach((button) => button.addEventListener("click", (event) => {
  event.preventDefault(); openModal();
}));
$$("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

function setAuthMode(mode) {
  authMode = mode;
  $$("[data-auth-mode]").forEach((button) => button.classList.toggle("active", button.dataset.authMode === mode));
  $("#authTitle").textContent = mode === "signup" ? "Регистрация нового пользователя" : "Вход в личный кабинет";
  $("#authSubmit").textContent = mode === "signup" ? "Зарегистрироваться" : "Войти";
  if (mode === "signin" && !authForm.email.value) authForm.email.value = "zvukor1980@gmail.com";
  $("#nameField").hidden = mode !== "signup";
  authForm.display_name.required = mode === "signup";
  authForm.password.autocomplete = mode === "signup" ? "new-password" : "current-password";
  $("#resetPassword").hidden = mode !== "signin";
  $("#resendConfirmation").hidden = mode !== "signup";
  showMessage($("#authStatus"), "");
}
$$("[data-auth-mode]").forEach((button) => button.addEventListener("click", () => setAuthMode(button.dataset.authMode)));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = authForm.email.value.trim().toLowerCase();
  const password = authForm.password.value;
  showMessage($("#authStatus"), "Подождите…");
  const response = authMode === "signup"
    ? await db.auth.signUp({
        email, password,
        options: {
          data: {display_name: authForm.display_name.value.trim()},
          emailRedirectTo: location.origin + location.pathname
        }
      })
    : await db.auth.signInWithPassword({email, password});
  if (response.error) {
    console.error("Auth error", response.error);
    const messages = {
      invalid_credentials: "Неверный email или пароль. Если пароль не помните — нажмите «Забыли пароль?»",
      email_not_confirmed: "Email ещё не подтверждён.",
      over_request_rate_limit: "Слишком много попыток. Подождите несколько минут."
    };
    return showMessage($("#authStatus"), messages[response.error.code] || response.error.message || "Не удалось войти.", true);
  }
  if (authMode === "signup" && !response.data.session) {
    showMessage($("#authStatus"), "Проверьте почту и подтвердите регистрацию.");
  } else {
    showMessage($("#authStatus"), "Вход выполнен. Открываю личный кабинет…");
    await showAccount(response.data.user);
  }
});

$("#resendConfirmation").addEventListener("click", async () => {
  const email = authForm.email.value.trim().toLowerCase();
  if (!email) return showMessage($("#authStatus"), "Сначала укажите email.", true);
  showMessage($("#authStatus"), "Отправляю новое письмо…");
  const {error} = await db.auth.resend({
    type: "signup",
    email,
    options: {emailRedirectTo: "https://zvukor1980-crypto.github.io/znakomy-site/"}
  });
  showMessage($("#authStatus"), error ? error.message : "Новое письмо отправлено. Используйте самую свежую ссылку.", Boolean(error));
});

$("#resetPassword").addEventListener("click", async () => {
  const email = authForm.email.value.trim().toLowerCase();
  if (!email) return showMessage($("#authStatus"), "Сначала укажите email.", true);
  const {error} = await db.auth.resetPasswordForEmail(email, {redirectTo: location.origin + location.pathname});
  showMessage($("#authStatus"), error ? error.message : "Ссылка для восстановления отправлена.", Boolean(error));
});

async function showAccount(user) {
  currentUser = user;
  authView.hidden = true;
  profileView.hidden = false;
  const {data, error} = await db.from("profiles").select("*").eq("id", user.id).single();
  if (error) return showMessage($("#profileStatus"), error.message, true);
  currentProfile = data;
  for (const name of ["display_name","birth_year","city","bio"]) {
    profileForm.elements[name].value = data[name] ?? "";
  }
  for (const name of ["instruments","genres","looking_for"]) {
    profileForm.elements[name].value = (data[name] || []).join(", ");
  }
  renderProfileState();
  if (ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
    $("#adminPanel").hidden = false;
    await loadAdminQueue();
  }
}
function renderProfileState() {
  const state = statusNames[currentProfile?.status] || currentProfile?.status;
  $("#profileState").textContent = "Статус анкеты: " + state + (currentProfile?.moderation_note ? " — " + currentProfile.moderation_note : "");
}

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage($("#profileStatus"), "Сохраняю…");
  let avatarPath = currentProfile.avatar_path;
  const file = profileForm.avatar.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) return showMessage($("#profileStatus"), "Фото должно быть меньше 5 МБ.", true);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    avatarPath = currentUser.id + "/avatar-" + Date.now() + "." + ext;
    const upload = await db.storage.from("profile-photos").upload(avatarPath, file, {upsert:true});
    if (upload.error) return showMessage($("#profileStatus"), upload.error.message, true);
  }
  const values = {
    display_name: profileForm.display_name.value.trim(),
    birth_year: Number(profileForm.birth_year.value),
    city: profileForm.city.value.trim(),
    instruments: splitList(profileForm.instruments.value),
    genres: splitList(profileForm.genres.value),
    looking_for: splitList(profileForm.looking_for.value),
    bio: profileForm.bio.value.trim(),
    avatar_path: avatarPath
  };
  const {data, error} = await db.from("profiles").update(values).eq("id", currentUser.id).select().single();
  if (error) return showMessage($("#profileStatus"), error.message, true);
  currentProfile = data;
  renderProfileState();
  showMessage($("#profileStatus"), "Анкета сохранена.");
});

$("#submitReview").addEventListener("click", async () => {
  showMessage($("#profileStatus"), "Отправляю…");
  const {data, error} = await db.rpc("submit_profile_for_review");
  if (error) return showMessage($("#profileStatus"), error.message, true);
  currentProfile = data;
  renderProfileState();
  showMessage($("#profileStatus"), "Анкета отправлена администратору на проверку.");
});

$("#logoutButton").addEventListener("click", async () => {
  await db.auth.signOut();
  currentUser = null; currentProfile = null;
  profileView.hidden = true; authView.hidden = false;
  setAuthMode("signin");
});

function photoUrl(path) {
  if (!path) return "";
  return db.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
}
function profileCard(profile) {
  const tags = [...(profile.instruments || []), ...(profile.genres || [])].slice(0, 3).map(escapeHtml).join(" · ");
  const image = photoUrl(profile.avatar_path);
  return `<article class="musician-card member-card" data-tags="${escapeHtml((profile.instruments || []).join(" ").toLowerCase())}">
    ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(profile.display_name)}" loading="lazy">` : '<div class="avatar-placeholder">♪</div>'}
    <div class="card-overlay"></div>
    <div class="card-caption"><strong>${escapeHtml(profile.display_name)}</strong><span>${tags || escapeHtml(profile.city)}</span></div>
  </article>`;
}
async function loadProfiles() {
  const {data, error} = await db.from("profiles").select("id,display_name,city,instruments,genres,looking_for,bio,avatar_path,created_at").eq("status","approved").order("created_at",{ascending:false});
  if (error) {
    $("#memberCount").textContent = "Не удалось загрузить анкеты";
    return;
  }
  $("#memberCount").textContent = data.length ? "Анкет: " + data.length : "Пока нет опубликованных анкет";
  if (data.length) $("#profileGrid").innerHTML = data.map(profileCard).join("");
}
$$(".filter-button").forEach((button) => button.addEventListener("click", () => {
  $$(".filter-button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  const value = button.textContent.trim().toLowerCase();
  $$(".member-card").forEach((card) => {
    card.hidden = value !== "все" && !card.dataset.tags.includes(value);
  });
}));

async function loadAdminQueue() {
  const {data, error} = await db.from("profiles").select("id,email,display_name,city,instruments,genres,bio,status,created_at").in("status",["pending","rejected","suspended"]).order("created_at",{ascending:true});
  const queue = $("#adminQueue");
  if (error) return queue.textContent = error.message;
  if (!data.length) return queue.innerHTML = "<p>Новых анкет на проверку нет.</p>";
  queue.innerHTML = data.map((profile) => `<article class="admin-item">
    <strong>${escapeHtml(profile.display_name || profile.email)}</strong>
    <small>${escapeHtml(profile.email)} · ${escapeHtml(profile.city)} · ${escapeHtml(statusNames[profile.status])}</small>
    <p>${escapeHtml(profile.bio)}</p>
    <div><button data-moderate="approved" data-id="${profile.id}">Одобрить</button><button data-moderate="rejected" data-id="${profile.id}">Вернуть</button><button data-moderate="suspended" data-id="${profile.id}">Заблокировать</button></div>
  </article>`).join("");
  $$("[data-moderate]", queue).forEach((button) => button.addEventListener("click", async () => {
    const note = button.dataset.moderate === "approved" ? "" : prompt("Причина или комментарий:") || "";
    const {error} = await db.rpc("admin_set_profile_status",{target_id:button.dataset.id,new_status:button.dataset.moderate,note});
    if (error) alert(error.message); else { await loadAdminQueue(); await loadProfiles(); }
  }));
}

db.auth.onAuthStateChange((_event, session) => {
  if (session?.user) showAccount(session.user);
});
(async () => {
  await loadProfiles();
  const {data} = await db.auth.getSession();
  if (data.session?.user) await showAccount(data.session.user);
})();
