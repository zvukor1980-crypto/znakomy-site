const SUPABASE_URL = "https://kfxhmjbdyovododkndpu.supabase.co";
const SUPABASE_KEY = "sb_publishable_iZakAF0HwDNE774ZX939fg_P5mtH8GC";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const ADMIN_EMAILS = ["digitalaleksei@gmail.com", "zvukor1980@gmail.com"];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const splitList = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const statusNames = {draft:"Черновик",pending:"Ожидает проверки",approved:"Опубликована",rejected:"Нужны исправления",suspended:"Приостановлена"};

document.addEventListener("pointermove", (event) => {
  document.body.style.setProperty("--mx", `${event.clientX}px`);
  document.body.style.setProperty("--my", `${event.clientY}px`);
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.target.classList.toggle("visible", entry.isIntersecting));
}, {threshold:0.08, rootMargin:"0px 0px -40px"});
document.querySelectorAll(".benefits,.content-grid,.manifesto-section,.services-section,.contact-section").forEach((element) => {
  element.classList.add("reveal");
  revealObserver.observe(element);
});

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
let activeConversation = null;
let messageChannel = null;
let conversationPartners = new Map();

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
    options: {emailRedirectTo: location.origin + location.pathname}
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
  const {data, error} = await db.from("profiles").select("id,display_name,birth_year,city,instruments,genres,looking_for,bio,avatar_path,status,moderation_note,created_at,updated_at,approved_at").eq("id", user.id).single();
  if (error) return showMessage($("#profileStatus"), error.message, true);
  currentProfile = data;
  $("#openMessages").hidden = false;
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
  $("#openMessages").hidden = true;
  closeChatDrawer();
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
  return `<article class="musician-card member-card" data-profile-id="${profile.id}" data-profile-name="${escapeHtml(profile.display_name)}" data-tags="${escapeHtml((profile.instruments || []).join(" ").toLowerCase())}">
    ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(profile.display_name)}" loading="lazy">` : '<div class="avatar-placeholder">♪</div>'}
    <div class="card-overlay"></div>
    <div class="card-caption"><strong>${escapeHtml(profile.display_name)}</strong><span>${tags || escapeHtml(profile.city)}</span></div>
    <button class="start-chat" type="button" aria-label="Написать ${escapeHtml(profile.display_name)}">Написать →</button>
  </article>`;
}
async function loadProfiles(filters = {}) {
  const instrumentMap = {"Гитара":["Гитара","Guitar"],"Бас":["Бас","Bass"],"Барабаны":["Барабаны","Drums"],"Вокал":["Вокал","Vocal","Vocals"],"Клавиши":["Клавиши","Keys","Keyboard"]};
  let query = db.from("profiles").select("id,display_name,city,instruments,genres,looking_for,bio,avatar_path,created_at").eq("status","approved");
  if (filters.instrument) query = query.overlaps("instruments", instrumentMap[filters.instrument] || [filters.instrument]);
  if (filters.genre) query = query.contains("genres", [filters.genre]);
  const {data, error} = await query.order("created_at",{ascending:false});
  if (error) {
    $("#memberCount").textContent = "Не удалось загрузить анкеты";
    $("#profileGrid").innerHTML = '<div class="profile-loading">Попробуйте обновить страницу чуть позже.</div>';
    return;
  }
  $("#memberCount").textContent = data.length ? "Анкет: " + data.length : "Пока нет опубликованных анкет";
  $("#profileGrid").innerHTML = data.length
    ? data.map(profileCard).join("")
    : '<div class="profile-loading">Станьте первым музыкантом в сообществе.</div>';
}
$("#profileGrid").addEventListener("click", async (event) => {
  const button = event.target.closest(".start-chat");
  if (!button) return;
  const card = button.closest(".member-card");
  await startConversation(card.dataset.profileId, card.dataset.profileName);
});
$$(".filter-button").forEach((button) => button.addEventListener("click", async () => {
  $$(".filter-button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  const value = button.textContent.trim().toLowerCase();
  const label = button.textContent.trim();
  const searchForm = $("#musicianSearch");
  if (searchForm) searchForm.instrument.value = value === "все" ? "" : label;
  await loadProfiles({instrument:value === "все" ? "" : label,genre:searchForm?.genre.value || ""});
}));

const musicianSearch = $("#musicianSearch");
if (musicianSearch) musicianSearch.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loadProfiles({instrument:event.currentTarget.instrument.value,genre:event.currentTarget.genre.value});
  $("#people")?.scrollIntoView({behavior:"smooth",block:"start"});
});

async function loadAdminQueue() {
  const {data, error} = await db.from("profiles").select("id,display_name,city,instruments,genres,bio,status,created_at").in("status",["pending","rejected","suspended"]).order("created_at",{ascending:true});
  const queue = $("#adminQueue");
  if (error) return queue.textContent = error.message;
  if (!data.length) return queue.innerHTML = "<p>Новых анкет на проверку нет.</p>";
  queue.innerHTML = data.map((profile) => `<article class="admin-item">
    <strong>${escapeHtml(profile.display_name || "Без имени")}</strong>
    <small>${escapeHtml(profile.city)} · ${escapeHtml(statusNames[profile.status])}</small>
    <p>${escapeHtml(profile.bio)}</p>
    <div><button data-moderate="approved" data-id="${profile.id}">Одобрить</button><button data-moderate="rejected" data-id="${profile.id}">Вернуть</button><button data-moderate="suspended" data-id="${profile.id}">Заблокировать</button></div>
  </article>`).join("");
  $$("[data-moderate]", queue).forEach((button) => button.addEventListener("click", async () => {
    const note = button.dataset.moderate === "approved" ? "" : prompt("Причина или комментарий:") || "";
    const {error} = await db.rpc("admin_set_profile_status",{target_id:button.dataset.id,new_status:button.dataset.moderate,note});
    if (error) alert(error.message); else { await loadAdminQueue(); await loadProfiles(); }
  }));
}

const chatDrawer = $("#chatDrawer");
function openChatDrawer() {
  chatDrawer.classList.add("open");
  chatDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("chat-open");
}
function closeChatDrawer() {
  chatDrawer.classList.remove("open");
  chatDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("chat-open");
}
$("#openMessages").addEventListener("click", async () => {
  openChatDrawer();
  await loadConversations();
});
$$('[data-close-chat]').forEach((button) => button.addEventListener("click", closeChatDrawer));

async function startConversation(targetId, targetName) {
  if (!currentUser) {
    setAuthMode("signin");
    openModal();
    showMessage($("#authStatus"), "Войдите, чтобы написать музыканту.");
    return;
  }
  if (targetId === currentUser.id) {
    openChatDrawer();
    return showMessage($("#chatStatus"), "Это ваша анкета.", true);
  }
  const {data, error} = await db.rpc("start_conversation", {target_id: targetId});
  if (error) {
    openChatDrawer();
    return showMessage($("#chatStatus"), error.message || "Не удалось начать диалог.", true);
  }
  openChatDrawer();
  await loadConversations();
  await selectConversation(data, {id: targetId, display_name: targetName});
}

async function loadConversations() {
  if (!currentUser) return;
  const list = $("#conversationList");
  list.innerHTML = '<p class="chat-empty">Загружаю диалоги…</p>';
  const {data: conversations, error} = await db.from("conversations")
    .select("id,user_a,user_b,last_message_at")
    .order("last_message_at", {ascending:false});
  if (error) return list.innerHTML = `<p class="chat-empty">${escapeHtml(error.message)}</p>`;
  if (!conversations.length) return list.innerHTML = '<p class="chat-empty">Пока нет диалогов.<br>Выберите музыканта и нажмите «Написать».</p>';
  const partnerIds = [...new Set(conversations.map((item) => item.user_a === currentUser.id ? item.user_b : item.user_a))];
  const {data: profiles} = await db.from("profiles").select("id,display_name,avatar_path,instruments").in("id", partnerIds);
  conversationPartners = new Map((profiles || []).map((profile) => [profile.id, profile]));
  list.innerHTML = conversations.map((conversation) => {
    const partnerId = conversation.user_a === currentUser.id ? conversation.user_b : conversation.user_a;
    const partner = conversationPartners.get(partnerId) || {id:partnerId,display_name:"Музыкант"};
    const image = photoUrl(partner.avatar_path);
    return `<button class="conversation-item" type="button" data-conversation-id="${conversation.id}" data-partner-id="${partnerId}">
      ${image ? `<img src="${escapeHtml(image)}" alt="">` : '<span class="conversation-avatar">♪</span>'}
      <span><strong>${escapeHtml(partner.display_name)}</strong><small>${escapeHtml((partner.instruments || []).slice(0,2).join(" · ") || "Открыть диалог")}</small></span>
    </button>`;
  }).join("");
  $$(".conversation-item", list).forEach((button) => button.addEventListener("click", () => {
    selectConversation(button.dataset.conversationId, conversationPartners.get(button.dataset.partnerId));
  }));
}

async function selectConversation(conversationId, partner = {}) {
  activeConversation = conversationId;
  $("#chatWelcome").hidden = true;
  $("#activeChat").hidden = false;
  $("#activeChatPerson").innerHTML = `<strong>${escapeHtml(partner?.display_name || "Музыкант")}</strong><small>личный диалог · только для вас двоих</small>`;
  $$(".conversation-item").forEach((item) => item.classList.toggle("active", item.dataset.conversationId === conversationId));
  showMessage($("#chatStatus"), "");
  const {data, error} = await db.from("messages").select("id,sender_id,body,created_at,read_at")
    .eq("conversation_id", conversationId).order("created_at", {ascending:true}).limit(300);
  if (error) return showMessage($("#chatStatus"), error.message, true);
  renderMessages(data || []);
  await db.rpc("mark_conversation_read", {target_conversation_id: conversationId});
  if (messageChannel) await db.removeChannel(messageChannel);
  messageChannel = db.channel(`messages:${conversationId}`)
    .on("postgres_changes", {event:"INSERT", schema:"public", table:"messages", filter:`conversation_id=eq.${conversationId}`}, (payload) => {
      appendMessage(payload.new);
      if (payload.new.sender_id !== currentUser.id) db.rpc("mark_conversation_read", {target_conversation_id: conversationId});
    }).subscribe();
  $("#messageForm").message.focus();
}

function messageMarkup(message) {
  const own = message.sender_id === currentUser.id;
  const time = new Intl.DateTimeFormat("ru", {hour:"2-digit",minute:"2-digit"}).format(new Date(message.created_at));
  return `<div class="message-bubble ${own ? "own" : "incoming"}" data-message-id="${message.id}"><p>${escapeHtml(message.body)}</p><small>${time}</small></div>`;
}
function renderMessages(messages) {
  const stream = $("#messageStream");
  stream.innerHTML = messages.length ? messages.map(messageMarkup).join("") : '<p class="dialog-start">Диалог начинается здесь. Поздоровайтесь 👋</p>';
  stream.scrollTop = stream.scrollHeight;
}
function appendMessage(message) {
  const stream = $("#messageStream");
  $(".dialog-start", stream)?.remove();
  if ($(`[data-message-id="${message.id}"]`, stream)) return;
  stream.insertAdjacentHTML("beforeend", messageMarkup(message));
  stream.scrollTop = stream.scrollHeight;
}
$("#messageForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeConversation || !currentUser) return;
  const field = event.currentTarget.message;
  const body = field.value.trim();
  if (!body) return;
  field.disabled = true;
  const {data, error} = await db.from("messages").insert({conversation_id:activeConversation,sender_id:currentUser.id,body}).select().single();
  field.disabled = false;
  if (error) return showMessage($("#chatStatus"), error.message, true);
  field.value = "";
  appendMessage(data);
  field.focus();
  showMessage($("#chatStatus"), "");
});

db.auth.onAuthStateChange((_event, session) => {
  if (session?.user) setTimeout(() => showAccount(session.user), 0);
});
(async () => {
  await loadProfiles();
  const {data} = await db.auth.getSession();
  if (data.session?.user) await showAccount(data.session.user);
})();
