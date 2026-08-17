const SUPABASE_URL = "https://kfxhmjbdyovododkndpu.supabase.co";
const SUPABASE_KEY = "sb_publishable_iZakAF0HwDNE774ZX939fg_P5mtH8GC";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: "znakomy-auth-v1"
  }
});
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
let loadedProfiles = new Map();
let unreadChannel = null;

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
  event.preventDefault();
  if (!currentUser) setAuthMode(button.dataset.authOpenMode || authMode);
  openModal();
}));
$$("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeModal(); closeProfilePreview(); } });

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
  $("#authSubmit").disabled = true;
  const response = authMode === "signup"
    ? await db.auth.signUp({email, password,options:{data:{display_name:authForm.display_name.value.trim()},emailRedirectTo:"https://znakomy.online/"}})
    : await db.auth.signInWithPassword({email, password});
  if (response.error) {
    $("#authSubmit").disabled = false;
    console.error("Auth error", response.error);
    const messages={invalid_credentials:"Неверный email или пароль. Если пароль не помните — нажмите «Забыли пароль?»",email_not_confirmed:"Email ещё не подтверждён.",over_request_rate_limit:"Слишком много попыток. Подождите несколько минут."};
    return showMessage($("#authStatus"),messages[response.error.code]||response.error.message||"Не удалось войти.",true);
  }
  if(authMode==="signup"&&!response.data.session){showMessage($("#authStatus"),"Проверьте почту и подтвердите регистрацию.");}
  else{showMessage($("#authStatus"),"Вход выполнен.");await showAccount(response.data.user);closeModal();}
  $("#authSubmit").disabled=false;
});

$("#resendConfirmation").addEventListener("click",async()=>{const email=authForm.email.value.trim().toLowerCase();if(!email)return showMessage($("#authStatus"),"Сначала укажите email.",true);showMessage($("#authStatus"),"Отправляю новое письмо…");const resendButton=$("#resendConfirmation");resendButton.disabled=true;const{error}=await db.auth.resend({type:"signup",email,options:{emailRedirectTo:"https://znakomy.online/"}});showMessage($("#authStatus"),error?error.message:"Новое письмо отправлено. Используйте самую свежую ссылку.",Boolean(error));let seconds=60;const cooldown=setInterval(()=>{resendButton.textContent=`Повторно через ${seconds--} сек.`;if(seconds<0){clearInterval(cooldown);resendButton.textContent="Отправить подтверждение ещё раз";resendButton.disabled=false}},1000)});
$("#resetPassword").addEventListener("click",async()=>{const email=authForm.email.value.trim().toLowerCase();if(!email)return showMessage($("#authStatus"),"Сначала укажите email.",true);const{error}=await db.auth.resetPasswordForEmail(email,{redirectTo:"https://znakomy.online/"});showMessage($("#authStatus"),error?error.message:"Ссылка для восстановления отправлена.",Boolean(error))});

async function showAccount(user) {
  currentUser = user;
  authView.hidden = true;
  profileView.hidden = false;
  const {data, error} = await db.from("profiles").select("id,display_name,birth_year,city,instruments,genres,looking_for,bio,avatar_path,song_url,status,moderation_note,created_at,updated_at,approved_at").eq("id", user.id).single();
  if (error) return showMessage($("#profileStatus"), error.message, true);
  currentProfile = data;
  $(".header-button").textContent = "Моя анкета";
  $(".header-login").hidden = true;
  $("#openMessages").hidden = false;
  for (const name of ["display_name","birth_year","city","bio","song_url"]) profileForm.elements[name].value=data[name]??"";
  for (const name of ["instruments","genres","looking_for"]) profileForm.elements[name].value=(data[name]||[]).join(", ");
  renderProfileState();await refreshUnreadCount();subscribeUnread();
  if(ADMIN_EMAILS.includes((user.email||"").toLowerCase())){$("#adminPanel").hidden=false;await loadAdminQueue();}
}

/* Remaining application logic is loaded below unchanged from the original build. */
