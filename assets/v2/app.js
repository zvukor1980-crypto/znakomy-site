(() => {
  const SUPABASE_URL = 'https://kfxhmjbdyovododkndpu.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_iZakAF0HwDNE774ZX939fg_P5mtH8GC';
  const ADMIN_EMAILS = ['digitalaleksei@gmail.com', 'zvukor1980@gmail.com'];
  const MAIL = 'digitalaleksei@gmail.com';
  const FORM_ENDPOINT = `https://formsubmit.co/ajax/${MAIL}`;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const splitList = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
  const escapeHtml = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const yearNow = new Date().getFullYear();

  let db = null;
  let currentUser = null;
  let currentProfile = null;
  let authMode = 'signup';
  let loadedProfiles = new Map();
  let allApproved = [];
  let loadToken = 0;

  const INTEREST_ALIASES = {
    'Прогулки': ['прогулки', 'walk', 'прогулка'],
    'Кофе': ['кофе', 'coffee', 'cafe'],
    'Спорт': ['спорт', 'sport', 'фитнес', 'зал'],
    'Музыка': ['музыка', 'music', 'концерт'],
    'Кино': ['кино', 'film', 'movie'],
    'Путешествия': ['путешествия', 'travel', 'поездки'],
    'Гитара': ['гитара', 'guitar'],
    'Бас': ['бас', 'bass'],
    'Барабаны': ['барабаны', 'drums'],
    'Вокал': ['вокал', 'vocal'],
    'Клавиши': ['клавиши', 'keys', 'piano']
  };
  const MOOD_ALIASES = {
    'Серьёзные отношения': ['серьёзные', 'отношения', 'relationship'],
    'Дружба': ['дружба', 'friend'],
    'Общение': ['общение', 'chat', 'talk'],
    'Свидания': ['свидания', 'date']
  };
  const statusNames = {
    draft: 'Черновик', pending: 'На проверке', approved: 'Опубликована',
    rejected: 'Нужны исправления', suspended: 'Приостановлена'
  };
  const norm = (v) => String(v || '').trim().toLowerCase();

  /* Splash */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const splash = $('#splash');
      if (!splash) return;
      splash.classList.add('hide');
      splash.setAttribute('aria-hidden', 'true');
      setTimeout(() => splash.remove(), 700);
    }, 1600);
  });

  /* UI helpers */
  function say(el, msg, err) {
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('error', !!err);
    el.classList.toggle('success', !err && !!msg);
  }
  function openModal(id) {
    const m = $(id);
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeModal(id) {
    const m = $(id);
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    if (!$('.modal.open')) document.body.classList.remove('modal-open');
  }
  function setAuthMode(mode) {
    authMode = mode === 'signin' ? 'signin' : 'signup';
    $$('[data-auth-mode].tab').forEach((b) => b.classList.toggle('active', b.dataset.authMode === authMode));
    $('#authTitle').textContent = authMode === 'signup' ? 'Регистрация' : 'Вход';
    $('#authSubmit').textContent = authMode === 'signup' ? 'Зарегистрироваться' : 'Войти';
    $('#nameField').hidden = authMode !== 'signup';
    const form = $('#authForm');
    if (form?.display_name) form.display_name.required = authMode === 'signup';
    if (form?.password) form.password.autocomplete = authMode === 'signup' ? 'new-password' : 'current-password';
    $('#resetPassword').hidden = authMode !== 'signin';
    $('#resendConfirmation').hidden = authMode !== 'signup';
    say($('#authStatus'), '');
  }
  function showAuthViews({ auth = true, profile = false, recovery = false } = {}) {
    $('#authView').hidden = !auth;
    $('#profileView').hidden = !profile;
    $('#recoveryView').hidden = !recovery;
  }
  function photoUrl(path) {
    if (!path || !db) return '';
    try {
      return db.storage.from('profile-photos').getPublicUrl(path).data.publicUrl || '';
    } catch (_) { return ''; }
  }
  function ageOf(y) {
    if (!y) return null;
    return Math.max(18, yearNow - Number(y));
  }
  function updateSignedOutUI() {
    currentUser = null;
    currentProfile = null;
    const login = $('#btnLogin');
    const acc = $('#btnAccount');
    if (login) { login.hidden = false; login.textContent = 'Войти'; login.dataset.authMode = 'signin'; }
    if (acc) { acc.hidden = false; acc.textContent = 'Регистрация'; acc.dataset.authMode = 'signup'; }
  }
  function updateSignedInUI(profile) {
    const login = $('#btnLogin');
    const acc = $('#btnAccount');
    if (login) login.hidden = true;
    if (acc) {
      acc.hidden = false;
      acc.textContent = profile?.status === 'pending' ? 'Анкета · на проверке' : 'Моя анкета';
      acc.dataset.authMode = 'profile';
    }
  }

  function matchesInterest(p, interest) {
    if (!interest) return true;
    const want = (INTEREST_ALIASES[interest] || [interest]).map(norm);
    return (p.instruments || []).some((i) => {
      const n = norm(i);
      return want.some((w) => n === w || n.includes(w) || w.includes(n));
    });
  }
  function matchesMood(p, mood) {
    if (!mood) return true;
    const want = (MOOD_ALIASES[mood] || [mood]).map(norm);
    const pool = [...(p.genres || []), ...(p.looking_for || [])];
    return pool.some((g) => {
      const n = norm(g);
      return want.some((w) => n === w || n.includes(w) || w.includes(n));
    });
  }

  function profileCard(p) {
    const img = photoUrl(p.avatar_path);
    const tags = [...(p.instruments || []), ...(p.genres || [])].slice(0, 3).map(escapeHtml).join(' · ');
    const looking = (p.looking_for || []).slice(0, 2).map(escapeHtml).join(' · ');
    const age = ageOf(p.birth_year);
    return `<article class="card" data-id="${p.id}">
      <div class="card-media">${img
        ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.display_name)}" loading="lazy" />`
        : `<div class="avatar-ph"><div>♥</div><small>Фото скоро</small></div>`}
      </div>
      <div class="card-body">
        <small>${escapeHtml(p.city || 'Хайфа')}${age ? ` · ${age}` : ''}</small>
        <strong>${escapeHtml(p.display_name || 'Без имени')}</strong>
        <span>${tags || 'Интересы появятся позже'}</span>
        ${looking ? `<em>Ищет: ${looking}</em>` : ''}
      </div>
      <button type="button" class="write" data-write="${p.id}">Написать</button>
    </article>`;
  }

  function renderGrid(rows, filtered) {
    const grid = $('#profileGrid');
    const count = $('#memberCount');
    if (!grid) return;
    loadedProfiles = new Map((rows || []).map((p) => [p.id, p]));
    if (count) {
      count.textContent = rows?.length
        ? `Анкет: ${rows.length}`
        : (filtered ? 'Пока нет подходящих анкет.' : 'Пока нет опубликованных анкет');
    }
    if (!rows?.length) {
      grid.innerHTML = `<div class="empty">
        <h3>${filtered ? 'Никого не нашли' : 'Пока пусто'}</h3>
        <p>${filtered ? 'Попробуйте другие интересы или создайте свою анкету.' : 'Станьте первым — анкета появится после модерации.'}</p>
        <button type="button" class="btn primary" data-open-auth data-auth-mode="signup">Создать анкету</button>
      </div>`;
      return;
    }
    grid.innerHTML = rows.map(profileCard).join('');
  }

  async function loadProfiles(filters = {}) {
    const token = ++loadToken;
    const interest = String(filters.interest || '').trim();
    const mood = String(filters.mood || '').trim();
    const grid = $('#profileGrid');
    if (grid) grid.innerHTML = '<div class="loading">Загрузка анкет…</div>';
    const { data, error } = await db.from('profiles')
      .select('id,display_name,birth_year,city,instruments,genres,looking_for,bio,avatar_path,song_url,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (token !== loadToken) return;
    if (error) {
      console.error(error);
      if (grid) grid.innerHTML = `<div class="empty"><h3>Не удалось загрузить</h3><p>${escapeHtml(error.message)}</p>
        <button type="button" class="btn soft" id="retryProfiles">Повторить</button></div>`;
      $('#retryProfiles')?.addEventListener('click', () => loadProfiles({ interest, mood }));
      return;
    }
    allApproved = data || [];
    const rows = allApproved.filter((p) => matchesInterest(p, interest) && matchesMood(p, mood));
    renderGrid(rows, !!(interest || mood));
  }

  async function showAccount(user, { open = false } = {}) {
    if (!user) return;
    currentUser = user;
    const q = await db.from('profiles')
      .select('id,display_name,birth_year,city,instruments,genres,looking_for,bio,avatar_path,song_url,status,moderation_note,created_at,updated_at,approved_at')
      .eq('id', user.id).maybeSingle();
    if (q.error) {
      console.error(q.error);
      say($('#profileStatus'), 'Не удалось загрузить анкету: ' + q.error.message, true);
      updateSignedInUI(null);
      return;
    }
    currentProfile = q.data || null;
    updateSignedInUI(currentProfile);
    const form = $('#profileForm');
    if (currentProfile && form) {
      ['display_name', 'birth_year', 'city', 'bio', 'song_url'].forEach((n) => {
        if (form.elements[n]) form.elements[n].value = currentProfile[n] ?? '';
      });
      ['instruments', 'genres', 'looking_for'].forEach((n) => {
        if (form.elements[n]) form.elements[n].value = (currentProfile[n] || []).join(', ');
      });
      $('#profileState').textContent = 'Статус: ' + (statusNames[currentProfile.status] || currentProfile.status || 'Черновик')
        + (currentProfile.moderation_note ? ' — ' + currentProfile.moderation_note : '');
    }
    if (ADMIN_EMAILS.includes((user.email || '').toLowerCase())) {
      /* admin hook kept for future panel */
    }
    if (open) {
      showAuthViews({ auth: false, profile: true });
      openModal('#authModal');
    }
  }

  function openPreview(id) {
    const p = loadedProfiles.get(id);
    const box = $('#profilePreviewContent');
    if (!p || !box) return;
    const img = photoUrl(p.avatar_path);
    const interests = (p.instruments || []).map((x) => `<span>${escapeHtml(x)}</span>`).join('');
    const moods = (p.genres || []).map((x) => `<span>${escapeHtml(x)}</span>`).join('');
    box.innerHTML = `<div class="preview-layout">
      <div class="preview-photo">${img
        ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.display_name)}" />`
        : `<div class="avatar-ph"><div>♥</div><small>Фото скоро</small></div>`}</div>
      <div>
        <p class="eyebrow">${escapeHtml(p.city || 'Хайфа')}</p>
        <h2>${escapeHtml(p.display_name)}</h2>
        <div class="tag-row">${interests}${moods}</div>
        <p>${escapeHtml(p.bio || 'Пока без описания — напишите первым.')}</p>
        ${(p.looking_for || []).length ? `<p><strong>Ищет:</strong> ${escapeHtml(p.looking_for.join(' · '))}</p>` : ''}
        ${p.song_url ? `<p><a href="${escapeHtml(p.song_url)}" target="_blank" rel="noopener">Ссылка / соцсеть</a></p>` : ''}
        <div class="row-actions">
          <button type="button" class="btn primary" data-write="${p.id}">Написать</button>
        </div>
      </div>
    </div>`;
    openModal('#profilePreview');
  }

  function writeTo(id) {
    const p = loadedProfiles.get(id);
    const name = p?.display_name || 'участнику';
    if (!currentUser) {
      closeModal('#profilePreview');
      setAuthMode('signin');
      showAuthViews({ auth: true });
      openModal('#authModal');
      say($('#authStatus'), 'Войдите, чтобы написать. Или используйте почту ниже.', false);
      return;
    }
    const subject = encodeURIComponent(`ZNAKOMY: сообщение для ${name}`);
    const body = encodeURIComponent(`Здравствуйте, ${name}!\n\nЯ увидел(а) вашу анкету на znakomy.online.\n\n`);
    window.location.href = `mailto:${MAIL}?subject=${subject}&body=${body}`;
  }

  function openOrder({ kind, item, price, target }) {
    const form = $('#orderForm');
    $('#orderTitle').textContent = kind === 'vip' ? 'Оформить VIP' : 'Отправить подарок';
    $('#orderSub').textContent = `${item} · ${price}`;
    form.kind.value = kind;
    form.item.value = item;
    form.price.value = price;
    form.target.value = target || '';
    if (currentUser?.email) form.email.value = currentUser.email;
    if (currentProfile?.display_name) form.name.value = currentProfile.display_name;
    say($('#orderStatus'), '');
    openModal('#orderModal');
  }

  /* Events */
  $('#menuBtn')?.addEventListener('click', () => {
    const nav = $('#mainNav');
    const open = nav.classList.toggle('open');
    $('#menuBtn').setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', async (e) => {
    const opener = e.target.closest('[data-open-auth]');
    if (opener) {
      e.preventDefault();
      if (currentUser && (opener.dataset.authMode === 'profile' || opener.id === 'btnAccount')) {
        await showAccount(currentUser, { open: true });
        return;
      }
      showAuthViews({ auth: true });
      setAuthMode(opener.dataset.authMode === 'signin' ? 'signin' : 'signup');
      openModal('#authModal');
      return;
    }
    if (e.target.closest('[data-close-modal]')) { e.preventDefault(); closeModal('#authModal'); return; }
    if (e.target.closest('[data-close-preview]')) { e.preventDefault(); closeModal('#profilePreview'); return; }
    if (e.target.closest('[data-close-order]')) { e.preventDefault(); closeModal('#orderModal'); return; }

    const writeBtn = e.target.closest('[data-write]');
    if (writeBtn) {
      e.preventDefault();
      e.stopPropagation();
      writeTo(writeBtn.dataset.write);
      return;
    }
    const card = e.target.closest('.card[data-id]');
    if (card) openPreview(card.dataset.id);

    const orderBtn = e.target.closest('[data-order]');
    if (orderBtn) {
      openOrder({
        kind: orderBtn.dataset.order,
        item: orderBtn.dataset.item,
        price: orderBtn.dataset.price
      });
    }

    const chip = e.target.closest('.chip[data-interest]');
    if (chip) {
      $$('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const form = $('#searchForm');
      if (form) form.interest.value = chip.dataset.interest || '';
      loadProfiles({ interest: chip.dataset.interest || '', mood: form?.mood?.value || '' });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('#authModal');
      closeModal('#profilePreview');
      closeModal('#orderModal');
    }
  });

  $$('[data-auth-mode].tab').forEach((b) => b.addEventListener('click', () => setAuthMode(b.dataset.authMode)));

  $('#searchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const interest = e.currentTarget.interest.value.trim();
    const mood = e.currentTarget.mood.value.trim();
    $$('.chip').forEach((c) => c.classList.toggle('active', (c.dataset.interest || '') === interest));
    loadProfiles({ interest, mood });
    $('#people')?.scrollIntoView({ behavior: 'smooth' });
  });
  $('#clearFilters')?.addEventListener('click', () => {
    const form = $('#searchForm');
    if (form) { form.interest.value = ''; form.mood.value = ''; }
    $$('.chip').forEach((c) => c.classList.toggle('active', !c.dataset.interest));
    loadProfiles({});
  });

  $('#authForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const submit = $('#authSubmit');
    if (submit) submit.disabled = true;
    say($('#authStatus'), 'Подождите…');
    const res = authMode === 'signup'
      ? await db.auth.signUp({
          email, password,
          options: {
            data: { display_name: form.display_name.value.trim() },
            emailRedirectTo: 'https://znakomy.online/'
          }
        })
      : await db.auth.signInWithPassword({ email, password });
    if (submit) submit.disabled = false;
    if (res.error) {
      const msg = res.error.code === 'invalid_credentials' ? 'Неверный email или пароль.'
        : res.error.code === 'email_not_confirmed' ? 'Сначала подтвердите email.'
        : res.error.message;
      return say($('#authStatus'), msg, true);
    }
    if (authMode === 'signup') {
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'ZNAKOMY — новая регистрация',
          _template: 'table',
          _cc: 'zvukor1980@gmail.com',
          name: (form.display_name?.value || '').trim() || '(без имени)',
          email,
          message: 'Новая регистрация (знакомства Хайфа) на znakomy.online'
        })
      }).catch(() => {});
    }
    if (authMode === 'signup' && !res.data.session) {
      return say($('#authStatus'), 'Регистрация создана. Проверьте почту и подтвердите email.');
    }
    currentUser = res.data.user;
    await showAccount(currentUser, { open: false });
    closeModal('#authModal');
  });

  $('#resendConfirmation')?.addEventListener('click', async () => {
    const email = $('#authForm')?.email.value.trim().toLowerCase();
    if (!email) return say($('#authStatus'), 'Укажите email.', true);
    const { error } = await db.auth.resend({ type: 'signup', email, options: { emailRedirectTo: 'https://znakomy.online/' } });
    say($('#authStatus'), error ? error.message : 'Письмо отправлено.', !!error);
  });
  $('#resetPassword')?.addEventListener('click', async () => {
    const email = $('#authForm')?.email.value.trim().toLowerCase();
    if (!email) return say($('#authStatus'), 'Укажите email.', true);
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: 'https://znakomy.online/' });
    say($('#authStatus'), error ? error.message : 'Ссылка для восстановления отправлена.', !!error);
  });
  $('#recoveryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const a = e.currentTarget.password.value;
    const b = e.currentTarget.confirm_password.value;
    if (a !== b) return say($('#recoveryStatus'), 'Пароли не совпадают.', true);
    const { error } = await db.auth.updateUser({ password: a });
    if (error) return say($('#recoveryStatus'), error.message, true);
    say($('#recoveryStatus'), 'Пароль изменён.');
    setTimeout(() => closeModal('#authModal'), 500);
  });

  $('#profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || !currentProfile) return say($('#profileStatus'), 'Войдите снова.', true);
    const form = e.currentTarget;
    const values = {
      display_name: form.display_name.value.trim(),
      birth_year: Number(form.birth_year.value),
      city: form.city.value.trim() || 'Хайфа',
      instruments: splitList(form.instruments.value),
      genres: splitList(form.genres.value),
      looking_for: splitList(form.looking_for.value),
      bio: form.bio.value.trim(),
      song_url: form.song_url.value.trim() || null
    };
    say($('#profileStatus'), 'Сохраняю…');
    const file = $('#avatarInput')?.files?.[0];
    if (file) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${currentUser.id}/${Date.now()}.${ext}`;
      const up = await db.storage.from('profile-photos').upload(path, file, { upsert: true, contentType: file.type });
      if (up.error) return say($('#profileStatus'), up.error.message, true);
      values.avatar_path = path;
    }
    const { data, error } = await db.from('profiles').update(values).eq('id', currentUser.id).select().single();
    if (error) return say($('#profileStatus'), error.message, true);
    currentProfile = data;
    try {
      const rev = await db.rpc('submit_profile_for_review');
      if (!rev.error && rev.data) currentProfile = rev.data;
    } catch (_) {}
    $('#profileState').textContent = 'Статус: ' + (statusNames[currentProfile.status] || currentProfile.status || 'Черновик');
    updateSignedInUI(currentProfile);
    say($('#profileStatus'), 'Анкета сохранена и отправлена на проверку.');
  });

  $('#logoutButton')?.addEventListener('click', async () => {
    await db.auth.signOut();
    updateSignedOutUI();
    closeModal('#authModal');
  });

  $('#orderForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const btn = f.querySelector('button[type="submit"]');
    btn.disabled = true;
    say($('#orderStatus'), 'Отправляю…');
    const payload = {
      _subject: `ZNAKOMY ${f.kind.value}: ${f.item.value}`,
      _template: 'table',
      kind: f.kind.value,
      item: f.item.value,
      price: f.price.value,
      target_profile: f.target.value || '—',
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      contact: f.contact.value.trim(),
      message: f.message.value.trim() || '—',
      site: 'https://znakomy.online/'
    };
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('fail');
      say($('#orderStatus'), 'Заявка отправлена. Мы напишем по оплате.');
      setTimeout(() => { closeModal('#orderModal'); f.reset(); }, 900);
    } catch (_) {
      say($('#orderStatus'), 'Не удалось отправить. Напишите на ' + MAIL, true);
    } finally {
      btn.disabled = false;
    }
  });

  async function boot() {
    if (!window.supabase) {
      console.error('Supabase SDK missing');
      return;
    }
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'znakomy-auth-v1'
      }
    });
    Object.defineProperty(window, 'currentUser', {
      get: () => currentUser,
      set: (v) => { currentUser = v; },
      configurable: true
    });
    Object.defineProperty(window, 'currentProfile', {
      get: () => currentProfile,
      set: (v) => { currentProfile = v; },
      configurable: true
    });

    const by = $('#profileForm')?.birth_year;
    if (by) by.max = String(yearNow - 18);

    db.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        showAuthViews({ auth: false, recovery: true });
        openModal('#authModal');
        return;
      }
      if (event === 'SIGNED_OUT') { updateSignedOutUI(); return; }
      if (session?.user) {
        currentUser = session.user;
        setTimeout(() => showAccount(session.user, { open: false }), 0);
      }
    });

    try {
      await loadProfiles();
      const { data } = await db.auth.getSession();
      if (data.session?.user) {
        currentUser = data.session.user;
        await showAccount(currentUser, { open: false });
      } else updateSignedOutUI();
    } catch (err) {
      console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }
})();
