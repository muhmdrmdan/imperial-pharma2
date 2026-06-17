/* ====================================================================
   IMPERIAL PHARMA — interactions + i18n
   Translation model: any element with data-en / data-ar attributes
   gets its innerHTML swapped on language change. Placeholders use
   data-en-ph / data-ar-ph. This keeps page content bilingual inline.
   ==================================================================== */

function applyLang(lang) {
  const isAr = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  document.body.setAttribute('dir', isAr ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-en]').forEach(el => {
    const v = el.getAttribute(isAr ? 'data-ar' : 'data-en');
    if (v !== null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-en-ph]').forEach(el => {
    const v = el.getAttribute(isAr ? 'data-ar-ph' : 'data-en-ph');
    if (v !== null) el.setAttribute('placeholder', v);
  });
  document.querySelectorAll('.lang .lbl').forEach(el => { el.textContent = isAr ? 'EN' : 'عربي'; });

  try { localStorage.setItem('ip_lang', lang); } catch (e) {}
}

function initLang() {
  let saved = 'en';
  try { saved = localStorage.getItem('ip_lang') || 'en'; } catch (e) {}
  applyLang(saved);
  document.body.addEventListener('click', e => {
    if (!e.target.closest('.lang')) return;
    applyLang(document.documentElement.lang === 'ar' ? 'en' : 'ar');
  });
}

function initHeader() {
  const h = document.querySelector('.hdr');
  if (!h) return;
  const f = () => h.classList.toggle('scrolled', window.scrollY > 30);
  f(); window.addEventListener('scroll', f, { passive: true });
}

function initMenu() {
  const b = document.querySelector('.burger'), n = document.querySelector('.nav');
  if (!b || !n) return;
  b.addEventListener('click', () => n.classList.toggle('open'));
  n.querySelectorAll('a').forEach(a => {
    // only close on real navigation links, not dropdown parents
    if (a.getAttribute('href') && a.getAttribute('href') !== '#') {
      a.addEventListener('click', () => n.classList.remove('open'));
    }
  });
}

function initReveal() {
  const els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || !els.length) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  els.forEach(e => io.observe(e));
}

function initForm() {
  const form = document.querySelector('#ip-form');
  if (!form) return;
  const st = form.querySelector('.fstatus');
  const btn = form.querySelector('button[type="submit"]');
  const msg = k => {
    const ar = document.documentElement.lang === 'ar';
    const m = {
      sending: ar ? 'جارٍ الإرسال…' : 'Sending…',
      ok: ar ? 'شكراً لك. تم إرسال رسالتك بنجاح.' : 'Thank you. Your message has been sent successfully.',
      err: ar ? 'حدث خطأ. حاول مرة أخرى أو راسلنا مباشرة.' : 'Something went wrong. Please try again or email us directly.'
    };
    return m[k];
  };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const orig = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = msg('sending'); st.className = 'fstatus';
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (r.ok) { st.className = 'fstatus ok'; st.textContent = msg('ok'); form.reset(); }
      else { st.className = 'fstatus err'; st.textContent = msg('err'); }
    } catch (_) { st.className = 'fstatus err'; st.textContent = msg('err'); }
    finally { btn.disabled = false; btn.innerHTML = orig; }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLang(); initHeader(); initMenu(); initReveal(); initForm();
});
