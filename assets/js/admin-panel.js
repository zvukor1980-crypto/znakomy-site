/* ZNAKOMY dedicated admin moderation panel */
(() => {
  const ADMIN_EMAILS = ["digitalaleksei@gmail.com", "zvukor1980@gmail.com"];
  const esc = (v="") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const stateNames = {pending:"На проверке",approved:"Опубликована",rejected:"На исправлении",suspended:"Заблокирована"};
  const shell = document.createElement("section");
  shell.className = "admin-shell";
  shell.setAttribute("aria-hidden","true");
  shell.innerHTML = `
    <header class="admin-topbar">
      <div><small>ZNAKOMY CONTROL</small><strong>Админ-панель</strong></div>
      <button type="button" class="admin-close" aria-label="Закрыть">×</button>
    </header>
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <button class="active" data-admin-tab="pending">Новые анкеты <span data-admin-count="pending">0</span></button>
        <button data-admin-tab="reports">Жалобы <span data-admin-count="reports">0</span></button>
        <button data-admin-tab="approved">Опубликованные</button>
        <button data-admin-tab="suspended">Заблокированные</button>
      </aside>
      <main class="admin-content">
        <div class="admin-heading"><div><small>МОДЕРАЦИЯ</small><h2 id="adminPanelTitle">Новые анкеты</h2></div><button class="admin-refresh" type="button">Обновить</button></div>
        <div id="adminPanelBody" class="admin-grid"><div class="admin-empty">Загрузка…</div></div>
      </main>
    </div>`;
  document.body.appendChild(shell);

  const body = shell.querySelector("#adminPanelBody");
  const title = shell.querySelector("#adminPanelTitle");
  const pendingCount = shell.querySelector('[data-admin-count="pending"]');
  const reportsCount = shell.querySelector('[data-admin-count="reports"]');
  let tab = "pending";
  let isAdmin = false;

  function photo(path){ if(!path) return ""; try{return db.storage.from("profile-photos").getPublicUrl(path).data.publicUrl||"";}catch{return "";} }
  function open(){ if(!isAdmin) return; shell.classList.add("open"); shell.setAttribute("aria-hidden","false"); document.body.classList.add("admin-open"); load(); }
  function close(){ shell.classList.remove("open"); shell.setAttribute("aria-hidden","true"); document.body.classList.remove("admin-open"); }
  shell.querySelector(".admin-close").addEventListener("click",close);
  shell.querySelector(".admin-refresh").addEventListener("click",load);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&shell.classList.contains("open"))close();});

  function adminButton(){
    let btn=document.querySelector("#adminOpenButton");
    if(!btn){ btn=document.createElement("button"); btn.id="adminOpenButton"; btn.type="button"; btn.className="admin-open-button"; btn.innerHTML='Админ <span id="adminBadge" hidden>0</span>'; document.querySelector(".header-actions")?.prepend(btn); btn.addEventListener("click",open); }
    btn.hidden=!isAdmin;
    return btn;
  }

  async function refreshCounts(){
    if(!isAdmin) return;
    const [p,r]=await Promise.all([
      db.from("profiles").select("id",{count:"exact",head:true}).eq("status","pending"),
      db.from("reports").select("id",{count:"exact",head:true}).eq("status","open")
    ]);
    const pc=p.count||0, rc=r.count||0;
    pendingCount.textContent=pc; reportsCount.textContent=rc;
    const badge=document.querySelector("#adminBadge"); if(badge){badge.textContent=String(pc+rc);badge.hidden=!(pc+rc);}
  }

  function profileCard(p){
    const img=photo(p.avatar_path);
    const age=p.birth_year?new Date().getFullYear()-p.birth_year:null;
    return `<article class="admin-profile-card">
      <div class="admin-profile-media">${img?`<img src="${esc(img)}" alt="">`:'<div class="admin-avatar">♪</div>'}</div>
      <div class="admin-profile-copy">
        <div class="admin-card-head"><div><small>${esc(p.city||"Хайфа")}${age?` · ${age} лет`:""}</small><h3>${esc(p.display_name||"Без имени")}</h3></div><span class="admin-state ${esc(p.status)}">${esc(stateNames[p.status]||p.status)}</span></div>
        <p><b>Инструменты:</b> ${esc((p.instruments||[]).join(" · ")||"—")}</p>
        <p><b>Жанры:</b> ${esc((p.genres||[]).join(" · ")||"—")}</p>
        <p><b>Ищет:</b> ${esc((p.looking_for||[]).join(" · ")||"—")}</p>
        <p class="admin-bio">${esc(p.bio||"")}</p>
        ${p.moderation_note?`<p class="admin-note"><b>Комментарий:</b> ${esc(p.moderation_note)}</p>`:""}
        <div class="admin-actions">
          ${p.status!=="approved"?`<button class="approve" data-admin-status="approved" data-id="${p.id}">Одобрить</button>`:""}
          <button class="return" data-admin-status="rejected" data-id="${p.id}">Вернуть на исправление</button>
          <button class="block" data-admin-status="suspended" data-id="${p.id}">Заблокировать</button>
        </div>
      </div>
    </article>`;
  }

  async function loadProfilesByStatus(status){
    body.innerHTML='<div class="admin-empty">Загрузка…</div>';
    const {data,error}=await db.from("profiles").select("id,display_name,birth_year,city,instruments,genres,looking_for,bio,avatar_path,status,moderation_note,created_at,updated_at").eq("status",status).order("updated_at",{ascending:true});
    if(error){body.innerHTML=`<div class="admin-empty error">${esc(error.message)}</div>`;return;}
    body.innerHTML=data?.length?data.map(profileCard).join(""):'<div class="admin-empty">Здесь пока пусто.</div>';
    bindModeration();
  }

  async function loadReports(){
    body.innerHTML='<div class="admin-empty">Загрузка…</div>';
    const {data,error}=await db.from("reports").select("id,reporter_id,reported_profile_id,reason,status,created_at").order("created_at",{ascending:false});
    if(error){body.innerHTML=`<div class="admin-empty error">${esc(error.message)}</div>`;return;}
    const ids=[...new Set((data||[]).flatMap(r=>[r.reporter_id,r.reported_profile_id]))];
    let names=new Map(); if(ids.length){const {data:profiles}=await db.from("profiles").select("id,display_name").in("id",ids); names=new Map((profiles||[]).map(p=>[p.id,p.display_name]));}
    body.innerHTML=data?.length?data.map(r=>`<article class="admin-report-card"><div><small>${new Date(r.created_at).toLocaleString("ru-RU")}</small><h3>Жалоба на ${esc(names.get(r.reported_profile_id)||"пользователя")}</h3><p>${esc(r.reason)}</p><small>От: ${esc(names.get(r.reporter_id)||"пользователь")}</small></div><div class="admin-actions"><button data-report-status="reviewed" data-report-id="${r.id}">Отметить проверенной</button><button data-report-status="closed" data-report-id="${r.id}">Закрыть</button></div></article>`).join(""):'<div class="admin-empty">Жалоб нет.</div>';
    body.querySelectorAll("[data-report-status]").forEach(btn=>btn.addEventListener("click",async()=>{btn.disabled=true;const {error}=await db.from("reports").update({status:btn.dataset.reportStatus}).eq("id",btn.dataset.reportId);btn.disabled=false;if(error)return alert(error.message);await load();}));
  }

  function bindModeration(){
    body.querySelectorAll("[data-admin-status]").forEach(btn=>btn.addEventListener("click",async()=>{
      const status=btn.dataset.adminStatus;
      let note="";
      if(status==="rejected") note=prompt("Что нужно исправить пользователю?")||"";
      if(status==="suspended"&&!confirm("Заблокировать эту анкету?")) return;
      btn.disabled=true;
      const {error}=await db.rpc("admin_set_profile_status",{target_id:btn.dataset.id,new_status:status,note});
      btn.disabled=false;
      if(error) return alert(error.message);
      await load();
      if(typeof loadProfiles==="function") loadProfiles();
    }));
  }

  async function load(){
    await refreshCounts();
    const titles={pending:"Новые анкеты",reports:"Жалобы",approved:"Опубликованные анкеты",suspended:"Заблокированные"}; title.textContent=titles[tab]||"Модерация";
    if(tab==="reports") return loadReports();
    return loadProfilesByStatus(tab);
  }

  shell.querySelectorAll("[data-admin-tab]").forEach(btn=>btn.addEventListener("click",()=>{shell.querySelectorAll("[data-admin-tab]").forEach(b=>b.classList.remove("active"));btn.classList.add("active");tab=btn.dataset.adminTab;load();}));

  async function detect(user){
    isAdmin=Boolean(user&&ADMIN_EMAILS.includes((user.email||"").toLowerCase()));
    adminButton();
    if(isAdmin) await refreshCounts();
  }
  if(typeof db!=="undefined"){
    db.auth.onAuthStateChange((_e,session)=>setTimeout(()=>detect(session?.user||null),0));
    db.auth.getSession().then(({data})=>detect(data.session?.user||null));
  }
  window.ZnakomyAdmin={open,refresh:load};
})();