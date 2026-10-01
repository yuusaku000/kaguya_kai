// ===== ノベルエンジン =====
const $ = s => document.querySelector(s);
const stage = $('#stage');
const G = { skip: false, ctrl: false, auto: false, speed: 28, log: [], busy: false, mgActive: false, abort: false };
const SAVE_KEY = 'kaguya_vn_save_v1';
const save = { load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || { reached: 0, cleared: false }; } catch (e) { return { reached: 0, cleared: false }; } }, write(d) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) { } } };

// ---------- 画面スケーリング ----------
function fit() { const s = Math.min(innerWidth / 1280, innerHeight / 720); stage.style.transform = `scale(${s})`; }
addEventListener('resize', fit); fit();
function stagePos(e) { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) * 1280 / r.width, y: (e.clientY - r.top) * 720 / r.height }; }

// ---------- 画像 ----------
const SPRITES = ['kaguya', 'kaguya_real', 'iroha', 'rai', 'akira', 'yachiyo', 'mami', 'roka', 'noi'];
const IMG = {};
const GEN = {}; // コードで生成した立ち絵
function preload() {
  return Promise.all(SPRITES.map(n => new Promise(res => { const im = new Image(); im.onload = () => { IMG[n] = im; res(); }; im.onerror = () => { console.warn('missing', n); res(); }; im.src = 'img/' + n + '.png'; })));
}
// キャラごとの表示高さ（px）
const CH = {
  kaguya: { h: 600, name: 'かぐや' }, kaguya_real: { h: 600, name: 'かぐや' }, iroha: { h: 690, name: 'いろは' },
  rai: { h: 740, name: '雷' }, akira: { h: 740, name: 'アキラ' }, yachiyo: { h: 760, name: 'ヤチヨ' },
  mami: { h: 620, name: '真実' }, roka: { h: 720, name: '芦花' }, noi: { h: 660, name: '乃依' },
};
const NAME2ID = { 'かぐや': 'kaguya', 'いろは': 'iroha', '雷': 'rai', 'アキラ': 'akira', 'ヤチヨ': 'yachiyo', '真実': 'mami', '芦花': 'roka', '乃依': 'noi', 'メイド': 'noi' };
const POS = { ll: 150, l: 330, cl: 490, c: 640, cr: 790, r: 950, rr: 1130 };

// ---------- キャラ表示 ----------
const chars = {};
function show(id, pos = 'c', o = {}) {
  let el = chars[id];
  const src = o.img || (el && el.dataset.img) || id;
  const x = typeof pos === 'number' ? pos : POS[pos];
  if (!el) {
    el = document.createElement('div'); el.className = 'chr';
    const im = document.createElement('img'); el.appendChild(im);
    $('#chars').appendChild(el); chars[id] = el;
    el.style.opacity = 0; el.style.left = (x + (o.from === 'l' ? -200 : o.from === 'r' ? 200 : 0)) + 'px';
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = 1; el.style.left = x + 'px'; }));
  } else el.style.left = x + 'px';
  el.dataset.img = src;
  el.querySelector('img').src = o.src || GEN[src] || ('img/' + src + '.png');
  el.style.height = (o.h || (CH[src] || CH[id] || { h: 680 }).h) + 'px';
  el.classList.toggle('flip', !!o.flip);
  el.classList.toggle('silhouette', !!o.silhouette);
  el.classList.toggle('ghost', !!o.ghost);
  el.classList.toggle('glow', !!o.glow);
  el.style.zIndex = o.z || 1;
  if (o.anim) anim(id, o.anim);
  return el;
}
function hide(id, o = {}) {
  const el = chars[id]; if (!el) return;
  delete chars[id];
  if (o.fade) { el.classList.add('fade'); setTimeout(() => el.remove(), 2600); return; }
  el.style.opacity = 0; setTimeout(() => el.remove(), 450);
}
function hideAll() { Object.keys(chars).forEach(k => hide(k)); }
function anim(id, cls) { const el = chars[id]; if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 600); }
function focusChar(id) { Object.entries(chars).forEach(([k, el]) => el.classList.toggle('dim', id !== null && k !== id)); }

