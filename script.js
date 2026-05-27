// ===== LANGUAGE SYSTEM =====
let currentLang = 'ru';

function setLang(lang) {
  currentLang = lang;

  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = el.getAttribute('data-ph-' + lang) || val;
    } else {
      el.innerHTML = val;
    }
  });

  document.querySelectorAll('[data-ph-' + lang + ']').forEach(el => {
    el.placeholder = el.getAttribute('data-ph-' + lang);
  });

  document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');
  document.getElementById('btn-uz').classList.toggle('active', lang === 'uz');

  try {
    const sel = document.querySelector('.goog-te-combo');
    if (sel) {
      sel.value = lang === 'uz' ? 'uz' : 'ru';
      sel.dispatchEvent(new Event('change'));
    }
  } catch (e) {
    console.log('Google Translate not loaded');
  }
}

// ===== PHONE INPUT =====
// Always starts with +998, max 9 digits after prefix (12 chars total: +998XXXXXXXXX)
function initPhoneInput() {
  const phoneInput = document.getElementById('f-phone');
  if (!phoneInput) return;

  const PREFIX = '+998';

  // Set initial value
  if (!phoneInput.value.startsWith(PREFIX)) {
    phoneInput.value = PREFIX;
  }

  phoneInput.addEventListener('input', function () {
    let val = this.value;

    // Strip everything, keep only digits
    let digits = val.replace(/\D/g, '');

    // If starts with 998, keep; if starts with 8 (old RU format), treat as 998
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }

    // Limit to 9 digits after +998
    digits = digits.substring(0, 9);

    this.value = PREFIX + digits;
  });

  phoneInput.addEventListener('keydown', function (e) {
    // Prevent deleting the prefix
    const PREFIX_LEN = PREFIX.length;
    if (
      (e.key === 'Backspace' || e.key === 'Delete') &&
      this.selectionStart <= PREFIX_LEN &&
      this.selectionEnd <= PREFIX_LEN
    ) {
      e.preventDefault();
    }
  });

  phoneInput.addEventListener('click', function () {
    // If cursor is placed before/within prefix, move it to end
    if (this.selectionStart < PREFIX.length) {
      this.setSelectionRange(this.value.length, this.value.length);
    }
  });

  phoneInput.addEventListener('focus', function () {
    // Ensure prefix is always present on focus
    if (!this.value.startsWith(PREFIX)) {
      this.value = PREFIX;
    }
    // Move cursor to end
    setTimeout(() => {
      this.setSelectionRange(this.value.length, this.value.length);
    }, 0);
  });
}

// ===== FAQ =====
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

  if (!isOpen) {
    item.classList.add('open');
  }
}

// ===== FORM SUBMISSION via Telegram Bot =====
async function submitForm() {
  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const message = document.getElementById('f-message').value.trim();

  if (!name) {
    alert(currentLang === 'uz' ? 'Исмингизни киритинг' : 'Введите ваше имя');
    return;
  }

  const PREFIX = '+998';
  if (!phone || phone === PREFIX || phone.length < PREFIX.length + 9) {
    alert(currentLang === 'uz' ? 'Телефон рақамини тўлиқ киритинг' : 'Введите полный номер телефона');
    return;
  }

  const text = `🔔 Новая заявка с сайта Business Law Consulting\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n💬 Сообщение: ${message || '—'}`;

  const TOKEN = '8830532011:AAGJ6A7LZmmWT1c2Qi2YxZRJHpOd62FNN1w';
  const CHAT_ID = '-5102240344';

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();

    if (data.ok) {
      document.getElementById('f-name').value = '';
      document.getElementById('f-phone').value = PREFIX;
      document.getElementById('f-message').value = '';
      document.getElementById('modal').classList.add('open');
    } else {
      alert('Ошибка отправки. Позвоните нам: +998 90 888-44-66');
    }
  } catch (e) {
    alert('Ошибка соединения. Позвоните нам: +998 90 888-44-66');
  }
}

// ===== MODAL =====
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== GOOGLE TRANSLATE INITIALIZATION =====
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'ru',
    includedLanguages: 'ru,uz,en',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: false
  }, 'google_translate_element');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  initPhoneInput();
});
