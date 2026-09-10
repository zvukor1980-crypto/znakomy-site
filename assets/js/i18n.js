/* ZNAKOMY safe i18n — RU / HE / EN. Never removes or restructures DOM. */
(()=>{
  const D={
    ru:{
      nav:['Поиск музыкантов','Музыканты','Группы','Джемы','Объявления','Маркет'],
      login:'Войти',signup:'Регистрация',myProfile:'Моя анкета',profilePending:'Анкета · на проверке',messages:'Сообщения',
      city:'Музыканты Хайфы · 18+',hero:'Найди тех, с кем будешь играть.',heroP:'ZNAKOMY — музыкальное сообщество Хайфы. Находи людей в группу, собирай джемы и начинай новые проекты.',
      heroSlogan:'СВОЙ ЗВУК',logoSub:'МУЗЫКАНТЫ ХАЙФЫ',
      pills:['Музыканты','Группы','Джемы','Direct'],
      find:'Найти музыкантов',findShort:'Найти',create:'Создать анкету',
      searchSmall:'Поиск по реальным анкетам',searchTitle:'Кого ищешь?',instrument:'Инструмент',genre:'Жанр',
      any:'Любой',filterAll:'Все',
      inst:['Гитара','Бас','Барабаны','Вокал','Клавиши'],
      filters:['Все','Вокал','Гитара','Барабаны','Клавиши'],
      peopleSmall:'Сообщество',people:'Музыканты Хайфы',moreSmall:'Больше возможностей',more:'ZNAKOMY растёт вместе с сообществом',moreP:'Анкеты, поиск и Direct уже работают.',
      groups:'Группы',jams:'Джемы и события',ads:'Объявления',market:'Инструменты и аппаратура',
      groupsP:'Страницы коллективов, состав и поиск участников.',jamsP:'Музыкальные встречи, репетиции и концерты.',adsP:'Ищу музыканта, группу, проект, работу и услуги.',marketP:'Локальная музыкальная барахолка.',
      soon:'СКОРО',live:'РАБОТАЕТ',
      repair:'Ремонт аппаратуры',repairP:'Опиши неисправность музыкального или студийного оборудования мастеру.',repairCta:'Оставить заявку →',
      join:'Ты музыкант? Присоединяйся.',joinP:'Здесь тебя поймут.',free:'Создать анкету бесплатно',
      footerNav:['Поиск','Музыканты','Направления','Ремонт','Связаться'],footerMeta:'© 2026 ZNAKOMY · музыканты Хайфы · 18+',
      loadingProfiles:'Загрузка анкет…',loadingNearby:'Ищем музыкантов рядом…',profilesCount:'Анкет: ',noProfiles:'Пока нет опубликованных анкет',noMatch:'Пока нет подходящих анкет.',loadError:'Ошибка загрузки',retryLoad:'Не удалось загрузить анкеты.',retry:'Повторить',
      emptyNoneTitle:'Пока нет опубликованных анкет',emptyNoneBody:'Станьте первым музыкантом Хайфы в ZNAKOMY. Анкета появится здесь после модерации.',emptyMatchTitle:'Никого не нашли по этому запросу',emptyMatchBody:'Попробуйте другой инструмент или жанр — или создайте свою анкету.',emptyCta:'Создать анкету',photoSoon:'Фото появится после загрузки',
      writeMsg:'Написать',lookingFor:'Ищет: ',musician:'Музыкант',cityHaifa:'Хайфа',
      previewKicker:'АНКЕТА МУЗЫКАНТА · ',noBio:'Музыкант пока не добавил описание.',listenSong:'▶ Послушать песню',lookingH:'Ищет',report:'Пожаловаться',
      chatEmpty:'Здесь появятся ваши диалоги.',
      authSignup:'Регистрация нового пользователя',authSignin:'Вход в ZNAKOMY',tabSignup:'Регистрация',tabSignin:'Войти',
      name:'Имя',email:'Email',password:'Пароль',register:'Зарегистрироваться',signin:'Войти',forgot:'Забыли пароль?',resend:'Отправить подтверждение ещё раз',
      yourProfile:'Ваша анкета',logout:'Выйти',birth:'Год рождения',profileCity:'Город',roles:'Инструменты / роль',genres:'Жанры',looking:'Кого или что ищете',song:'Ссылка на вашу песню',about:'О себе',photo:'Фотография',save:'Сохранить',review:'Отправить на проверку',
      startTalk:'Начните разговор',chooseTalk:'Выберите диалог или откройте анкету музыканта.',write:'Напишите сообщение…',
      publicChat:'Общий чат',chat:'Чат',chatWrite:'Напишите сообщение в общий чат…',send:'Отправить',
      home:'Главная',search:'Поиск',profile:'Профиль',form:'Анкета'
    },
    en:{
      nav:['Find musicians','Musicians','Bands','Jams','Ads','Market'],
      login:'Sign in',signup:'Join',myProfile:'My profile',profilePending:'Profile · under review',messages:'Messages',
      city:'Haifa musicians · 18+',hero:'Find the people you want to play with.',heroP:'ZNAKOMY is Haifa’s music community. Find bandmates, organize jams and start new projects.',
      heroSlogan:'YOUR SOUND',logoSub:'HAIFA MUSICIANS',
      pills:['Musicians','Bands','Jams','Direct'],
      find:'Find musicians',findShort:'Search',create:'Create profile',
      searchSmall:'Search real profiles',searchTitle:'Who are you looking for?',instrument:'Instrument',genre:'Genre',
      any:'Any',filterAll:'All',
      inst:['Guitar','Bass','Drums','Vocals','Keys'],
      filters:['All','Vocals','Guitar','Drums','Keys'],
      peopleSmall:'Community',people:'Musicians in Haifa',moreSmall:'More possibilities',more:'ZNAKOMY grows with the community',moreP:'Profiles, search and Direct are already live.',
      groups:'Bands',jams:'Jams & events',ads:'Ads',market:'Gear marketplace',
      groupsP:'Band pages, lineups and member search.',jamsP:'Music meetups, rehearsals and shows.',adsP:'Looking for a musician, band, project, gig or service.',marketP:'Local music gear marketplace.',
      soon:'SOON',live:'LIVE',
      repair:'Gear repair',repairP:'Describe the issue with your music or studio gear to a technician.',repairCta:'Send a request →',
      join:'Are you a musician? Join us.',joinP:'Meet people who speak your musical language.',free:'Create a free profile',
      footerNav:['Search','Musicians','Directions','Repair','Contact'],footerMeta:'© 2026 ZNAKOMY · Haifa musicians · 18+',
      loadingProfiles:'Loading profiles…',loadingNearby:'Finding musicians nearby…',profilesCount:'Profiles: ',noProfiles:'No published profiles yet',noMatch:'No matching profiles yet.',loadError:'Load error',retryLoad:'Could not load profiles.',retry:'Retry',
      emptyNoneTitle:'No published profiles yet',emptyNoneBody:'Be the first Haifa musician on ZNAKOMY. Your profile will appear here after review.',emptyMatchTitle:'No one matches this search',emptyMatchBody:'Try another instrument or genre — or create your own profile.',emptyCta:'Create profile',photoSoon:'Photo will appear once uploaded',
      writeMsg:'Message',lookingFor:'Looking for: ',musician:'Musician',cityHaifa:'Haifa',
      previewKicker:'MUSICIAN PROFILE · ',noBio:'This musician has not added a bio yet.',listenSong:'▶ Listen to a song',lookingH:'Looking for',report:'Report',
      chatEmpty:'Your conversations will appear here.',
      authSignup:'Create a new account',authSignin:'Sign in to ZNAKOMY',tabSignup:'Sign up',tabSignin:'Sign in',
      name:'Name',email:'Email',password:'Password',register:'Create account',signin:'Sign in',forgot:'Forgot your password?',resend:'Resend confirmation email',
      yourProfile:'Your profile',logout:'Sign out',birth:'Year of birth',profileCity:'City',roles:'Instruments / role',genres:'Genres',looking:'Who or what are you looking for?',song:'Link to your song',about:'About you',photo:'Profile photo',save:'Save',review:'Submit for review',
      startTalk:'Start a conversation',chooseTalk:'Choose a conversation or open a musician profile.',write:'Write a message…',
      publicChat:'Community chat',chat:'Chat',chatWrite:'Write a message to the community…',send:'Send',
      home:'Home',search:'Search',profile:'Profile',form:'Profile'
    },
    he:{
      nav:['חיפוש מוזיקאים','מוזיקאים','להקות','ג׳אמים','מודעות','מרקט'],
      login:'כניסה',signup:'הרשמה',myProfile:'הפרופיל שלי',profilePending:'פרופיל · בבדיקה',messages:'הודעות',
      city:'מוזיקאים בחיפה · 18+',hero:'מצאו את האנשים שאיתם תרצו לנגן.',heroP:'ZNAKOMY היא קהילת המוזיקה של חיפה. מצאו שותפים ללהקה, ארגנו ג׳אמים והתחילו פרויקטים חדשים.',
      heroSlogan:'הצליל שלך',logoSub:'מוזיקאים בחיפה',
      pills:['מוזיקאים','להקות','ג׳אמים','Direct'],
      find:'חיפוש מוזיקאים',findShort:'חיפוש',create:'יצירת פרופיל',
      searchSmall:'חיפוש בפרופילים אמיתיים',searchTitle:'את מי מחפשים?',instrument:'כלי נגינה',genre:'סגנון',
      any:'הכל',filterAll:'הכל',
      inst:['גיטרה','בס','תופים','שירה','קלידים'],
      filters:['הכל','שירה','גיטרה','תופים','קלידים'],
      peopleSmall:'קהילה',people:'מוזיקאים בחיפה',moreSmall:'עוד אפשרויות',more:'ZNAKOMY צומחת יחד עם הקהילה',moreP:'פרופילים, חיפוש ו־Direct כבר פעילים.',
      groups:'להקות',jams:'ג׳אמים ואירועים',ads:'מודעות',market:'כלי נגינה וציוד',
      groupsP:'עמודי להקות, הרכב וחיפוש חברים.',jamsP:'מפגשי מוזיקה, חזרות והופעות.',adsP:'מחפשים מוזיקאי, להקה, פרויקט, עבודה או שירות.',marketP:'שוק ציוד מוזיקלי מקומי.',
      soon:'בקרוב',live:'פעיל',
      repair:'תיקון ציוד',repairP:'תארו את התקלה בציוד המוזיקה או האולפן לטכנאי.',repairCta:'שליחת בקשה →',
      join:'אתם מוזיקאים? הצטרפו.',joinP:'כאן תמצאו אנשים שמבינים מוזיקה.',free:'יצירת פרופיל בחינם',
      footerNav:['חיפוש','מוזיקאים','כיוונים','תיקון','יצירת קשר'],footerMeta:'© 2026 ZNAKOMY · מוזיקאים בחיפה · 18+',
      loadingProfiles:'טוען פרופילים…',loadingNearby:'מחפשים מוזיקאים בקרבת מקום…',profilesCount:'פרופילים: ',noProfiles:'עדיין אין פרופילים מפורסמים',noMatch:'אין פרופילים מתאימים.',loadError:'שגיאת טעינה',retryLoad:'לא ניתן לטעון פרופילים.',retry:'נסה שוב',
      emptyNoneTitle:'עדיין אין פרופילים מפורסמים',emptyNoneBody:'היו המוזיקאים הראשונים מחיפה ב־ZNAKOMY. הפרופיל יופיע כאן אחרי בדיקה.',emptyMatchTitle:'לא נמצאו התאמות לחיפוש',emptyMatchBody:'נסו כלי או סגנון אחר — או צרו פרופיל משלכם.',emptyCta:'יצירת פרופיל',photoSoon:'התמונה תופיע אחרי ההעלאה',
      writeMsg:'הודעה',lookingFor:'מחפש/ת: ',musician:'מוזיקאי',cityHaifa:'חיפה',
      previewKicker:'פרופיל מוזיקאי · ',noBio:'המוזיקאי עדיין לא הוסיף תיאור.',listenSong:'▶ האזנה לשיר',lookingH:'מחפש/ת',report:'דיווח',
      chatEmpty:'השיחות שלכם יופיעו כאן.',
      authSignup:'יצירת חשבון חדש',authSignin:'כניסה ל־ZNAKOMY',tabSignup:'הרשמה',tabSignin:'כניסה',
      name:'שם',email:'אימייל',password:'סיסמה',register:'הרשמה',signin:'כניסה',forgot:'שכחתם סיסמה?',resend:'שליחת אימייל אישור מחדש',
      yourProfile:'הפרופיל שלכם',logout:'יציאה',birth:'שנת לידה',profileCity:'עיר',roles:'כלי נגינה / תפקיד',genres:'סגנונות',looking:'את מי או מה אתם מחפשים?',song:'קישור לשיר שלכם',about:'על עצמכם',photo:'תמונת פרופיל',save:'שמירה',review:'שליחה לבדיקה',
      startTalk:'התחילו שיחה',chooseTalk:'בחרו שיחה או פתחו פרופיל של מוזיקאי.',write:'כתבו הודעה…',
      publicChat:'צ׳אט קהילתי',chat:'צ׳אט',chatWrite:'כתבו הודעה בצ׳אט הקהילתי…',send:'שליחה',
      home:'ראשי',search:'חיפוש',profile:'פרופיל',form:'פרופיל'
    }
  };
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const set=(s,v,r=document)=>{const e=q(s,r);if(e)e.textContent=v};
  const setLabel=(s,v)=>{const e=q(s);if(!e)return;const n=[...e.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim());if(n)n.nodeValue=v;};
  let lang=localStorage.getItem('znakomy-lang'); if(!D[lang])lang='ru';

  function accountLabel(t){
    const btn=q('.header-button'); if(!btn)return;
    const signedIn=typeof currentUser!=='undefined'&&currentUser;
    if(!signedIn){btn.textContent=t.signup;return}
    const st=typeof currentProfile!=='undefined'?currentProfile?.status:null;
    btn.textContent=st==='pending'?t.profilePending:t.myProfile;
  }
  function authLabels(t){
    const mode=typeof authMode!=='undefined'&&authMode==='signin'?'signin':'signup';
    set('#authTitle',mode==='signin'?t.authSignin:t.authSignup);
    set('#authSubmit',mode==='signin'?t.signin:t.register);
  }
  function setCssChrome(t){
    const root=document.documentElement;
    root.style.setProperty('--hero-slogan', JSON.stringify(t.heroSlogan));
    root.style.setProperty('--logo-sub', JSON.stringify(t.logoSub));
  }
  function translateSelects(t){
    const inst=q('select[name="instrument"]');
    if(inst){
      const opts=[...inst.options];
      if(opts[0])opts[0].textContent=t.any;
      t.inst.forEach((label,i)=>{if(opts[i+1])opts[i+1].textContent=label});
    }
    const genre=q('select[name="genre"]');
    if(genre&&genre.options[0])genre.options[0].textContent=t.any;
  }
  function translateFilters(t){
    qa('.filter-button').forEach((b,i)=>{if(t.filters[i])b.textContent=t.filters[i]});
  }
  function translateDirections(t){
    const cards=qa('.platform-directions .direction-card');
    const titles=[t.groups,t.jams,t.ads,t.market,t.repair];
    const paras=[t.groupsP,t.jamsP,t.adsP,t.marketP,t.repairP];
    cards.forEach((card,i)=>{
      const h=card.querySelector('h3'); if(h&&titles[i])h.textContent=titles[i];
      const p=card.querySelector('p'); if(p&&paras[i])p.textContent=paras[i];
      const state=card.querySelector('.feature-state');
      if(state)state.textContent=state.classList.contains('live')?t.live:t.soon;
    });
    const cta=q('.repair-card b'); if(cta)cta.textContent=t.repairCta;
  }
  function translateStatic(t){
    qa('.main-nav a:not(#publicChatNav)').slice(0,6).forEach((e,i)=>{if(t.nav[i])e.textContent=t.nav[i]});
    set('.header-login',t.login);accountLabel(t);set('.hero-city',t.city);set('.platform-hero-copy h1',t.hero);set('.platform-hero-copy p',t.heroP);
    qa('.hero-pills span').forEach((e,i)=>{if(t.pills[i])e.textContent=t.pills[i]});
    const ha=qa('.platform-hero-actions a');if(ha[0])ha[0].textContent='⌕\u00a0 '+t.find;if(ha[1])ha[1].textContent=t.create;
    set('.search-title small',t.searchSmall);set('.search-title h2',t.searchTitle);
    const labs=qa('.search-controls label>span');if(labs[0])labs[0].textContent=t.instrument;if(labs[1])labs[1].textContent=t.genre;
    const searchBtn=q('.search-controls button');if(searchBtn)searchBtn.textContent='⌕\u00a0 '+t.findShort;
    translateSelects(t);translateFilters(t);
    set('.people-heading small',t.peopleSmall);set('.people-heading h2',t.people);set('.people-heading a',t.create+' →');
    set('.direction-intro small',t.moreSmall);set('.direction-intro h2',t.more);set('.direction-intro p',t.moreP);
    translateDirections(t);
    set('.platform-cta h2',t.join);set('.platform-cta p',t.joinP);set('.platform-cta button',t.free);
    qa('.footer-links a').forEach((a,i)=>{if(t.footerNav[i])a.textContent=t.footerNav[i]});
    set('.footer-meta',t.footerMeta);
    set('#chatTitle',t.messages);set('#chatWelcome h3',t.startTalk);set('#chatWelcome p',t.chooseTalk);set('.chat-empty',t.chatEmpty);
    const mf=q('#messageForm textarea');if(mf)mf.placeholder=t.write;
    const msg=q('#openMessages');if(msg){const badge=q('#unreadBadge');if(msg.firstChild)msg.firstChild.nodeValue=t.messages+' ';if(badge&&!msg.contains(badge))msg.appendChild(badge)}
    set('[data-auth-mode="signup"]',t.tabSignup);set('[data-auth-mode="signin"]',t.tabSignin);authLabels(t);set('#resetPassword',t.forgot);set('#resendConfirmation',t.resend);set('#profileView .profile-heading h2',t.yourProfile);set('#logoutButton',t.logout);
    setLabel('#nameField',t.name);setLabel('#authForm label:nth-of-type(2)',t.email);setLabel('#authForm label:nth-of-type(3)',t.password);
    const pl=qa('#profileForm label');[t.name,t.birth,t.profileCity,t.roles,t.genres,t.looking,t.song,t.about,t.photo].forEach((v,i)=>{const e=pl[i];if(!e)return;const n=[...e.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim());if(n)n.nodeValue=v});
    const dock=qa('.mobile-dock small');[t.home,t.search,t.form,'Direct',t.profile].forEach((v,i)=>{if(dock[i])dock[i].textContent=v});
    const empty=q('.empty-state[data-empty]');
    if(empty&&!q('.member-card')){
      const kind=empty.getAttribute('data-empty')||'none';
      const h=q('h3',empty),p=q('p',empty),cta=q('.empty-cta',empty);
      if(h)h.textContent=kind==='match'?t.emptyMatchTitle:t.emptyNoneTitle;
      if(p)p.textContent=kind==='match'?t.emptyMatchBody:t.emptyNoneBody;
      if(cta)cta.textContent=t.emptyCta;
    }else{
      const loading=q('.profile-loading');
      if(loading&&!q('.member-card')){
        const txt=loading.textContent||'';
        if(/Загрузка|Loading|טוען/.test(txt))loading.textContent=t.loadingProfiles;
        else if(/Ищем|Finding|מחפשים/.test(txt))loading.textContent=t.loadingNearby;
        else if(/Пока нет опубликован|No published|עדיין אין/.test(txt))loading.textContent=t.noProfiles;
        else if(/Пока нет подходящих|No matching|אין פרופילים מתאימים/.test(txt))loading.textContent=t.noMatch;
      }
    }
    qa('.avatar-placeholder small').forEach(s=>{s.textContent=t.photoSoon});
    qa('.avatar-placeholder[aria-label]').forEach(el=>el.setAttribute('aria-label',t.photoSoon));
    const count=q('#memberCount');
    if(count){
      const n=(typeof loadedProfiles!=='undefined'&&loadedProfiles?.size)||0;
      if(n)count.textContent=t.profilesCount+n;
      else if(/Загрузка|Loading|טוען/.test(count.textContent||''))count.textContent=t.loadingProfiles;
      else if(/Пока нет|No published|עדיין אין/.test(count.textContent||''))count.textContent=t.noProfiles;
      else if(/Ошибка|Load error|שגיאת/.test(count.textContent||''))count.textContent=t.loadError;
    }
    qa('.start-chat').forEach(b=>b.textContent=t.writeMsg);
    qa('.member-card .card-caption em').forEach(em=>{
      const rest=em.textContent.replace(/^[^:]+:\s*/,'');
      em.textContent=t.lookingFor+rest;
    });
  }
  function translateChat(t){
    set('#publicChatButton span',t.publicChat);set('#publicChatNav',t.publicChat);set('#floatingPublicChat span',t.publicChat);set('#mobilePublicChat small',t.chat);
    const em=q('#publicChatEmergency');if(em)em.textContent='💬 '+t.publicChat;
    const pc=q('.public-chat-shell');
    if(pc){
      set('header h2',t.publicChat,pc);
      set('#publicChatTopicTitle',t.publicChat,pc);
      const f=q('#publicChatForm textarea',pc);if(f)f.placeholder=t.chatWrite;
      const b=q('#publicChatForm button',pc);if(b)b.textContent=t.send;
    }
  }
  function apply(next){
    if(!D[next])return;
    lang=next;
    localStorage.setItem('znakomy-lang',lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='he'?'rtl':'ltr';
    document.body.classList.toggle('rtl-ui',lang==='he');
    const t=D[lang];
    setCssChrome(t);
    translateStatic(t);
    translateChat(t);
    qa('#languageSwitch [data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    document.dispatchEvent(new CustomEvent('znakomy:language',{detail:{lang}}));
  }
  function mount(){
    let box=q('#languageSwitch');
    if(!box){
      box=document.createElement('div');box.id='languageSwitch';box.className='language-switch';
      box.innerHTML='<button type="button" data-lang="ru">RU</button><button type="button" data-lang="he">עברית</button><button type="button" data-lang="en">EN</button>';
      q('.header-actions')?.prepend(box);
      box.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(b)apply(b.dataset.lang)});
    }
    apply(lang);
    document.addEventListener('click',e=>{if(e.target.closest('#publicChatButton,#publicChatNav,#floatingPublicChat,#mobilePublicChat,#publicChatEmergency'))setTimeout(()=>translateChat(D[lang]),80)},true);
    document.addEventListener('click',e=>{if(e.target.closest('[data-auth-mode],[data-open-auth],a[href="#auth"]'))setTimeout(()=>authLabels(D[lang]),0)},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  window.ZnakomyI18n={apply,get lang(){return lang},t:(k)=>D[lang]?.[k],dict:()=>D[lang]};
})();