// ---------- 入力 ----------
let advanceResolver = null;
function advance() { if (advanceResolver) { const r = advanceResolver; advanceResolver = null; r(); } }
function waitAdvance(autoMs) {
  return new Promise(res => {
    advanceResolver = res;
    if (G.skip || G.ctrl) setTimeout(advance, 40);
    else if (G.auto) setTimeout(() => { if (advanceResolver === res) advance(); }, autoMs || 1800);
  });
}
stage.addEventListener('click', e => {
  if (G.mgActive || e.target.closest('#ui') || e.target.closest('#choices') || e.target.closest('#logwin') || e.target.closest('#title') || e.target.closest('#boot') || e.target.closest('.phone')) return;
  if (typing) { typing.finish(); return; }
  advance();
});
addEventListener('keydown', e => {
  if (e.key === 'Control') { G.ctrl = true; if (typing) typing.finish(); advance(); }
  if (G.mgActive || !$('#logwin').classList.contains('hidden')) return;
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (typing) typing.finish(); else advance(); }
});
addEventListener('keyup', e => { if (e.key === 'Control') G.ctrl = false; });
addEventListener('wheel', e => { if (e.deltaY < 0 && !G.mgActive && !$('#textbox').classList.contains('hidden')) openLog(); });
setInterval(() => { if ((G.ctrl || G.skip) && !G.mgActive) { if (typing) typing.finish(); advance(); } }, 60);

// UIボタン
$('#ui').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; AU.se('click');
  const a = b.dataset.act;
  if (a === 'auto') { G.auto = !G.auto; b.classList.toggle('on', G.auto); if (G.auto && !typing) advance(); }
  if (a === 'skip') { G.skip = !G.skip; b.classList.toggle('on', G.skip); }
  if (a === 'log') openLog();
  if (a === 'mute') { const m = AU.toggleMute(); b.classList.toggle('on', m); b.textContent = m ? 'MUTE' : 'SOUND'; }
  if (a === 'title') { if (confirm('タイトルに戻りますか？（この章のはじめから再開できます）')) location.reload(); }
});
function openLog() {
  const inner = $('#loginner');
  inner.innerHTML = G.log.slice(-200).map(l => `<div class="ln">${l.name ? `<span class="nm">${l.name}</span>` : ''}${l.text}</div>`).join('');
  $('#logwin').classList.remove('hidden'); inner.scrollTop = inner.scrollHeight;
}
$('#logclose').onclick = () => $('#logwin').classList.add('hidden');

