/* ZNAKOMY Public Topic Chat */
(() => {
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shell=document.createElement('section');
  shell.className='public-chat-shell';
  shell.setAttribute('aria-hidden','true');
  shell.innerHTML=`<div class="public-chat-backdrop" data-public-chat-close></div><div class="public-chat-panel"><header><div><small>ZNAKOMY · COMMUNITY CHAT</small><h2>Общий чат</h2></div><button type="button" data-public-chat-close aria-label="Закрыть">×</button></header><div class="public-chat-layout"><aside id="publicChatRooms"><div class="public-chat-loading">Загрузка тем…</div></aside><main><div class="public-chat-topic"><div><small id="publicChatTopicKicker">ТЕМА</small><h3 id="publicChatTopicTitle">Общий чат</h3><p id="publicChatTopicDescription"></p></div></div><div id="publicChatStream" class="public-chat-stream"><div class="public-chat-loading">Выберите тему</div></div><form id="publicChatForm" class="public-chat-form"><textarea name="message" maxlength="2000" rows="1" placeholder="Напишите сообщение в общий чат…" required></textarea><button type="submit">Отправить</button></form><p id="publicChatStatus" class="public-chat-status"></p></main></div></div>`;
  document.body.appendChild(shell);

  const roomsNode=shell.querySelector('#publicChatRooms'),stream=shell.querySelector('#publicChatStream'),form=shell.querySelector('#publicChatForm'),field=form.elements.message,status=shell.querySelector('#publicChatStatus');
  let rooms=[],room=null,me=null,channel=null,loadingRooms=false;

  const FALLBACK_ROOMS=[{
    id:'local-general',
    slug:'general',
    title:'Общий чат',
    description:'Темы с сервера временно недоступны. Интерфейс открыт — нажмите «Обновить темы».',
    sort_order:0,
    _fallback:true
  }];

  function say(t='',e=false){status.textContent=t;status.classList.toggle('error',e)}
  function open(){shell.classList.add('open');shell.setAttribute('aria-hidden','false');document.body.classList.add('public-chat-open');ensureRooms()}
  async function close(e){
    if(e){e.preventDefault();e.stopPropagation()}
    shell.classList.remove('open');shell.setAttribute('aria-hidden','true');document.body.classList.remove('public-chat-open');
    if(channel){try{await db.removeChannel(channel)}catch(_){}channel=null}
  }
  async function session(){const{data}=await db.auth.getSession();me=data?.session?.user||null;return me}
  function photo(path){if(!path)return'';try{return db.storage.from('profile-photos').getPublicUrl(path).data.publicUrl||''}catch(_){return''}}

  function useFallback(reason){
    console.warn('Public chat rooms fallback',reason);
    rooms=FALLBACK_ROOMS.map(r=>({...r}));
    renderRooms();
    roomsNode.insertAdjacentHTML('beforeend',`<button type="button" class="public-chat-room" id="publicChatRetryRooms"><strong>↻ Обновить темы</strong><small>Повторить загрузку с сервера</small></button>`);
    roomsNode.querySelector('#publicChatRetryRooms')?.addEventListener('click',()=>{rooms=[];room=null;ensureRooms(true)});
    selectRoom(rooms[0]);
    say(reason?'Темы недоступны — показан запасной чат.':'Темы пока пусты — показан запасной чат.',true);
  }

  async function ensureRooms(force=false){
    if(loadingRooms)return;
    if(rooms.length&&!force&&!rooms[0]?._fallback){renderRooms();if(!room)selectRoom(rooms[0]);return}
    if(force){rooms=[];room=null}
    loadingRooms=true;
    roomsNode.innerHTML='<div class="public-chat-loading">Загрузка тем…</div>';
    say('');
    let data=null,error=null;
    try{
      const res=await db.from('chat_rooms').select('id,slug,title,description,sort_order').eq('is_active',true).order('sort_order',{ascending:true});
      data=res.data;error=res.error;
    }catch(err){error=err}
    if(error||!data?.length){
      try{
        const res2=await db.from('chat_rooms').select('id,slug,title,description,sort_order').order('sort_order',{ascending:true}).limit(20);
        if(!res2.error&&res2.data?.length){data=res2.data;error=null}
        else if(!error)error=res2.error;
      }catch(_){}
    }
    loadingRooms=false;
    if(error||!data?.length){
      useFallback(error?.message||error||'empty');
      return;
    }
    rooms=data;
    renderRooms();
    if(rooms[0])selectRoom(rooms[0]);
  }

  function renderRooms(){
    roomsNode.innerHTML=rooms.map(r=>`<button type="button" class="public-chat-room ${room?.id===r.id?'active':''}" data-room-id="${esc(r.id)}"><strong>${esc(r.title)}</strong><small>${esc(r.description||'')}</small></button>`).join('');
  }

  function messageHtml(m,p){
    const own=me&&m.sender_id===me.id,img=photo(p?.avatar_path),time=new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit'}).format(new Date(m.created_at));
    return `<article class="public-chat-message ${own?'own':''}" data-chat-message-id="${m.id}">${img?`<img src="${esc(img)}" alt="">`:'<span class="public-chat-avatar">♪</span>'}<div><header><strong>${esc(p?.display_name||'Музыкант')}</strong><small>${esc(time)}</small></header><p>${esc(m.body)}</p>${own?`<button type="button" data-chat-delete="${m.id}">Удалить</button>`:''}</div></article>`;
  }

  async function selectRoom(r){
    room=r;
    renderRooms();
    shell.querySelector('#publicChatTopicTitle').textContent=r.title;
    shell.querySelector('#publicChatTopicDescription').textContent=r.description||'';
    if(r._fallback){
      stream.innerHTML=`<div class="public-chat-empty"><p><strong>Чат открыт</strong></p><p>Не удалось загрузить темы с сервера (доступ к комнатам ограничен). Нажмите «Обновить темы», чтобы повторить.</p><button type="button" id="publicChatRetryInStream" class="public-chat-open-button">↻ Обновить темы</button></div>`;
      say('Запасной режим: отправка сообщений недоступна, пока темы не загрузятся.',true);
      stream.querySelector('#publicChatRetryInStream')?.addEventListener('click',()=>{rooms=[];room=null;ensureRooms(true)});
      if(channel){try{await db.removeChannel(channel)}catch(_){}channel=null}
      return;
    }
    stream.innerHTML='<div class="public-chat-loading">Загружаю сообщения…</div>';
    say('');
    await session();
    const{data:messages,error}=await db.from('chat_messages').select('id,room_id,sender_id,body,created_at,status').eq('room_id',r.id).eq('status','visible').order('created_at',{ascending:true}).limit(200);
    if(error){
      stream.innerHTML=`<div class="public-chat-empty"><p>Не удалось загрузить сообщения.</p><p>${esc(error.message||'')}</p><button type="button" id="publicChatRetryMsgs" class="public-chat-open-button">↻ Повторить</button></div>`;
      stream.querySelector('#publicChatRetryMsgs')?.addEventListener('click',()=>selectRoom(r));
      return;
    }
    const ids=[...new Set((messages||[]).map(m=>m.sender_id))];
    let profiles=new Map();
    if(ids.length){
      const{data}=await db.from('profiles').select('id,display_name,avatar_path').in('id',ids);
      profiles=new Map((data||[]).map(p=>[p.id,p]));
    }
    stream.innerHTML=messages?.length?messages.map(m=>messageHtml(m,profiles.get(m.sender_id))).join(''):'<div class="public-chat-empty">Здесь пока тихо. Начните разговор.</div>';
    stream.scrollTop=stream.scrollHeight;
    if(channel)try{await db.removeChannel(channel)}catch(_){}
    channel=db.channel(`public-chat:${r.id}:${Date.now()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:`room_id=eq.${r.id}`},async payload=>{
      if(payload.new.status!=='visible')return;
      const{data:p}=await db.from('profiles').select('id,display_name,avatar_path').eq('id',payload.new.sender_id).single();
      stream.querySelector('.public-chat-empty')?.remove();
      stream.insertAdjacentHTML('beforeend',messageHtml(payload.new,p));
      stream.scrollTop=stream.scrollHeight;
    }).on('postgres_changes',{event:'DELETE',schema:'public',table:'chat_messages',filter:`room_id=eq.${r.id}`},payload=>{
      stream.querySelector(`[data-chat-message-id="${payload.old.id}"]`)?.remove();
    }).subscribe();
  }

  roomsNode.addEventListener('click',e=>{
    const b=e.target.closest('[data-room-id]');
    if(!b)return;
    const r=rooms.find(x=>String(x.id)===String(b.dataset.roomId));
    if(r)selectRoom(r);
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!room||room._fallback){say('Сначала дождитесь загрузки тем с сервера.',true);return}
    const user=await session();
    if(!user){say('Войдите, чтобы писать в общий чат.',true);if(typeof setAuthMode==='function')setAuthMode('signin');if(typeof openModal==='function')openModal();return}
    const body=field.value.trim();
    if(!body)return;
    field.disabled=true;form.querySelector('button').disabled=true;say('Отправляю…');
    const{error}=await db.from('chat_messages').insert({room_id:room.id,sender_id:user.id,body});
    field.disabled=false;form.querySelector('button').disabled=false;
    if(error){say(error.message||'Не удалось отправить сообщение.',true);field.focus();return}
    field.value='';say('');field.focus();
  });

  stream.addEventListener('click',async e=>{
    const b=e.target.closest('[data-chat-delete]');
    if(!b)return;
    if(!confirm('Удалить это сообщение?'))return;
    const{error}=await db.from('chat_messages').delete().eq('id',b.dataset.chatDelete);
    if(error)say(error.message,true);
  });

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
    #publicChatButton{display:inline-flex!important;align-items:center;gap:7px;min-height:44px;padding:0 14px;border:1px solid rgba(157,92,255,.55);border-radius:999px;background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;font-weight:800;cursor:pointer;white-space:nowrap}
    #publicChatNav{color:#c9a7ff!important;font-weight:800!important}
    #mobilePublicChat{border:0;background:none;color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:44px;min-width:44px}
    #floatingPublicChat{position:fixed;right:18px;bottom:22px;z-index:1200;display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:11px 16px;background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;font:800 13px/1 Inter,system-ui;box-shadow:0 10px 28px rgba(87,26,199,.22);cursor:pointer;opacity:.42;transition:opacity .2s ease,transform .2s ease,box-shadow .2s ease;min-height:44px}
    #floatingPublicChat:hover,#floatingPublicChat:focus-visible{opacity:1;transform:translateY(-2px);box-shadow:0 16px 40px rgba(87,26,199,.42)}
    #floatingPublicChat b{font-size:17px}
    @media(max-width:900px){#publicChatButton{display:none!important}#floatingPublicChat{right:max(12px,env(safe-area-inset-right,0px));bottom:calc(66px + 12px + env(safe-area-inset-bottom,0px));padding:11px 14px;opacity:.55}#floatingPublicChat span{display:none}}
  `;
  document.head.appendChild(visibilityStyle);
  window.ZnakomyPublicChat={open,close};
})();
