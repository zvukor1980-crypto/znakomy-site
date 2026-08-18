/* ZNAKOMY repair requests — isolated, non-destructive */
(()=>{
  const copy={
    ru:{kicker:'SERVICE · ХАЙФА',title:'Ремонт техники',intro:'Опишите устройство и неисправность. Заявка сохранится на сайте и попадёт мастеру.',name:'Имя',contact:'Телефон / WhatsApp / Email',category:'Категория',device:'Марка и модель',problem:'Что сломалось?',send:'Отправить заявку',sending:'Отправляю…',ok:'Заявка отправлена. Мы свяжемся с вами по указанному контакту.',err:'Не удалось отправить заявку. Попробуйте ещё раз.',note:'Можно оставить заявку без регистрации. Для срочного обращения: digitalaleksei@gmail.com',cats:['Усилитель / ресивер','Музыкальный центр','DVD / CD / проигрыватель','Магнитофон / кассетная дека','Колонки / акустика','Микшер / студийная техника','Музыкальный инструмент / электроника','Другое'],devicePh:'Например: Yamaha HTR-5730',problemPh:'Опишите симптомы, что уже проверяли, включается ли устройство…'},
    en:{kicker:'SERVICE · HAIFA',title:'Equipment repair',intro:'Describe the device and the fault. Your request will be saved on the site and sent to the technician.',name:'Name',contact:'Phone / WhatsApp / Email',category:'Category',device:'Brand and model',problem:'What is wrong?',send:'Send repair request',sending:'Sending…',ok:'Request sent. We will contact you using the details provided.',err:'Could not send the request. Please try again.',note:'You can submit without registering. Urgent contact: digitalaleksei@gmail.com',cats:['Amplifier / receiver','Music system','DVD / CD / player','Cassette deck / recorder','Speakers / audio','Mixer / studio equipment','Electronic instrument / gear','Other'],devicePh:'Example: Yamaha HTR-5730',problemPh:'Describe the symptoms, what you checked, whether it powers on…'},
    he:{kicker:'שירות · חיפה',title:'תיקון ציוד',intro:'תארו את המכשיר ואת התקלה. הבקשה תישמר באתר ותועבר לטכנאי.',name:'שם',contact:'טלפון / WhatsApp / אימייל',category:'קטגוריה',device:'מותג ודגם',problem:'מה התקלקל?',send:'שליחת בקשת תיקון',sending:'שולח…',ok:'הבקשה נשלחה. נחזור אליכם לפי פרטי הקשר שמסרתם.',err:'לא ניתן היה לשלוח את הבקשה. נסו שוב.',note:'אפשר לשלוח בקשה גם ללא הרשמה. לפנייה דחופה: digitalaleksei@gmail.com',cats:['מגבר / רסיבר','מערכת סטריאו','DVD / CD / נגן','טייפ / קסטות','רמקולים / אודיו','מיקסר / ציוד אולפן','כלי נגינה / אלקטרוניקה','אחר'],devicePh:'לדוגמה: Yamaha HTR-5730',problemPh:'תארו את התסמינים, מה כבר בדקתם והאם המכשיר נדלק…'}
  };
  const lang=()=>['ru','en','he'].includes(document.documentElement.lang)?document.documentElement.lang:'ru';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let modal;
  function build(){
    if(modal)return modal;
    modal=document.createElement('div');modal.className='repair-modal';modal.id='repairModal';modal.setAttribute('aria-hidden','true');
    modal.innerHTML='<div class="repair-backdrop" data-repair-close></div><section class="repair-card-modal" role="dialog" aria-modal="true" aria-labelledby="repairTitle"><button class="repair-close" type="button" data-repair-close aria-label="Close">×</button><span class="repair-kicker"></span><h2 id="repairTitle"></h2><p class="repair-intro"></p><form id="repairForm" class="repair-form"><label><span data-r="name"></span><input name="name" maxlength="120" required autocomplete="name"></label><label><span data-r="contact"></span><input name="contact" maxlength="200" required autocomplete="tel"></label><label><span data-r="category"></span><select name="category" required></select></label><label><span data-r="device"></span><input name="device" maxlength="200"></label><label class="full"><span data-r="problem"></span><textarea name="problem" minlength="10" maxlength="3000" required></textarea></label><p class="repair-contact-note"></p><button class="repair-submit" type="submit"></button><p class="repair-status" id="repairStatus" aria-live="polite"></p></form></section>';
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target.closest('[data-repair-close]'))close()});
    modal.querySelector('#repairForm').addEventListener('submit',submit);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
    return modal;
  }
  function localize(){
    build();const t=copy[lang()]||copy.ru;
    modal.querySelector('.repair-kicker').textContent=t.kicker;modal.querySelector('#repairTitle').textContent=t.title;modal.querySelector('.repair-intro').textContent=t.intro;
    for(const key of ['name','contact','category','device','problem'])modal.querySelector(`[data-r="${key}"]`).textContent=t[key];
    const sel=modal.querySelector('select[name="category"]');const val=sel.value;sel.innerHTML='<option value=""></option>'+t.cats.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if([...sel.options].some(o=>o.value===val))sel.value=val;
    modal.querySelector('input[name="device"]').placeholder=t.devicePh;modal.querySelector('textarea[name="problem"]').placeholder=t.problemPh;modal.querySelector('.repair-submit').textContent=t.send;modal.querySelector('.repair-contact-note').textContent=t.note;
  }
  function open(e){if(e)e.preventDefault();localize();modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>modal.querySelector('input[name="name"]')?.focus(),50)}
  function close(){if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
  async function submit(e){
    e.preventDefault();const form=e.currentTarget,t=copy[lang()]||copy.ru,status=modal.querySelector('#repairStatus'),btn=modal.querySelector('.repair-submit');status.className='repair-status';status.textContent='';btn.disabled=true;btn.textContent=t.sending;
    try{
      if(typeof db==='undefined'||!db?.from)throw new Error('Supabase unavailable');
      const fd=new FormData(form);let userId=null;try{const {data}=await db.auth.getSession();userId=data?.session?.user?.id||null}catch(_){}
      const payload={user_id:userId,name:String(fd.get('name')||'').trim(),contact:String(fd.get('contact')||'').trim(),category:String(fd.get('category')||'').trim(),device:String(fd.get('device')||'').trim()||null,problem:String(fd.get('problem')||'').trim(),language:lang()};
      if(payload.name.length<2||payload.contact.length<3||payload.problem.length<10||!payload.category)throw new Error('validation');
      const {error}=await db.from('repair_requests').insert(payload);if(error)throw error;
      form.reset();status.className='repair-status success';status.textContent=t.ok;
    }catch(err){console.error('Repair request failed',err);status.className='repair-status error';status.textContent=t.err}
    finally{btn.disabled=false;btn.textContent=t.send}
  }
  document.addEventListener('click',e=>{const trigger=e.target.closest('.repair-card,[data-open-repair]');if(trigger)open(e)},true);
  document.addEventListener('znakomy:language',()=>{if(modal?.classList.contains('open'))localize()});
  window.ZnakomyRepair={open,close};
})();