// ---------- テキスト ----------
let typing = null;
function fmt(s) { return s.replace(/\*\*(.+?)\*\*/g, '<span class="em">$1</span>').replace(/##(.+?)##/g, '<span class="big">$1</span>'); }
function typeText(el, html) {
  return new Promise(res => {
    const parts = html.split(/(<[^>]+>)/).filter(Boolean);
    const tokens = []; parts.forEach(p => { if (p[0] === '<') tokens.push(p); else tokens.push(...p); });
    let i = 0, out = '', timer;
    const done = () => { clearInterval(timer); el.innerHTML = html; typing = null; res(); };
    typing = { finish: done };
    if (G.skip || G.ctrl) { done(); return; }
    timer = setInterval(() => {
      for (let k = 0; k < 1 && i < tokens.length; k++) { out += tokens[i]; if (tokens[i][0] === '<') k--; i++; }
      el.innerHTML = out;
      if (i % 3 === 0) AU.se('blip');
      if (i >= tokens.length) done();
    }, G.speed);
  });
}
async function say(name, text, o = {}) {
  const tb = $('#textbox'); tb.classList.remove('hidden'); $('#ui').classList.remove('hidden');
  $('#nametag').textContent = name || '';
  tb.classList.toggle('mono', !name);
  const id = name ? NAME2ID[name] : null;
  if (o.nofocus) { } else if (id && chars[id]) { focusChar(id); if (o.hop !== false && Math.random() < 0.25) anim(id, 'hop'); } else if (!name) focusChar(null); else focusChar('__none');
  const html = fmt(text);
  G.log.push({ name, text: html });
  $('#next').classList.remove('on');
  await typeText($('#text'), html);
  $('#next').classList.add('on');
  await waitAdvance(1200 + text.length * 70);
  $('#next').classList.remove('on');
}
const t = (name, text, o) => say(name, text, o);
const n = (text, o) => say('', text, o);
function textHide() { $('#textbox').classList.add('hidden'); $('#ui').classList.add('hidden'); }

// ---------- 演出 ----------
const wait = ms => new Promise(r => setTimeout(r, (G.skip || G.ctrl) ? Math.min(ms, 80) : ms));
function bg(name, opts) { BG.set(name, opts); }
async function fadeBg(name, opts, ms = 500, color = '#000') { const f = $('#flash'); f.style.background = color; f.style.transition = `opacity ${ms}ms`; f.style.opacity = 1; await wait(ms); BG.set(name, opts); await wait(80); f.style.opacity = 0; await wait(ms); }
async function flash(color = '#fff', ms = 400) { const f = $('#flash'); f.style.background = color; f.style.transition = 'none'; f.style.opacity = 1; void f.offsetWidth; f.style.transition = `opacity ${ms}ms`; f.style.opacity = 0; }
async function blackout(on, ms = 600) { const f = $('#flash'); f.style.background = '#000'; f.style.transition = `opacity ${ms}ms`; f.style.opacity = on ? 1 : 0; await wait(ms); }
function shake(ms = 400, amp = 12) {
  const s0 = stage.style.transform; const t0 = performance.now();
  const iv = setInterval(() => { const k = 1 - (performance.now() - t0) / ms; if (k <= 0) { clearInterval(iv); fit(); return; } fit(); stage.style.transform += ` translate(${(Math.random() - .5) * amp * k * 2}px,${(Math.random() - .5) * amp * k * 2}px)`; }, 16);
}
const fx = $('#fxcanvas').getContext('2d');
function glitch(ms = 600) {
  AU.se('glitch'); const t0 = performance.now();
  const step = () => {
    const e = performance.now() - t0; fx.clearRect(0, 0, 1280, 720); if (e > ms) return;
    for (let i = 0; i < 14; i++) { const y = Math.random() * 720, h = 4 + Math.random() * 30; fx.fillStyle = ['rgba(255,0,120,.35)', 'rgba(0,255,255,.35)', 'rgba(255,255,255,.2)'][i % 3]; fx.fillRect((Math.random() - .5) * 60, y, 1280, h); }
    requestAnimationFrame(step);
  }; step();
}
async function sys(text, cls = '', o = {}) {
  const el = document.createElement('div'); el.className = 'sysmsg ' + cls; el.innerHTML = text; $('#sys').appendChild(el);
  AU.se(cls === 'red' ? 'error' : 'glitch');
  G.log.push({ name: 'SYSTEM', text });
  if (o.noWait) return el;
  if (o.ms) await wait(o.ms); else { textHide(); await waitAdvance(1800); }
  if (!o.keep) el.remove();
  return el;
}
function sysClear() { $('#sys').innerHTML = ''; }
async function card(num, title) {
  textHide(); hideAll();
  const c = $('#card'); c.innerHTML = `<div class="num">${num}</div><div class="ttl">${title}</div><div class="line"></div>`;
  c.classList.remove('on'); void c.offsetWidth; c.classList.add('on'); AU.se('chime');
  await wait(3200); c.classList.remove('on');
}
function choice(opts) {
  return new Promise(res => {
    const box = $('#choices'); box.innerHTML = ''; box.classList.add('on');
    G.skip = false; $('#ui [data-act=skip]').classList.remove('on');
    opts.forEach((o, i) => { const b = document.createElement('button'); b.innerHTML = o; b.onclick = (e) => { e.stopPropagation(); AU.se('select'); box.classList.remove('on'); box.innerHTML = ''; G.log.push({ name: '▶', text: o }); res(i); }; box.appendChild(b); });
  });
}

// ---------- ミニゲーム枠 ----------
const MG = {};
function mgOpen() {
  G.mgActive = true; textHide();
  const root = $('#mg'); root.innerHTML = ''; root.classList.add('on');
  const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720; root.appendChild(cv);
  const hud = document.createElement('div'); hud.className = 'mg-hud'; root.appendChild(hud);
  const m = { root, cv, ctx: cv.getContext('2d'), hud, keys: {}, onkey: null, onkeyup: null, onclick: null, onmove: null, mouse: { x: 640, y: 360, down: false }, raf: 0 };
  m.kd = e => { if (document.activeElement && document.activeElement.tagName === 'INPUT') return; m.keys[e.code] = true; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); if (m.onkey && !e.repeat) m.onkey(e); };
  m.ku = e => { m.keys[e.code] = false; if (m.onkeyup) m.onkeyup(e); };
  m.md = e => { const p = stagePos(e); m.mouse.x = p.x; m.mouse.y = p.y; m.mouse.down = true; if (m.onclick && e.target === cv) m.onclick(p, e); };
  m.mu = () => { m.mouse.down = false; };
  m.mm = e => { const p = stagePos(e); m.mouse.x = p.x; m.mouse.y = p.y; if (m.onmove) m.onmove(p); };
  m.cm = e => { if (G.mgActive) e.preventDefault(); };
  addEventListener('keydown', m.kd); addEventListener('keyup', m.ku); cv.addEventListener('mousedown', m.md); addEventListener('mouseup', m.mu); addEventListener('mousemove', m.mm); cv.addEventListener('contextmenu', m.cm);
  m.run = fn => new Promise(res => {
    let last = performance.now();
    const step = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; const r = fn(dt, now / 1000); if (r !== undefined) { m.reset(); res(r); } else m.raf = requestAnimationFrame(step); };
    m.raf = requestAnimationFrame(step);
  });
  m.reset = () => { cancelAnimationFrame(m.raf); m.onkey = m.onkeyup = m.onclick = m.onmove = null; m.keys = {}; m.hud.innerHTML = ''; m.root.querySelectorAll('.mg-extra').forEach(e => e.remove()); };
  m.close = () => { m.reset(); removeEventListener('keydown', m.kd); removeEventListener('keyup', m.ku); removeEventListener('mouseup', m.mu); removeEventListener('mousemove', m.mm); root.classList.remove('on'); root.innerHTML = ''; G.mgActive = false; };
  m.extra = (html, css = '') => { const d = document.createElement('div'); d.className = 'mg-extra'; d.style.cssText = 'position:absolute;' + css; d.innerHTML = html; root.appendChild(d); return d; };
  return m;
}
function mgPanel(m, { title, sub = '', lines = [], buttons = [{ label: 'スタート', value: 'start' }] }) {
  return new Promise(res => {
    const p = document.createElement('div'); p.className = 'mg-panel';
    p.innerHTML = `<h2>${sub}</h2><h1>${title}</h1>${lines.map(l => `<p>${l}</p>`).join('')}<div class="btns"></div>`;
    buttons.forEach(b => { const btn = document.createElement('button'); btn.className = 'mg-btn' + (b.sub ? ' sub' : ''); btn.textContent = b.label; btn.onclick = () => { AU.se('select'); p.remove(); removeEventListener('keydown', kh); res(b.value); }; p.querySelector('.btns').appendChild(btn); });
    const kh = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.querySelector('.mg-btn').click(); } };
    setTimeout(() => addEventListener('keydown', kh), 300);
    m.root.appendChild(p);
  });
}
// intro → play → (失敗ならリトライ/スキップ) → 結果
async function minigame(def) {
  if (G.skip || G.ctrl) { G.skip = false; G.ctrl = false; $('#ui [data-act=skip]').classList.remove('on'); }
  const m = mgOpen();
  await mgPanel(m, { title: def.title, sub: def.sub, lines: def.lines });
  let fails = 0, res;
  while (true) {
    res = await def.play(m, fails);
    if (res && res.ok) break;
    fails++;
    AU.se('fail');
    const btns = [{ label: 'もう一度', value: 'retry' }];
    if (fails >= (def.skipAfter ?? 2)) btns.push({ label: 'スキップして進む', value: 'skip', sub: true });
    const v = await mgPanel(m, { title: (res && res.failTitle) || 'しっぱい…', sub: 'MISSION FAILED', lines: [(res && res.msg) || 'もう一回いってみよう！'], buttons: btns });
    if (v === 'skip') { res = { ok: true, skipped: true }; break; }
  }
  if (!res.skipped && !def.noResult) { AU.se('clear'); await mgPanel(m, { title: res.title || 'クリア！', sub: 'MISSION COMPLETE', lines: res.lines || [], buttons: [{ label: 'つぎへ', value: 1 }] }); }
  m.close();
  return res;
}

