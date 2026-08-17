/* ZNAKOMY Public Topic Chat */
(() => {
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shell=document.createElement('section');
  shell.className='public-chat-shell';
  shell.setAttribute('aria-hidden','true');
  shell.innerHTML=`<div class="public-chat-backdrop" data-public-chat-close></div><div class="public-chat-panel"><header><div><small>ZNAKOMY · COMMUNITY CHAT</small><h2>Общий чат</h2></div><button type="button" data-public-chat-close>×</button></header><div class="public-chat-layout"><aside id="publicChatRooms"><div class="public-chat-loading">Загрузка тем…</div></aside><main><div class="public-chat-topic"><div><small id="publicChatTopicKicker">ТЕМА</small><h3 id="publicChatTopicTitle">Общий чат</h3><p id="publicChatTopicDescription"></p></div></div><div id="publicChatStream" class="public-chat-stream"><div class="public-chat-loading">Выберите тему</div></div><form id="publicChatForm" class="public-chat-form"><textarea name="message" maxlength="2000" rows="1" placeholder="Напишите сообщение в общий чат…" required></textarea><button type="submit">Отправить</button></form><p id="publicChatStatus" class="public-chat-status"></p></main></div></div>`;
  document.body.appendChild(shell);

  const roomsNode=shell.querySelector('#publicChatRooms'),stream=shell.querySelector('#publicChatStream'),form=shell.querySelector('#publicChatForm'),field=form.elements.message,status=shell.querySelector('#publicChatStatus');
  let rooms=[],room=null,me=null,channel=null;
  function say(t='',e=false){status.textContent=t;status.classList.toggle('error',e)}
  function open(){shell.classList.add('open');shell.setAttribute('aria-hidden','false');document.body.classList.add('public-chat-open');ensureRooms()}
  async function close(){shell.classList.remove('open');shell.setAttribute('aria-hidden','true');document.body.classList.remove('public-chat-open');if(channel){try{await db.removeChannel(channel)}catch(_){}channel=null}}
  async function session(){const{data}=await db.auth.getSession();me=data?.session?.user||null;return me}
  function photo(path){if(!path)return'';try{return db.storage.from('profile-photos').getPublicUrl(path).data.publicUrl||''}catch(_){return''}}

  async function ensureRooms(){if(rooms.length){renderRooms();if(!room)selectRoom(rooms[0]);return}const{data,error}=await db.from('chat_rooms').select('id,slug,title,description,sort_order').eq('is_active',true).order('sort_order');if(error){roomsNode.innerHTML='<div class="public-chat-loading">Не удалось загрузить темы.</div>';return}rooms=data||[];renderRooms();if(rooms[0])selectRoom(rooms[0])}
  function renderRooms(){roomsNode.innerHTML=rooms.map(r=>`<button type="button" class="public-chat-room ${room?.id===r.id?'active':''}" data-room-id="${r.id}"><strong>${esc(r.title)}</strong><small>${esc(r.description)}</small></button>`).join('')}
  function messageHtml(m,p){const own=me&&m.sender_id===me.id,img=photo(p?.avatar_path),time=new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit'}).format(new Date(m.created_at));return `<article class="public-chat-message ${own?'own':''}" data-chat-message-id="${m.id}">${img?`<img src="${esc(img)}" alt="">`:'<span class="public-chat-avatar">♪</span>'}<div><header><strong>${esc(p?.display_name||'Музыкант')}</strong><small>${esc(time)}</small></header><p>${esc(m.body)}</p>${own?`<button type="button" data-chat-delete="${m.id}">Удалить</button>`:''}</div></article>`}
  async function selectRoom(r){room=r;renderRooms();shell.querySelector('#publicChatTopicTitle').textContent=r.title;shell.querySelector('#publicChatTopicDescription').textContent=r.description;stream.innerHTML='<div class="public-chat-loading">Загружаю сообщения…</div>';say('');await session();const{data:messages,error}=await db.from('chat_messages').select('id,room_id,sender_id,body,created_at,status').eq('room_id',r.id).eq('status','visible').order('created_at',{ascending:true}).limit(200);if(error){stream.innerHTML='<div class="public-chat-loading">Не удалось загрузить сообщения.</div>';return}const ids=[...new Set((messages||[]).map(m=>m.sender_id))];let profiles=new Map();if(ids.length){const{data}=await db.from('profiles').select('id,display_name,avatar_path').in('id',ids);profiles=new Map((data||[]).map(p=>[p.id,p]))}stream.innerHTML=messages?.length?messages.map(m=>messageHtml(m,profiles.get(m.sender_id))).join(''):'<div class="public-chat-empty">Здесь пока тихо. Начните разговор.</div>';stream.scrollTop=stream.scrollHeight;if(channel)try{await db.removeChannel(channel)}catch(_){}channel=db.channel(`public-chat:${r.id}:${Date.now()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:`room_id=eq.${r.id}`},async payload=>{if(payload.new.status!=='visible')return;const{data:p}=await db.from('profiles').select('id,display_name,avatar_path').eq('id',payload.new.sender_id).single();stream.querySelector('.public-chat-empty')?.remove();stream.insertAdjacentHTML('beforeend',messageHtml(payload.new,p));stream.scrollTop=stream.scrollHeight}).on('postgres_changes',{event:'DELETE',schema:'public',table:'chat_messages',filter:`room_id=eq.${r.id}`},payload=>{stream.querySelector(`[data-chat-message-id="${payload.old.id}"]`)?.remove()}).subscribe()}

  roomsNode.addEventListener('click',e=>{const b=e.target.closest('[data-room-id]');if(!b)return;const r=rooms.find(x=>x.id===b.dataset.roomId);if(r)selectRoom(r)});
  form.addEventListener('submit',async e=>{e.preventDefault();if(!room)return;const user=await session();if(!user){say('Войдите, чтобы писать в общий чат.',true);if(typeof setAuthMode==='function')setAuthMode('signin');if(typeof openModal==='function')openModal();return}const body=field.value.trim();if(!body)return;field.disabled=true;form.querySelector('button').disabled=true;say('Отправляю…');const{error}=await db.from('chat_messages').insert({room_id:room.id,sender_id:user.id,body});field.disabled=false;form.querySelector('button').disabled=false;if(error){say(error.message||'Не удалось отправить сообщение.',true);field.focus();return}field.value='';say('');field.focus()});
  stream.addEventListener('click',async e=>{const b=e.target.closest('[data-chat-delete]');if(!b)return;if(!confirm('Удалить это сообщение?'))return;const{error}=await db.from('chat_messages').delete().eq('id',b.dataset.chatDelete);if(error)say(error.message,true)});
  shell.querySelectorAll('[data-public-chat-close]').forEach(b=>b.addEventListener('click',close));
  field.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});

  function addEntryPoints(){
    let trigger=document.querySelector('#publicChatButton');
    if(!trigger){trigger=document.createElement('button');trigger.id='publicChatButton';trigger.type='button';trigger.className='public-chat-open-button';trigger.innerHTML='💬 <span>Общий чат</span>';document.querySelector('.header-actions')?.prepend(trigger)}
    trigger.addEventListener('click',open);

    let nav=document.querySelector('#publicChatNav');
    if(!nav){nav=document.createElement('a');nav.id='publicChatNav';nav.href='#community-chat';nav.textContent='Общий чат';document.querySelector('.main-nav')?.appendChild(nav)}
    nav.addEventListener('click',e=>{e.preventDefault();open()});

    let mobile=document.querySelector('#mobilePublicChat');
    if(!mobile){mobile=document.createElement('button');mobile.id='mobilePublicChat';mobile.type='button';mobile.innerHTML='<span>💬</span><small>Чат</small>';document.querySelector('.mobile-dock')?.insertBefore(mobile,document.querySelector('#mobileMessages'))}
    mobile.addEventListener('click',open);

    let floating=document.querySelector('#floatingPublicChat');
    if(!floating){floating=document.createElement('button');floating.id='floatingPublicChat';floating.type='button';floating.innerHTML='<b>💬</b><span>Общий чат</span>';floating.setAttribute('aria-label','Открыть общий чат');document.body.appendChild(floating)}
    floating.addEventListener('click',open);
  }
  addEntryPoints();

  const visibilityStyle=document.createElement('style');
  visibilityStyle.textContent=`
    #publicChatButton{display:inline-flex!important;align-items:center;gap:7px;min-height:38px;padding:0 14px;border:1px solid rgba(157,92,255,.55);border-radius:999px;background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;font-weight:800;cursor:pointer;white-space:nowrap}
    #publicChatNav{color:#c9a7ff!important;font-weight:800!important}
    #mobilePublicChat{border:0;background:none;color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center}
    #floatingPublicChat{position:fixed;right:22px;bottom:24px;z-index:2200;display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:12px 18px;background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;font:800 14px/1 Inter,system-ui;box-shadow:0 16px 45px rgba(87,26,199,.45);cursor:pointer}
    #floatingPublicChat b{font-size:18px}
    @media(max-width:900px){#publicChatButton{display:none!important}#floatingPublicChat{right:14px;bottom:86px;padding:11px 14px}#floatingPublicChat span{display:none}}
  `;
  document.head.appendChild(visibilityStyle);
  window.ZnakomyPublicChat={open,close};
})();
