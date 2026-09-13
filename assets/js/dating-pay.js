(() => {
  const MAIL = 'digitalaleksei@gmail.com';
  const endpoint = `https://formsubmit.co/ajax/${MAIL}`;
  const vipPlans = [
    { id: 'vip7', title: 'VIP · 7 дней', price: '₪29', perks: 'Значок VIP, выше в ленте' },
    { id: 'vip30', title: 'VIP · 30 дней', price: '₪79', perks: 'Значок VIP, приоритет в поиске, выделение анкеты' },
    { id: 'vip90', title: 'VIP · 90 дней', price: '₪179', perks: 'Всё из 30 дней + поддержка в приоритете' }
  ];
  const gifts = [
    { id: 'rose', title: '🌹 Роза', price: '₪9' },
    { id: 'heart', title: '💜 Сердце', price: '₪15' },
    { id: 'super', title: '✨ Суперлайк', price: '₪12' },
    { id: 'dinner', title: '🍷 Приглашение', price: '₪25' },
    { id: 'star', title: '⭐ Звезда', price: '₪19' }
  ];

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementNode || t.content.firstChild;
  }

  function ensureDialog() {
    let dlg = document.getElementById('datingPayDlg');
    if (dlg) return dlg;
    dlg = el(`<dialog class="dating-dlg" id="datingPayDlg">
      <form id="datingPayForm">
        <h3 id="datingPayTitle">Заказ</h3>
        <p id="datingPaySub" style="margin:0;color:#9b93a3;font-size:.9rem"></p>
        <input type="hidden" name="kind" id="datingPayKind" />
        <input type="hidden" name="item" id="datingPayItem" />
        <input type="hidden" name="price" id="datingPayPrice" />
        <input type="hidden" name="target_profile" id="datingPayTarget" />
        <label>Ваше имя<input required name="name" autocomplete="name" /></label>
        <label>Email<input required type="email" name="email" autocomplete="email" /></label>
        <label>Телефон / Telegram<input required name="contact" placeholder="+972… или @username" /></label>
        <label>Комментарий<textarea name="message" rows="3" placeholder="Как удобно оплатить / кому подарок"></textarea></label>
        <div class="actions">
          <button type="button" id="datingPayClose">Отмена</button>
          <button type="submit" class="go">Отправить на почту</button>
        </div>
        <p style="margin:0;color:#9b93a3;font-size:.72rem;line-height:1.4">Заявка уйдёт на ${MAIL}. Оплату подтвердим вручную (Bit / перевод).</p>
      </form>
    </dialog>`);
    document.body.appendChild(dlg);
    document.getElementById('datingPayClose').onclick = () => dlg.close();
    document.getElementById('datingPayForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      const btn = f.querySelector('.go');
      btn.disabled = true;
      const payload = {
        _subject: `ZNAKOMY ${f.kind.value}: ${f.item.value}`,
        _template: 'table',
        kind: f.kind.value,
        item: f.item.value,
        price: f.price.value,
        target_profile: f.target_profile.value || '—',
        name: f.name.value.trim(),
        email: f.email.value.trim(),
        contact: f.contact.value.trim(),
        message: f.message.value.trim() || '—',
        site: 'https://znakomy.online/'
      };
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('send failed');
        alert('Заявка отправлена. Мы напишем на почту по оплате VIP/подарка.');
        dlg.close();
        f.reset();
      } catch (_) {
        alert('Не удалось отправить. Напишите на ' + MAIL);
      } finally {
        btn.disabled = false;
      }
    });
    return dlg;
  }

  function openPay({ kind, item, price, target }) {
    const dlg = ensureDialog();
    document.getElementById('datingPayTitle').textContent = kind === 'VIP' ? 'Оформить VIP' : 'Отправить подарок';
    document.getElementById('datingPaySub').textContent = `${item} · ${price}`;
    document.getElementById('datingPayKind').value = kind;
    document.getElementById('datingPayItem').value = item;
    document.getElementById('datingPayPrice').value = price;
    document.getElementById('datingPayTarget').value = target || '';
    const u = window.currentUser;
    const form = document.getElementById('datingPayForm');
    if (u?.email && form.email) form.email.value = u.email;
    if (window.currentProfile?.display_name && form.name) form.name.value = window.currentProfile.display_name;
    dlg.showModal();
  }

  function mountSections() {
    if (document.getElementById('datingVip')) return;
    const host = document.querySelector('.platform-directions') || document.querySelector('main');
    if (!host) return;
    const box = el(`<section class="dating-section dating-mono" id="datingVip">
      <h2>VIP и подарки</h2>
      <p class="lead">Регистрация бесплатная. Платно только VIP и подарки — без платных просмотров.</p>
      <div class="pay-grid" id="vipGrid"></div>
      <h3 style="margin:1.5rem 0 .6rem;font-family:Space Grotesk,Inter,sans-serif">Подарки</h3>
      <div class="gift-row" id="giftRow"></div>
    </section>`);
    host.parentNode.insertBefore(box, host);
    const vipGrid = box.querySelector('#vipGrid');
    vipPlans.forEach((p) => {
      const c = el(`<article class="pay-card"><strong>${p.title}</strong><div class="price">${p.price}</div><span style="color:#9b93a3;font-size:.85rem">${p.perks}</span><button type="button">Оформить</button></article>`);
      c.querySelector('button').onclick = () => openPay({ kind: 'VIP', item: p.title, price: p.price });
      vipGrid.appendChild(c);
    });
    const giftRow = box.querySelector('#giftRow');
    gifts.forEach((g) => {
      const b = el(`<button type="button" class="gift-chip">${g.title} · ${g.price}</button>`);
      b.onclick = () => openPay({ kind: 'Подарок', item: g.title, price: g.price });
      giftRow.appendChild(b);
    });
  }

  function enhancePreview() {
    const wrap = document.getElementById('profilePreview');
    if (!wrap || wrap.dataset.datingPay === '1') return;
    wrap.dataset.datingPay = '1';
    const obs = new MutationObserver(() => {
      const actions = wrap.querySelector('.preview-actions');
      if (!actions || actions.querySelector('.preview-pay')) return;
      const id = wrap.dataset.profileId || '';
      const name = wrap.querySelector('#previewName')?.textContent || '';
      const bar = el(`<div class="preview-pay">
        <button type="button" class="vip">⭐ VIP ему/ей подарить</button>
        <button type="button" class="gift">🎁 Подарок</button>
      </div>`);
      bar.querySelector('.vip').onclick = () => openPay({ kind: 'VIP', item: 'VIP · 30 дней (подарок пользователю)', price: '₪79', target: `${name} (${id})` });
      bar.querySelector('.gift').onclick = () => openPay({ kind: 'Подарок', item: '💜 Сердце', price: '₪15', target: `${name} (${id})` });
      actions.appendChild(bar);
    });
    obs.observe(wrap, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    mountSections();
    enhancePreview();
  });
  if (document.readyState !== 'loading') {
    mountSections();
    enhancePreview();
  }
  window.ZnakomyDatingPay = { openPay, vipPlans, gifts };
})();
