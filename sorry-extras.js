import cfg from './sorry-config.js';

const qs = new URLSearchParams(location.search);
const to = (qs.get('to') || cfg.to).trim();
const from = (qs.get('from') || cfg.from).trim();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const eb = document.getElementById('eyebrow');
const hint = document.getElementById('hint');
if (eb && cfg.eyebrow) eb.textContent = cfg.eyebrow;
if (hint && cfg.hint) hint.textContent = cfg.hint;

// ---------- DOM ----------
const btn = document.createElement('button');
btn.className = 'sx-btn';
btn.type = 'button';
btn.innerHTML = `<span aria-hidden="true">💌</span> ${esc(cfg.letterButton)}`;

const letter = document.createElement('div');
letter.className = 'sx-letter';
letter.setAttribute('role', 'dialog');
letter.setAttribute('aria-modal', 'true');
const n = cfg.letter.length;
letter.innerHTML = `
  <div class="sx-paper">
    <button class="sx-close" type="button" aria-label="Close">&times;</button>
    ${to ? `<p class="sx-to">${esc(to)},</p>` : ''}
    ${cfg.letter.map((t, i) => `<p class="sx-p" style="--i:${i}">${esc(t)}</p>`).join('')}
    <p class="sx-p sx-sign" style="--i:${n}">&mdash; ${esc(from)}</p>
    <div class="sx-ask" style="--i:${n + 1}">
      <p class="sx-q">${esc(cfg.question)}</p>
      <div class="sx-actions">
        <button class="sx-yes" type="button">${esc(cfg.yes)}</button>
        <button class="sx-no" type="button">${esc(cfg.notYet)}</button>
      </div>
    </div>
    <p class="sx-reply" hidden></p>
  </div>`;
document.body.append(btn, letter);

const ask = letter.querySelector('.sx-ask');
const yes = letter.querySelector('.sx-yes');
const no = letter.querySelector('.sx-no');
const reply = letter.querySelector('.sx-reply');

const open = () => letter.classList.add('is-open');
const close = () => letter.classList.remove('is-open');
btn.addEventListener('click', open);
letter.querySelector('.sx-close').addEventListener('click', close);
letter.addEventListener('click', (e) => { if (e.target === letter) close(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

function say(text) {
  reply.textContent = text;
  reply.hidden = false;
  reply.style.animation = 'none';
  void reply.offsetWidth;
  reply.style.animation = '';
}

yes.addEventListener('click', () => {
  ask.hidden = true;
  say(cfg.thanks);
  volley();
});
no.addEventListener('click', () => {
  no.hidden = true;
  yes.textContent = cfg.yesLater;
  say(cfg.notYetReply);
});

addEventListener('sorry:done', () => btn.classList.add('is-shown'));
addEventListener('sorry:reset', () => {
  close();
  btn.classList.remove('is-shown');
  ask.hidden = false;
  reply.hidden = true;
  no.hidden = false;
  yes.textContent = cfg.yes;
});

// ---------- arrow volley (Web Animations, no deps) ----------
const ARROW = `<svg viewBox="0 0 120 24" width="120" height="24" aria-hidden="true">
  <line x1="12" y1="12" x2="100" y2="12" stroke="#7a4a2a" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M0 12 L12 4 L8 12 L12 20Z" fill="#e6396a"/><path d="M12 12 L24 4 L20 12 L24 20Z" fill="#ff7f9c"/>
  <g transform="translate(108 12) rotate(90) scale(.62) translate(-32 -16.5)">
    <path d="M32 12 C30 7 22 6.5 21.5 13 C21 18 27 22 32 27 C37 22 43 18 42.5 13 C42 6.5 34 7 32 12Z" fill="#f4a626" stroke="#a5701a" stroke-width=".8"/></g></svg>`;
const HEART = (c) => `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 20C5.5 15 1.5 11.4 1.5 6.9 1.5 3.6 4 1.5 7 1.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.5 2.1 5.5 5.4C23.5 11.4 19.5 15 12 20Z" fill="${c}"/></svg>`;
const COLORS = ['#ff6f97', '#ffb14e', '#ff8fae', '#ffd36a', '#e23b67'];

function pop(x, y) {
  const h = document.createElement('div');
  h.className = 'sx-heart';
  h.style.cssText = `left:${x}px;top:${y}px;width:${rand(14, 28)}px`;
  h.innerHTML = HEART(COLORS[(Math.random() * COLORS.length) | 0]);
  document.body.append(h);
  const a = h.animate(
    [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 },
     { transform: `translate(calc(-50% + ${rand(-50, 50)}px),${-rand(70, 190)}px) scale(1) rotate(${rand(-30, 30)}deg)`, opacity: 0 }],
    { duration: rand(1100, 1800), easing: 'ease-out' });
  a.onfinish = () => h.remove();
}

function volley() {
  if (reduce) { for (let i = 0; i < 14; i++) pop(rand(20, innerWidth - 20), rand(innerHeight * 0.3, innerHeight * 0.9)); return; }
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.className = 'sx-arrow';
    el.innerHTML = ARROW;
    document.body.append(el);
    const sx = -150, sy = rand(H * 0.2, H * 1.05);
    const ex = W + 150, ey = sy - rand(H * 0.3, H * 0.7);
    const ang = (Math.atan2(ey - sy, ex - sx) * 180) / Math.PI;
    const dur = rand(900, 1500), delay = i * 85;
    const a = el.animate(
      [{ transform: `translate(${sx}px,${sy}px) rotate(${ang}deg)` },
       { transform: `translate(${ex}px,${ey}px) rotate(${ang}deg)` }],
      { duration: dur, delay, easing: 'cubic-bezier(.3,.1,.5,1)', fill: 'backwards' });
    a.onfinish = () => el.remove();
    setTimeout(() => pop(sx + (ex - sx) * 0.55, sy + (ey - sy) * 0.55), delay + dur * 0.55);
  }
}