// ---------- 汎用描画ヘルパ ----------
function drawSprite(c, name, cx, bottom, h, o = {}) {
  const im = IMG[name]; if (!im) return null;
  const w = im.width * h / im.height;
  c.save();
  if (o.alpha !== undefined) c.globalAlpha = o.alpha;
  if (o.filter) c.filter = o.filter;
  if (o.flip) { c.translate(cx, 0); c.scale(-1, 1); c.drawImage(im, -w / 2, bottom - h, w, h); }
  else c.drawImage(im, cx - w / 2, bottom - h, w, h);
  c.restore();
  return { x: cx - w / 2, y: bottom - h, w, h };
}
function txt(c, s, x, y, o = {}) {
  c.save(); c.font = `${o.w || 800} ${o.size || 24}px ${o.font || '"Yu Gothic UI","Meiryo",sans-serif'}`; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 12; }
  if (o.stroke) { c.lineWidth = o.sw || 5; c.strokeStyle = o.stroke; c.strokeText(s, x, y); }
  c.fillStyle = o.color || '#fff'; c.fillText(s, x, y); c.restore();
}
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
// 黒づくめの雑魚（ブラックアビス構成員）
function grunt(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s);
  const col = o.col || '#120a1c';
  c.fillStyle = col;
  c.beginPath(); c.moveTo(-34, 0); c.lineTo(-28, -90); c.quadraticCurveTo(0, -110, 28, -90); c.lineTo(34, 0); c.fill();
  c.beginPath(); c.arc(0, -118, 24, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-26, -112); c.quadraticCurveTo(0, -158, 26, -112); c.fill();
  c.fillStyle = o.eye || '#c060ff'; c.fillRect(-14, -122, 10, 4); c.fillRect(4, -122, 10, 4);
  if (o.gun !== false) { c.fillStyle = '#333'; c.fillRect(18, -70, 46, 10); c.fillRect(22, -62, 10, 18); }
  c.restore();
}
