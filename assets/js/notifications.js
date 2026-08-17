/* ZNAKOMY message notifications — realtime badge + toast + tab title */
(() => {
  const badge=document.querySelector('#unreadBadge');
  const messagesButton=document.querySelector('#openMessages');
  const baseTitle=document.title.replace(/^\(\d+\)\s*/,'');
  let me=null, channel=null, unread=0, profileCache=new Map();

  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function setCount(n){
    unread=Math.max(0,Number(n)||0);
    if(badge){badge.textContent=unread>99?'99+':String(unread);badge.hidden=!unread;badge.setAttribute('aria-label',unread?`Непрочитанных сообщений: ${unread}`:'Нет новых сообщений');}
    if(messagesButton)messagesButton.classList.toggle('has-unread',unread>0);
    document.title=unread?`(${unread}) ${baseTitle}`:baseTitle;
  }
  async function refresh(){
    if(!me)return setCount(0);
    const {count,error}=await db.from('messages').select('id',{count:'exact',head:true}).neq('sender_id',me.id).is('read_at',null);
    if(!error)setCount(count||0);
  }
  async function senderName(id){
    if(profileCache.has(id))return profileCache.get(id);
    const {data}=await db.from('profiles').select('display_name').eq('id',id).maybeSingle();
    const name=data?.display_name||'Музыкант';profileCache.set(id,name);return name;
  }
  function toast(name,body){
    let host=document.querySelector('#znakomyNotifications');
    if(!host){host=document.createElement('div');host.id='znakomyNotifications';host.className='notification-stack';document.body.appendChild(host);}
    const item=document.createElement('button');item.type='button';item.className='message-toast';
    item.innerHTML=`<span class="message-toast-icon">✉</span><span><small>Новое сообщение</small><strong>${esc(name)}</strong><em>${esc(body.length>110?body.slice(0,107)+'…':body)}</em></span>`;
    item.addEventListener('click',()=>{document.querySelector('#openMessages')?.click();item.remove();});
    host.appendChild(item);requestAnimationFrame(()=>item.classList.add('show'));
    setTimeout(()=>{item.classList.remove('show');setTimeout(()=>item.remove(),250)},7000);
  }
  async function incoming(message){
    if(!me||message.sender_id===me.id)return;
    await refresh();
    const name=await senderName(message.sender_id);
    toast(name,message.body||'Новое сообщение');
    if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){
      try{new Notification(`ZNAKOMY · ${name}`,{body:message.body||'Новое сообщение',tag:`znakomy-${message.conversation_id}`,renotify:true});}catch(_){}
    }
  }
  async function subscribe(user){
    me=user||null;
    if(channel){try{await db.removeChannel(channel)}catch(_){}channel=null;}
    if(!me){setCount(0);return;}
    await refresh();
    channel=db.channel(`notifications:${me.id}:${Date.now()}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},p=>incoming(p.new))
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages'},()=>refresh())
      .subscribe();
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  document.addEventListener('click',e=>{if(e.target.closest('#openMessages,#mobileMessages,.conversation-item'))setTimeout(refresh,500)});
  db.auth.onAuthStateChange((_event,session)=>setTimeout(()=>subscribe(session?.user||null),80));
  db.auth.getSession().then(({data})=>subscribe(data.session?.user||null));

  const style=document.createElement('style');style.textContent=`
    #openMessages{position:relative}.messages-button.has-unread{box-shadow:0 0 0 1px rgba(168,85,247,.55),0 0 20px rgba(139,92,246,.28)}
    #unreadBadge:not([hidden]){display:inline-grid!important;place-items:center;min-width:20px;height:20px;padding:0 5px;margin-left:6px;border-radius:999px;background:#ef4444;color:#fff;font-size:11px;font-weight:800;line-height:1;box-shadow:0 0 0 2px #0b0908,0 4px 12px rgba(239,68,68,.35)}
    .notification-stack{position:fixed;z-index:10000;right:18px;top:78px;display:grid;gap:10px;width:min(370px,calc(100vw - 24px));pointer-events:none}
    .message-toast{pointer-events:auto;display:grid;grid-template-columns:42px 1fr;gap:12px;align-items:center;width:100%;border:1px solid rgba(168,85,247,.42);border-radius:16px;padding:13px 15px;background:rgba(16,13,22,.96);color:#fff;text-align:left;box-shadow:0 18px 55px rgba(0,0,0,.42),0 0 28px rgba(139,92,246,.18);backdrop-filter:blur(18px);transform:translateY(-12px);opacity:0;transition:.22s ease}
    .message-toast.show{transform:none;opacity:1}.message-toast-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#7c3aed,#a855f7);font-size:19px}
    .message-toast span:last-child{display:grid;min-width:0}.message-toast small{font-size:10px;text-transform:uppercase;letter-spacing:.11em;color:#c4b5fd}.message-toast strong{font-size:14px;margin-top:2px}.message-toast em{font-style:normal;font-size:13px;color:#d1d5db;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}
    @media(max-width:560px){.notification-stack{right:12px;top:12px}.message-toast{border-radius:14px}}
  `;document.head.appendChild(style);
  window.ZnakomyNotifications={refresh};
})();
