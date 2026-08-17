/* ZNAKOMY Direct 2.0 — standalone reliable messenger */
(() => {
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const drawer=$('#chatDrawer'), list=$('#conversationList'), welcome=$('#chatWelcome'), active=$('#activeChat'), person=$('#activeChatPerson'), stream=$('#messageStream'), form=$('#messageForm'), field=$("#messageForm textarea[name='message']"), status=$('#chatStatus');
  if(!drawer||!list||!active||!form||!field)return;

  let me=null, conversationId=null, partner=null, channel=null;

  const openDrawer=()=>{drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('chat-open')};
  const closeDrawer=()=>{drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('chat-open')};
  const say=(text='',error=false)=>{if(!status)return;status.textContent=text;status.classList.toggle('error',error)};
  async function session(){const{data}=await db.auth.getSession();me=data?.session?.user||null;return me}
  function signin(text='Войдите, чтобы пользоваться Direct.'){
    try{setAuthMode('signin');openModal()}catch(_){$('#authModal')?.classList.add('open')}
    const s=$('#authStatus');if(s)s.textContent=text;
  }
  function photo(path){if(!path)return'';try{return db.storage.from('profile-photos').getPublicUrl(path).data.publicUrl||''}catch(_){return''}}
  function showComposer(p){partner=p||partner||{display_name:'Музыкант'};if(welcome)welcome.hidden=true;active.hidden=false;person.innerHTML=`<strong>${esc(partner.display_name||'Музыкант')}</strong><small>личный диалог · только для вас двоих</small>`;field.disabled=false;form.querySelector('button')?.removeAttribute('disabled');setTimeout(()=>field.focus(),40)}
  function resetComposer(){conversationId=null;partner=null;active.hidden=true;if(welcome)welcome.hidden=false;if(stream)stream.innerHTML='';say('')}
  function messageHTML(m){const own=m.sender_id===me?.id;let time='';try{time=new Intl.DateTimeFormat('ru',{hour:'2-digit',minute:'2-digit'}).format(new Date(m.created_at))}catch(_){}return `<div class="message-bubble ${own?'own':'incoming'}" data-direct-message="${m.id}"><p>${esc(m.body)}</p><small>${esc(time)}</small></div>`}
  function renderMessages(rows){stream.innerHTML=rows?.length?rows.map(messageHTML).join(''):'<p class="dialog-start">Диалог начинается здесь. Напишите первое сообщение.</p>';stream.scrollTop=stream.scrollHeight}
  function append(m){stream.querySelector('.dialog-start')?.remove();if(stream.querySelector(`[data-direct-message="${m.id}"]`))return;stream.insertAdjacentHTML('beforeend',messageHTML(m));stream.scrollTop=stream.scrollHeight}

  async function openConversation(id,p){
    if(!await session())return signin();
    conversationId=id;partner=p||{display_name:'Музыкант'};showComposer(partner);say('Загружаю переписку…');
    $$('.conversation-item',list).forEach(x=>x.classList.toggle('active',x.dataset.conversationId===String(id)));
    const{data,error}=await db.from('messages').select('id,sender_id,body,created_at,read_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(300);
    if(error){say(error.message||'Не удалось загрузить сообщения.',true);return}
    renderMessages(data||[]);say('');
    try{await db.rpc('mark_conversation_read',{target_conversation_id:id})}catch(_){}
    if(channel)try{await db.removeChannel(channel)}catch(_){}
    channel=db.channel(`direct2:${id}:${Date.now()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${id}`},payload=>{append(payload.new);if(payload.new.sender_id!==me.id)db.rpc('mark_conversation_read',{target_conversation_id:id})}).subscribe();
    field.focus();
  }

  async function loadList(autoOpenId=null,autoPartner=null){
    if(!await session())return signin();
    openDrawer();list.innerHTML='<p class="chat-empty">Загружаю диалоги…</p>';
    const{data:rows,error}=await db.from('conversations').select('id,user_a,user_b,last_message_at').order('last_message_at',{ascending:false});
    if(error){list.innerHTML=`<p class="chat-empty">${esc(error.message||'Не удалось загрузить диалоги.')}</p>`;return}
    if(!rows?.length){list.innerHTML='<p class="chat-empty">Пока нет диалогов.<br>Нажмите «Написать» на карточке музыканта.</p>';resetComposer();return}
    const ids=[...new Set(rows.map(r=>r.user_a===me.id?r.user_b:r.user_a))];
    const{data:profiles}=await db.from('profiles').select('id,display_name,avatar_path,instruments').in('id',ids);
    const map=new Map((profiles||[]).map(p=>[p.id,p]));
    list.innerHTML=rows.map(r=>{const pid=r.user_a===me.id?r.user_b:r.user_a,p=map.get(pid)||{id:pid,display_name:'Музыкант'},img=photo(p.avatar_path);return `<button class="conversation-item" type="button" data-direct2="1" data-conversation-id="${r.id}" data-partner-id="${pid}" data-partner-name="${esc(p.display_name||'Музыкант')}">${img?`<img src="${esc(img)}" alt="">`:'<span class="conversation-avatar">♪</span>'}<span><strong>${esc(p.display_name||'Музыкант')}</strong><small>${esc((p.instruments||[]).slice(0,2).join(' · ')||'Открыть диалог')}</small></span></button>`}).join('');
    if(autoOpenId)await openConversation(autoOpenId,autoPartner||map.get(autoPartner?.id));
  }

  async function startFor(id,name){
    if(!await session())return signin('Войдите, чтобы написать музыканту.');
    if(id===me.id){openDrawer();say('Это ваша анкета — написать самому себе нельзя.',true);return}
    openDrawer();say('Открываю диалог…');
    const{data,error}=await db.rpc('start_conversation',{target_id:id});
    if(error){say(error.message||'Не удалось начать диалог.',true);return}
    await loadList(data,{id,display_name:name||'Музыкант'});
  }

  document.addEventListener('click',async e=>{
    const close=e.target.closest('[data-close-chat]');if(close){e.preventDefault();e.stopImmediatePropagation();closeDrawer();return}
    const top=e.target.closest('#openMessages,#mobileMessages');if(top){e.preventDefault();e.stopImmediatePropagation();if(!await session())return signin();resetComposer();await loadList();return}
    const conv=e.target.closest('.conversation-item[data-direct2="1"]');if(conv){e.preventDefault();e.stopImmediatePropagation();await openConversation(conv.dataset.conversationId,{id:conv.dataset.partnerId,display_name:conv.dataset.partnerName||conv.querySelector('strong')?.textContent||'Музыкант'});return}
    const write=e.target.closest('.start-chat,[data-preview-chat]');if(!write)return;e.preventDefault();e.stopImmediatePropagation();
    let card=write.closest('.member-card'),id=card?.dataset.profileId,name=card?.dataset.profileName;
    if(!id){const n=$('#previewName')?.textContent?.trim();card=$$('.member-card').find(x=>x.dataset.profileName===n);id=card?.dataset.profileId;name=card?.dataset.profileName||n}
    if(!id){openDrawer();say('Не удалось определить получателя. Нажмите «Написать» на карточке музыканта.',true);return}
    try{closeProfilePreview()}catch(_){$('#profilePreview')?.classList.remove('open')}
    await startFor(id,name);
  },true);

  form.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!await session())return signin();
    if(!conversationId){say('Сначала выберите человека слева.',true);return}
    const body=field.value.trim();if(!body)return;
    field.disabled=true;const btn=form.querySelector('button');if(btn)btn.disabled=true;say('Отправляю…');
    const{data,error}=await db.from('messages').insert({conversation_id:conversationId,sender_id:me.id,body}).select().single();
    field.disabled=false;if(btn)btn.disabled=false;
    if(error){say(error.message||'Не удалось отправить сообщение.',true);field.focus();return}
    field.value='';append(data);say('');field.focus();
  },true);

  field.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});

  const style=document.createElement('style');style.textContent=`
  #chatDrawer{position:fixed;inset:0;z-index:3000;visibility:hidden;pointer-events:none}#chatDrawer.open{visibility:visible!important;pointer-events:auto!important;display:block!important}
  #chatDrawer .chat-panel{position:absolute!important;right:12px!important;top:12px!important;bottom:12px!important;z-index:2!important;transform:translateX(105%);transition:transform .2s ease}#chatDrawer.open .chat-panel{transform:none!important}
  #chatDrawer .chat-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72)}
  #activeChat:not([hidden]){display:grid!important;grid-template-rows:auto minmax(0,1fr) auto auto!important;height:100%!important;min-height:0!important}
  #messageForm{display:grid!important;grid-template-columns:minmax(0,1fr) 46px!important;visibility:visible!important;opacity:1!important;min-height:64px!important}#messageForm textarea{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;min-height:46px!important;color:#fff!important}
  .conversation-item[data-direct2="1"]{pointer-events:auto!important;position:relative!important;z-index:2!important}.conversation-item[data-direct2="1"]:active{transform:scale(.99)}
  #messageArea{min-height:0!important;overflow:hidden!important}
  @media(max-width:560px){#chatDrawer .chat-panel{inset:0!important;width:100%!important}.chat-layout{display:grid!important;grid-template-rows:auto minmax(0,1fr)!important}.conversation-list{max-height:170px!important}.message-area{min-height:360px!important}#activeChat:not([hidden]){min-height:360px!important}}
  `;document.head.appendChild(style);
})();
