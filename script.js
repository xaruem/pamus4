
/* ===================================================
   Business Law Consulting — script.js
   - Language switcher RU / UZ
   - FAQ accordion
   - Form submission → Telegram Bot
   - Smooth scroll
   - Header scroll shadow
   - Mobile burger menu
=================================================== */

// ─── CONFIG ───────────────────────────────────────
const TG_TOKEN  = '8830532011:AAGJ6A7LZmmWT1c2Qi2YxZRJHpOd62FNN1w';
const TG_CHAT   = '-5102240344';
const TG_API    = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;

// ─── CURRENT LANGUAGE ─────────────────────────────
let currentLang = localStorage.getItem('blc_lang') || 'ru';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('blc_lang', lang);

  // update all [data-ru] / [data-uz] text nodes
  document.querySelectorAll('[data-ru]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (val) el.textContent = val;
  });

  // update placeholder attributes
  document.querySelectorAll('[data-placeholder-ru]').forEach(el => {
    const val = el.getAttribute('data-placeholder-' + lang);
    if (val) el.placeholder = val;
  });

  // sync all lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // update <html lang>
  document.documentElement.lang = lang;
}

// Apply on load
document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
});

// ─── MOBILE BURGER ────────────────────────────────
function toggleMenu() {
  const menu   = document.getElementById('mobileMenu');
  const burger = document.getElementById('burger');
  const open   = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
}

// close menu when clicking outside
document.addEventListener('click', e => {
  const menu   = document.getElementById('mobileMenu');
  const burger = document.getElementById('burger');
  if (menu && menu.classList.contains('open')) {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
      menu.classList.remove('open');
    }
  }
});

// ─── HEADER SCROLL SHADOW ─────────────────────────
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (!header) return;
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
  } else {
    header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
  }
}, { passive: true });

// ─── SMOOTH SCROLL TO FORM ────────────────────────
function scrollToForm() {
  const el = document.getElementById('contact');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── FAQ ACCORDION ────────────────────────────────
function toggleFaq(btn) {
  const item   = btn.closest('.faq__item');
  const isOpen = item.classList.contains('open');

  // close all
  document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));

  if (!isOpen) item.classList.add('open');
}

// ─── FORM VALIDATION & SUBMISSION ─────────────────
async function submitForm() {
  const nameEl  = document.getElementById('formName');
  const phoneEl = document.getElementById('formPhone');
  const msgEl   = document.getElementById('formMsg');
  const btn     = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  const formWrap = document.getElementById('contactForm');

  const name  = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const msg   = msgEl.value.trim();

  // simple validation
  if (!name) {
    nameEl.focus();
    nameEl.style.borderColor = '#e74c3c';
    setTimeout(() => nameEl.style.borderColor = '', 2000);
    return;
  }
  if (phone.length < 12) {
    phoneEl.focus();
    phoneEl.style.borderColor = '#e74c3c';
    setTimeout(() => phoneEl.style.borderColor = '', 2000);
    return;
  }

  btn.disabled = true;
  btn.textContent = currentLang === 'uz' ? 'Yuborilmoqda...' : 'Отправляем...';

  const text =
    `📩 *Новая заявка с сайта Business Law Consulting*\n\n` +
    `👤 *Имя:* ${name}\n` +
    `📞 *Телефон:* ${phone}\n` +
    `💬 *Сообщение:* ${msg || '—'}\n\n` +
    `🌐 *Язык:* ${currentLang.toUpperCase()}\n` +
    `⏰ *Время:* ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`;

  try {
    const res = await fetch(TG_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text,
        parse_mode: 'Markdown'
      })
    });

    const data = await res.json();
    if (data.ok) {
      // hide form fields, show success
      formWrap.querySelectorAll('.form-group, .btn-submit, .form-consent').forEach(el => {
        el.style.display = 'none';
      });
      success.style.display = 'flex';
      success.style.flexDirection = 'column';
      success.style.alignItems = 'center';

      // send analytics event if GTM loaded
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'form_submit', formName: 'consultation' });
      }
    } else {
      throw new Error('Telegram API error');
    }
  } catch (err) {
    console.error('Send error:', err);
    btn.disabled = false;
    btn.textContent = currentLang === 'uz' ? 'Yuborish' : 'Отправить';
    alert(
      currentLang === 'uz'
        ? "Xatolik yuz berdi. Iltimos, bizga to'g'ridan-to'g'ri qo'ng'iroq qiling: +998 90 888-44-66"
        : 'Ошибка отправки. Пожалуйста, позвоните нам: +998 90 888-44-66'
    );
  }
}

// Allow pressing Enter in name/phone fields to submit
document.addEventListener('DOMContentLoaded', () => {
  ['formName', 'formPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitForm();
    });
  });

  // Phone field: keep +998 prefix
  const phoneEl = document.getElementById('formPhone');
  if (phoneEl) {
    phoneEl.addEventListener('input', () => {
      if (!phoneEl.value.startsWith('+998')) {
        phoneEl.value = '+998';
      }
    });
    phoneEl.addEventListener('focus', () => {
      if (phoneEl.value === '') phoneEl.value = '+998';
    });
  }
});

// ─── INTERSECTION OBSERVER (fade-in sections) ─────
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .fade-up {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .fade-up.visible {
      opacity: 1;
      transform: none;
    }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll(
    '.services__card, .why__card, .approach__step, .urgent__card, .additional__item, .trust__item, .faq__item'
  );

  targets.forEach((el, i) => {
    el.classList.add('fade-up');
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
});