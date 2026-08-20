/* ZNAKOMY community features — RU / EN / HE */
(() => {
  const L={
    ru:{
      community:'ZNAKOMY · COMMUNITY',lead:'Реальные публикации участников ZNAKOMY. Никаких вымышленных данных.',create:'+ Создать',publish:'Опубликовать',publishing:'Публикую…',published:'Опубликовано.',load:'Загрузка…',loadErr:'Не удалось загрузить раздел.',empty:'Здесь пока пусто. Можно стать первым участником, который что-то добавит.',signin:'Войдите, чтобы создавать публикации.',priceNone:'Цена не указана',city:'Хайфа',
      groups:{title:'Группы',kicker:'Команды и проекты',fields:[['name','Название группы','text',true],['genres','Жанры через запятую','text',false],['looking_for','Кого ищете','text',false],['description','О группе','textarea',true]]},
      events:{title:'События',kicker:'Джемы, репетиции и концерты',fields:[['title','Название','text',true],['starts_at','Дата и время','datetime-local',true],['venue','Место','text',false],['description','Описание','textarea',false]]},
      ads:{title:'Объявления',kicker:'Ищу музыканта, группу или проект',fields:[['category','Категория','select',true],['title','Заголовок','text',true],['body','Текст объявления','textarea',true]]},
      market:{title:'Маркет',kicker:'Инструменты и аппаратура',fields:[['category','Категория','market-select',true],['title','Название','text',true],['price_ils','Цена, ₪','number',false],['item_condition','Состояние','condition-select',true],['description','Описание','textarea',false]]},
      adCats:[['musician','Ищу музыканта'],['group','Ищу группу'],['jam','Джем'],['project','Проект'],['work','Работа'],['service','Услуги'],['other','Другое']],
      marketCats:[['guitar','Гитары'],['bass','Бас'],['keys','Клавиши'],['drums','Барабаны'],['microphone','Микрофоны'],['amp','Усилители'],['pedal','Педали'],['studio','Студийная техника'],['live','Концертная аппаратура'],['other','Другое']],
      conditions:[['new','Новое'],['like_new','Как новое'],['used','Б/у'],['repair','Требует ремонта']]
    },
    en:{
      community:'ZNAKOMY · COMMUNITY',lead:'Real posts from ZNAKOMY members. No fictional content.',create:'+ Create',publish:'Publish',publishing:'Publishing…',published:'Published.',load:'Loading…',loadErr:'Could not load this section.',empty:'Nothing here yet. You can be the first member to add something.',signin:'Sign in to create posts.',priceNone:'Price not specified',city:'Haifa',
      groups:{title:'Bands',kicker:'Bands and projects',fields:[['name','Band name','text',true],['genres','Genres, comma separated','text',false],['looking_for','Who are you looking for?','text',false],['description','About the band','textarea',true]]},
      events:{title:'Events',kicker:'Jams, rehearsals and shows',fields:[['title','Title','text',true],['starts_at','Date and time','datetime-local',true],['venue','Venue','text',false],['description','Description','textarea',false]]},
      ads:{title:'Ads',kicker:'Find a musician, band or project',fields:[['category','Category','select',true],['title','Headline','text',true],['body','Ad text','textarea',true]]},
      market:{title:'Market',kicker:'Instruments and gear',fields:[['category','Category','market-select',true],['title','Item name','text',true],['price_ils','Price, ₪','number',false],['item_condition','Condition','condition-select',true],['description','Description','textarea',false]]},
      adCats:[['musician','Looking for a musician'],['group','Looking for a band'],['jam','Jam'],['project','Project'],['work','Work'],['service','Services'],['other','Other']],
      marketCats:[['guitar','Guitars'],['bass','Bass'],['keys','Keys'],['drums','Drums'],['microphone','Microphones'],['amp','Amplifiers'],['pedal','Pedals'],['studio','Studio gear'],['live','Live sound gear'],['other','Other']],
      conditions:[['new','New'],['like_new','Like new'],['used','Used'],['repair','Needs repair']]
    },
    he:{
      community:'ZNAKOMY · COMMUNITY',lead:'פרסומים אמיתיים של חברי ZNAKOMY. ללא תוכן פיקטיבי.',create:'+ יצירה',publish:'פרסום',publishing:'מפרסם…',published:'פורסם.',load:'טוען…',loadErr:'לא ניתן לטעון את המדור.',empty:'עדיין אין כאן פרסומים. אפשר להיות הראשונים שמוסיפים משהו.',signin:'יש להתחבר כדי ליצור פרסום.',priceNone:'המחיר לא צוין',city:'חיפה',
      groups:{title:'להקות',kicker:'להקות ופרויקטים',fields:[['name','שם הלהקה','text',true],['genres','סגנונות, מופרדים בפסיקים','text',false],['looking_for','את מי מחפשים?','text',false],['description','על הלהקה','textarea',true]]},
      events:{title:'אירועים',kicker:'ג׳אמים, חזרות והופעות',fields:[['title','כותרת','text',true],['starts_at','תאריך ושעה','datetime-local',true],['venue','מקום','text',false],['description','תיאור','textarea',false]]},
      ads:{title:'מודעות',kicker:'חיפוש מוזיקאי, להקה או פרויקט',fields:[['category','קטגוריה','select',true],['title','כותרת','text',true],['body','טקסט המודעה','textarea',true]]},
      market:{title:'מרקט',kicker:'כלי נגינה וציוד',fields:[['category','קטגוריה','market-select',true],['title','שם הפריט','text',true],['price_ils','מחיר, ₪','number',false],['item_condition','מצב','condition-select',true],['description','תיאור','textarea',false]]},
      adCats:[['musician','מחפש/ת מוזיקאי'],['group','מחפש/ת להקה'],['jam','ג׳אם'],['project','פרויקט'],['work','עבודה'],['service','שירותים'],['other','אחר']],
      marketCats:[['guitar','גיטרות'],['bass','בס'],['keys','קלידים'],['drums','תופים'],['microphone','מיקרופונים'],['amp','מגברים'],['pedal','פדלים'],['studio','ציוד אולפן'],['live','ציוד הגברה'],['other','אחר']],
      conditions:[['new','חדש'],['like_new','כמו חדש'],['used','משומש'],['repair','דורש תיקון']]
    }
  };

  const lang=()=>['ru','en','he'].includes(document.documentElement.lang)?document.documentElement.lang:'ru';
  const t=()=>L[lang()]||L.ru;
  const config=key=>t()[key];

  const shell=document.createElement('section');
  shell.className='community-shell';
  shell.setAttribute('aria-hidden','true');
  shell.innerHTML=`<header class="community-top"><div class="community-brand"><small id="communityBrand">ZNAKOMY · COMMUNITY</small><strong id="communityTitle">Раздел</strong></div><button class="community-close" type="button" aria-label="Close">×</button></header><main class="community-main"><div class="community-hero"><div><small id="communityKicker"></small><h2 id="communityHeading"></h2><p id="communityLead"></p></div><button class="community-create" type="button"></button></div><div class="community-form-wrap"><form class="community-form" id="communityForm"></form></div><div class="community-grid" id="communityGrid"></div></main>`;
  document.body.appendChild(shell);

  let activeKey=null;
  const grid=shell.querySelector('#communityGrid');
  const formWrap=shell.querySelector('.community-form-wrap');
  const form=shell.querySelector('#communityForm');
  const createButton=shell.querySelector('.community-create');
  const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const split=value=>String(value||'').split(',').map(v=>v.trim()).filter(Boolean);
  const options=items=>items.map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join('');
  const dateText=value=>{try{return new Intl.DateTimeFormat(lang()==='he'?'he-IL':lang()==='en'?'en-IL':'ru-RU',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return value||''}};

  function close(){shell.classList.remove('open');shell.setAttribute('aria-hidden','true');document.body.style.overflow='';formWrap.classList.remove('open')}
  shell.querySelector('.community-close').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&shell.classList.contains('open'))close()});

  function fieldHtml([name,label,type,required]){
    const req=required?'required':'';
    const l=t();
    if(type==='textarea')return `<label class="full">${esc(label)}<textarea name="${name}" ${req}></textarea></label>`;
    if(type==='select')return `<label>${esc(label)}<select name="${name}" ${req}>${options(l.adCats)}</select></label>`;
    if(type==='market-select')return `<label>${esc(label)}<select name="${name}" ${req}>${options(l.marketCats)}</select></label>`;
    if(type==='condition-select')return `<label>${esc(label)}<select name="${name}" ${req}>${options(l.conditions)}</select></label>`;
    return `<label>${esc(label)}<input name="${name}" type="${type}" ${type==='number'?'min="0" step="1"':''} ${req}></label>`;
  }

  function buildForm(){
    if(!activeKey)return;
    form.innerHTML=config(activeKey).fields.map(fieldHtml).join('')+`<div class="community-form-actions"><button class="community-submit" type="submit">${esc(t().publish)}</button><span class="community-status" id="communityStatus"></span></div>`;
  }

  function localizeShell(){
    const l=t();
    shell.querySelector('#communityBrand').textContent=l.community;
    shell.querySelector('#communityLead').textContent=l.lead;
    createButton.textContent=l.create;
    if(activeKey){const c=config(activeKey);shell.querySelector('#communityTitle').textContent=c.title;shell.querySelector('#communityHeading').textContent=c.title;shell.querySelector('#communityKicker').textContent=c.kicker;buildForm()}
    shell.dir=lang()==='he'?'rtl':'ltr';
  }

  function render(rows){
    const l=t();
    if(!rows?.length){grid.innerHTML=`<div class="community-empty">${esc(l.empty)}</div>`;return}
    grid.innerHTML=rows.map(row=>{
      if(activeKey==='groups')return `<article class="community-card"><small>${esc(row.city||l.city)}</small><h3>${esc(row.name)}</h3><p>${esc(row.description||'')}</p><footer>${esc([...(row.genres||[]),...(row.looking_for||[])].slice(0,4).join(' · '))}</footer></article>`;
      if(activeKey==='events')return `<article class="community-card"><small>${esc(dateText(row.starts_at))}</small><h3>${esc(row.title)}</h3><p>${esc(row.description||row.venue||'')}</p><footer>${esc(row.venue||row.city||l.city)}</footer></article>`;
      if(activeKey==='ads')return `<article class="community-card"><small>${esc(row.category)}</small><h3>${esc(row.title)}</h3><p>${esc(row.body)}</p><footer>${esc(row.city||l.city)}</footer></article>`;
      return `<article class="community-card"><small>${esc(row.item_condition||'')}</small><h3>${esc(row.title)}</h3><p>${esc(row.description||'')}</p><footer>${row.price_ils!=null?esc(`${Number(row.price_ils)} ₪`):esc(l.priceNone)}</footer></article>`;
    }).join('');
  }

  async function load(){
    if(!activeKey)return;
    const l=t(),c=config(activeKey);
    grid.innerHTML=`<div class="community-empty">${esc(l.load)}</div>`;
    if(typeof db==='undefined'||!db?.from){grid.innerHTML=`<div class="community-empty">${esc(l.loadErr)}</div>`;return}
    let query=db.from(activeKey==='market'?'market_listings':activeKey).select('*');
    if(activeKey==='events')query=query.eq('status','active').gte('starts_at',new Date(Date.now()-86400000).toISOString()).order('starts_at',{ascending:true});
    else if(activeKey==='groups')query=query.eq('is_active',true).order('created_at',{ascending:false});
    else query=query.eq('status','active').order('created_at',{ascending:false});
    const {data,error}=await query.limit(60);
    if(error){console.error('Community load failed',activeKey,error);grid.innerHTML=`<div class="community-empty">${esc(l.loadErr)}</div>`;return}
    render(data);
  }

  async function open(key){
    if(!L.ru[key])return;
    activeKey=key;
    localizeShell();
    formWrap.classList.remove('open');
    shell.classList.add('open');shell.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    await load();
  }

  createButton.addEventListener('click',()=>{
    if(typeof currentUser==='undefined'||!currentUser){
      close();
      if(typeof setAuthMode==='function')setAuthMode('signin');
      if(typeof openModal==='function')openModal();
      const status=document.querySelector('#authStatus');
      if(status&&typeof showMessage==='function')showMessage(status,t().signin);
      return;
    }
    formWrap.classList.toggle('open');
    if(formWrap.classList.contains('open'))form.querySelector('input,select,textarea')?.focus();
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const status=form.querySelector('#communityStatus'),button=form.querySelector('.community-submit'),l=t();
    if(typeof currentUser==='undefined'||!currentUser)return;
    status.textContent=l.publishing;status.classList.remove('error');button.disabled=true;
    const fd=new FormData(form),c=config(activeKey);let payload={owner_id:currentUser.id,city:'Хайфа'};
    for(const [name] of c.fields)payload[name]=fd.get(name);
    if(activeKey==='groups'){payload.genres=split(payload.genres);payload.looking_for=split(payload.looking_for)}
    if(activeKey==='market')payload.price_ils=payload.price_ils?Number(payload.price_ils):null;
    if(activeKey==='events')payload.starts_at=new Date(payload.starts_at).toISOString();
    const table=activeKey==='market'?'market_listings':activeKey;
    const {error}=await db.from(table).insert(payload);
    button.disabled=false;
    if(error){console.error('Community publish failed',activeKey,error);status.textContent=l.loadErr;status.classList.add('error');return}
    status.textContent=l.published;form.reset();formWrap.classList.remove('open');await load();
  });

  const directionCards=[...document.querySelectorAll('#directions .direction-card')];
  [[0,'groups'],[1,'events'],[2,'ads'],[3,'market']].forEach(([index,key])=>{
    const card=directionCards[index];if(!card)return;
    card.setAttribute('role','button');card.setAttribute('tabindex','0');card.dataset.community=key;card.style.cursor='pointer';
    const state=card.querySelector('.feature-state');if(state){state.textContent=lang()==='he'?'פעיל':lang()==='en'?'LIVE':'РАБОТАЕТ';state.classList.add('live')}
    card.addEventListener('click',e=>{e.preventDefault();open(key)});
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(key)}});
  });

  [...document.querySelectorAll('.main-nav a')].forEach((link,index)=>{
    const key=index===2?'groups':index===3?'events':index===4?'ads':index===5?'market':null;
    if(!key)return;
    link.addEventListener('click',e=>{e.preventDefault();open(key)});
  });

  document.addEventListener('znakomy:language',()=>{
    directionCards.slice(0,4).forEach(card=>{const state=card.querySelector('.feature-state');if(state)state.textContent=lang()==='he'?'פעיל':lang()==='en'?'LIVE':'РАБОТАЕТ'});
    if(shell.classList.contains('open')){localizeShell();load()}
  });

  window.ZnakomyCommunity={open,close};
})();
