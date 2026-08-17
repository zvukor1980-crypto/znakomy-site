/* ZNAKOMY community features */
(() => {
  const configs = {
    groups: {title:"Группы", kicker:"Команды и проекты", table:"groups", fields:[
      ["name","Название группы","text",true],["genres","Жанры через запятую","text",false],["looking_for","Кого ищете","text",false],["description","О группе","textarea",true]
    ]},
    events: {title:"События", kicker:"Джемы, репетиции и концерты", table:"events", fields:[
      ["title","Название","text",true],["starts_at","Дата и время","datetime-local",true],["venue","Место","text",false],["description","Описание","textarea",false]
    ]},
    ads: {title:"Объявления", kicker:"Ищу музыканта, группу или проект", table:"ads", fields:[
      ["category","Категория","select",true],["title","Заголовок","text",true],["body","Текст объявления","textarea",true]
    ]},
    market: {title:"Market", kicker:"Инструменты и аппаратура", table:"market_listings", fields:[
      ["category","Категория","market-select",true],["title","Название","text",true],["price_ils","Цена, ₪","number",false],["item_condition","Состояние","condition-select",true],["description","Описание","textarea",false]
    ]}
  };

  const shell = document.createElement("section");
  shell.className = "community-shell";
  shell.setAttribute("aria-hidden","true");
  shell.innerHTML = `<header class="community-top"><div class="community-brand"><small>ZNAKOMY · COMMUNITY</small><strong id="communityTitle">Раздел</strong></div><button class="community-close" type="button" aria-label="Закрыть">×</button></header><main class="community-main"><div class="community-hero"><div><small id="communityKicker"></small><h2 id="communityHeading"></h2><p id="communityLead">Реальные публикации участников ZNAKOMY. Никаких вымышленных данных.</p></div><button class="community-create" type="button">+ Создать</button></div><div class="community-form-wrap"><form class="community-form" id="communityForm"></form></div><div class="community-grid" id="communityGrid"></div></main>`;
  document.body.appendChild(shell);

  let activeKey = null;
  const grid = shell.querySelector("#communityGrid");
  const formWrap = shell.querySelector(".community-form-wrap");
  const form = shell.querySelector("#communityForm");
  const createButton = shell.querySelector(".community-create");

  const esc = (value="") => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const split = value => String(value || "").split(",").map(v=>v.trim()).filter(Boolean);
  const dateText = value => { try { return new Intl.DateTimeFormat("ru-RU",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)); } catch { return value || ""; } };

  function close() { shell.classList.remove("open"); shell.setAttribute("aria-hidden","true"); document.body.style.overflow=""; formWrap.classList.remove("open"); }
  shell.querySelector(".community-close").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && shell.classList.contains("open")) close(); });

  function fieldHtml([name,label,type,required]) {
    const req = required ? "required" : "";
    if (type === "textarea") return `<label class="full">${esc(label)}<textarea name="${name}" ${req}></textarea></label>`;
    if (type === "select") return `<label>${esc(label)}<select name="${name}" ${req}><option value="musician">Ищу музыканта</option><option value="group">Ищу группу</option><option value="jam">Джем</option><option value="project">Проект</option><option value="work">Работа</option><option value="service">Услуги</option><option value="other">Другое</option></select></label>`;
    if (type === "market-select") return `<label>${esc(label)}<select name="${name}" ${req}><option value="guitar">Гитары</option><option value="bass">Бас</option><option value="keys">Клавиши</option><option value="drums">Барабаны</option><option value="microphone">Микрофоны</option><option value="amp">Усилители</option><option value="pedal">Педали</option><option value="studio">Студийная техника</option><option value="live">Концертная аппаратура</option><option value="other">Другое</option></select></label>`;
    if (type === "condition-select") return `<label>${esc(label)}<select name="${name}" ${req}><option value="new">Новое</option><option value="like_new">Как новое</option><option value="used" selected>Б/у</option><option value="repair">Требует ремонта</option></select></label>`;
    return `<label>${esc(label)}<input name="${name}" type="${type}" ${type === "number" ? 'min="0" step="1"' : ""} ${req}></label>`;
  }

  function buildForm(config) {
    form.innerHTML = config.fields.map(fieldHtml).join("") + `<div class="community-form-actions"><button class="community-submit" type="submit">Опубликовать</button><span class="community-status" id="communityStatus"></span></div>`;
  }

  function render(config, rows) {
    if (!rows?.length) { grid.innerHTML = `<div class="community-empty">Здесь пока пусто. Можно стать первым участником, который что-то добавит.</div>`; return; }
    grid.innerHTML = rows.map(row => {
      if (activeKey === "groups") return `<article class="community-card"><small>${esc(row.city || "Хайфа")}</small><h3>${esc(row.name)}</h3><p>${esc(row.description || "")}</p><footer>${esc([...(row.genres||[]),...(row.looking_for||[])].slice(0,4).join(" · "))}</footer></article>`;
      if (activeKey === "events") return `<article class="community-card"><small>${esc(dateText(row.starts_at))}</small><h3>${esc(row.title)}</h3><p>${esc(row.description || row.venue || "")}</p><footer>${esc(row.venue || row.city || "Хайфа")}</footer></article>`;
      if (activeKey === "ads") return `<article class="community-card"><small>${esc(row.category)}</small><h3>${esc(row.title)}</h3><p>${esc(row.body)}</p><footer>${esc(row.city || "Хайфа")}</footer></article>`;
      return `<article class="community-card"><small>${esc(row.item_condition || "")}</small><h3>${esc(row.title)}</h3><p>${esc(row.description || "")}</p><footer>${row.price_ils != null ? esc(`${Number(row.price_ils)} ₪`) : "Цена не указана"}</footer></article>`;
    }).join("");
  }

  async function load() {
    const config = configs[activeKey];
    grid.innerHTML = `<div class="community-empty">Загрузка…</div>`;
    let query = db.from(config.table).select("*");
    if (activeKey === "events") query = query.eq("status","active").gte("starts_at", new Date(Date.now()-86400000).toISOString()).order("starts_at",{ascending:true});
    else if (activeKey === "groups") query = query.eq("is_active",true).order("created_at",{ascending:false});
    else query = query.eq("status","active").order("created_at",{ascending:false});
    const {data,error} = await query.limit(60);
    if (error) { grid.innerHTML = `<div class="community-empty">Не удалось загрузить раздел. ${esc(error.message)}</div>`; return; }
    render(config,data);
  }

  async function open(key) {
    if (!configs[key]) return;
    activeKey = key;
    const config = configs[key];
    shell.querySelector("#communityTitle").textContent = config.title;
    shell.querySelector("#communityHeading").textContent = config.title;
    shell.querySelector("#communityKicker").textContent = config.kicker;
    buildForm(config);
    formWrap.classList.remove("open");
    shell.classList.add("open"); shell.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
    await load();
  }

  createButton.addEventListener("click", () => {
    if (typeof currentUser === "undefined" || !currentUser) {
      close();
      if (typeof setAuthMode === "function") setAuthMode("signin");
      if (typeof openModal === "function") openModal();
      const status = document.querySelector("#authStatus");
      if (status && typeof showMessage === "function") showMessage(status,"Войдите, чтобы создавать публикации.");
      return;
    }
    formWrap.classList.toggle("open");
    if (formWrap.classList.contains("open")) form.querySelector("input,select,textarea")?.focus();
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const status = form.querySelector("#communityStatus");
    const button = form.querySelector(".community-submit");
    if (typeof currentUser === "undefined" || !currentUser) return;
    status.textContent = "Публикую…"; status.classList.remove("error"); button.disabled = true;
    const fd = new FormData(form); const config = configs[activeKey];
    let payload = {owner_id:currentUser.id, city:"Хайфа"};
    for (const [name,,,] of config.fields) payload[name] = fd.get(name);
    if (activeKey === "groups") { payload.genres = split(payload.genres); payload.looking_for = split(payload.looking_for); }
    if (activeKey === "market") { payload.price_ils = payload.price_ils ? Number(payload.price_ils) : null; }
    if (activeKey === "events") payload.starts_at = new Date(payload.starts_at).toISOString();
    const {error} = await db.from(config.table).insert(payload);
    button.disabled = false;
    if (error) { status.textContent = error.message || "Не удалось опубликовать."; status.classList.add("error"); return; }
    status.textContent = "Опубликовано."; form.reset(); formWrap.classList.remove("open"); await load();
  });

  const directionCards = [...document.querySelectorAll("#directions .direction-card")];
  [[0,"groups"],[1,"events"],[2,"ads"],[3,"market"]].forEach(([index,key]) => {
    const card = directionCards[index]; if (!card) return;
    card.setAttribute("role","button"); card.setAttribute("tabindex","0"); card.dataset.community = key;
    const state = card.querySelector(".feature-state"); if (state) { state.textContent="РАБОТАЕТ"; state.classList.add("live"); }
    card.addEventListener("click",()=>open(key));
    card.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();open(key);} });
  });

  [...document.querySelectorAll(".main-nav a")].forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    const key = text.includes("объяв") ? "ads" : text.includes("груп") ? "groups" : text.includes("мероприят") ? "events" : text.includes("маркет") ? "market" : null;
    if (!key) return;
    link.addEventListener("click", e => { e.preventDefault(); open(key); });
  });

  window.ZnakomyCommunity = {open};
})();
