// ===== 背景：コードで描画（bg/名前.jpg か .png を置くと差し替わる） =====
const BG = (() => {
  const W = 1280, H = 720;
  const cv = document.getElementById('bg');
  const ctx = cv.getContext('2d');
  let scene = 'black', st = {}, staticLayer = null, override = null, tint = null, t0 = performance.now();
  const overrides = {};

  function R(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function grad(c, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
  function moon(c, x, y, r, col = '#fff6dd', glow = '#ffe9a8') {
    const g = c.createRadialGradient(x, y, r * 0.8, x, y, r * 3); g.addColorStop(0, glow + 'aa'); g.addColorStop(1, glow + '00');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = 'rgba(200,190,160,.25)'; [[-.3, -.2, .2], [.25, .1, .15], [-.05, .35, .12]].forEach(([a, b, s]) => { c.beginPath(); c.arc(x + a * r, y + b * r, s * r, 0, 7); c.fill(); });
  }
  function stars(c, r, n, yMax) { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; const s = r() * 1.8 + 0.4; c.fillRect(r() * W, r() * yMax, s, s); } }
  function skyline(c, r, baseY, col, winCols, minH, maxH, wMin = 40, wMax = 110, winP = 0.25) {
    let x = -20;
    while (x < W + 20) {
      const w = wMin + r() * (wMax - wMin), h = minH + r() * (maxH - minH);
      c.fillStyle = col; c.fillRect(x, baseY - h, w, h + 2);
      if (r() < 0.3) { c.fillRect(x + w * 0.4, baseY - h - 20, 3, 20); }
      for (let wy = baseY - h + 8; wy < baseY - 6; wy += 12) for (let wx = x + 5; wx < x + w - 6; wx += 10) if (r() < winP) { c.fillStyle = winCols[Math.floor(r() * winCols.length)]; c.fillRect(wx, wy, 5, 6); }
      x += w + r() * 6;
    }
  }
  function neon(c, text, x, y, size, col, vertical, a = 1) {
    c.save(); c.globalAlpha = a; c.font = `900 ${size}px "Yu Gothic UI","Meiryo",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = col; c.shadowBlur = 18; c.fillStyle = col;
    if (vertical) [...text].forEach((ch, i) => c.fillText(ch, x, y + i * size * 1.05)); else c.fillText(text, x, y);
    c.shadowBlur = 0; c.fillStyle = '#fff'; c.globalAlpha = a * 0.7;
    if (vertical) [...text].forEach((ch, i) => c.fillText(ch, x, y + i * size * 1.05)); else c.fillText(text, x, y);
    c.restore();
  }
  function pole(c, x, base, h, col = '#1a1426') {
    c.fillStyle = col; c.fillRect(x - 9, base - h, 18, h);
    c.fillRect(x - 60, base - h + 30, 120, 8); c.fillRect(x - 45, base - h + 70, 90, 7);
    c.fillStyle = '#2b2440'; c.fillRect(x - 22, base - h + 110, 44, 36);
    c.strokeStyle = 'rgba(20,15,30,.9)'; c.lineWidth = 2;
    [[-55, 34], [55, 34], [-40, 73], [40, 73]].forEach(([dx, dy]) => { c.beginPath(); c.moveTo(x + dx, base - h + dy); c.quadraticCurveTo(x + dx - 300, base - h + dy + 60, x + dx - 700, base - h + dy - 20); c.stroke(); c.beginPath(); c.moveTo(x + dx, base - h + dy); c.quadraticCurveTo(x + dx + 200, base - h + dy + 50, x + dx + 600, base - h + dy + 10); c.stroke(); });
  }
  function cat(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 22 * s, 15 * s, 0, 0, 7); c.fill();
    c.beginPath(); c.arc(x - 18 * s, y - 14 * s, 11 * s, 0, 7); c.fill();
    c.beginPath(); c.moveTo(x - 27 * s, y - 20 * s); c.lineTo(x - 25 * s, y - 33 * s); c.lineTo(x - 19 * s, y - 23 * s); c.fill();
    c.beginPath(); c.moveTo(x - 16 * s, y - 23 * s); c.lineTo(x - 10 * s, y - 32 * s); c.lineTo(x - 9 * s, y - 19 * s); c.fill();
    c.lineWidth = 5 * s; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 20 * s, y); c.quadraticCurveTo(x + 38 * s, y - 4 * s, x + 32 * s, y - 26 * s); c.stroke();
  }
  function mendako(c, x, y, s, col = '#ff7fae') {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 30, 20, 0, Math.PI, 0); c.lineTo(30, 4);
    for (let i = 0; i < 6; i++) c.quadraticCurveTo(25 - i * 10, 14, 20 - i * 10, 4);
    c.closePath(); c.fill();
    c.beginPath(); c.ellipse(-16, -16, 6, 9, -0.6, 0, 7); c.ellipse(16, -16, 6, 9, 0.6, 0, 7); c.fill();
    c.fillStyle = '#222'; c.beginPath(); c.arc(-9, -4, 2.6, 0, 7); c.arc(9, -4, 2.6, 0, 7); c.fill();
    c.restore();
  }
  function crowd(c, r, y, n, col, t = 0, bob = 0) {
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * W / n + (r() - 0.5) * 20; const s = 0.8 + r() * 0.5; const ph = r() * 6;
      const yy = y + Math.sin(t * 8 + ph) * bob * (r() < 0.6 ? 1 : 0.3);
      c.fillStyle = col; c.beginPath(); c.arc(x, yy - 52 * s, 17 * s, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x, yy + 10 * s, 30 * s, 52 * s, 0, 0, 7); c.fill();
      if (bob && r() < 0.35) { c.lineWidth = 8 * s; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 18 * s, yy - 20 * s); c.lineTo(x + 30 * s, yy - 80 * s - Math.sin(t * 8 + ph) * 12); c.stroke(); }
    }
  }
  function windowFrame(c, x, y, w, h, light, frame = '#3a3348') {
    c.fillStyle = light; c.fillRect(x, y, w, h);
    c.strokeStyle = frame; c.lineWidth = 8; c.strokeRect(x, y, w, h);
    c.lineWidth = 4; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke();
  }

  // ---------------- シーン定義 ----------------
  const S = {};
  S.black = { draw(c) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); } };
  S.white = { draw(c) { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); } };

  S.alley = {
    stat(c) {
      const r = R(12);
      c.fillStyle = grad(c, 0, H, ['#07031a', '#1d0b3a', '#3a1550']); c.fillRect(0, 0, W, H);
      stars(c, r, 80, 250); moon(c, 1010, 110, 42);
      skyline(c, r, 470, '#140a26', ['#ff5fa8', '#5ff2ff', '#ffd84a'], 120, 300, 40, 90, 0.18);
      // 左右の壁
      c.fillStyle = '#120b20'; c.beginPath(); c.moveTo(0, 0); c.lineTo(400, 140); c.lineTo(400, 560); c.lineTo(0, 720); c.fill();
      c.fillStyle = '#100a1c'; c.beginPath(); c.moveTo(W, 0); c.lineTo(860, 160); c.lineTo(860, 560); c.lineTo(W, 720); c.fill();
      for (let i = 0; i < 9; i++) { c.fillStyle = r() < 0.5 ? '#2c1a40' : '#ffcf6a55'; c.fillRect(40 + (i % 3) * 110, 140 + Math.floor(i / 3) * 120, 50, 60); }
      // 地面
      c.fillStyle = grad(c, 560, H, ['#1a1030', '#06040c']); c.beginPath(); c.moveTo(400, 560); c.lineTo(860, 560); c.lineTo(W, 720); c.lineTo(0, 720); c.fill();
      c.strokeStyle = 'rgba(255,90,170,.18)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(630, 560); c.lineTo(-200 + i * 330, 720); c.stroke(); }
      // ゴミ箱・室外機
      c.fillStyle = '#1e1630'; c.fillRect(300, 520, 70, 60); c.fillRect(880, 500, 90, 70); c.fillStyle = '#2f2448'; c.fillRect(890, 510, 70, 50);
      pole(c, 960, 640, 560);
      st.signs = [['電脳', 90, 120, 44, '#ff4fa8', true], ['ラーメン', 300, 210, 30, '#5ff2ff', true], ['VR', 1180, 200, 60, '#ffd84a', false], ['月見', 1060, 330, 40, '#a37bff', true], ['BAR', 520, 380, 30, '#ff7b4a', false]];
    },
    anim(c, t) {
      st.signs.forEach((s, i) => { const fl = (Math.sin(t * 13 + i * 7) > 0.92 || (i === 1 && Math.sin(t * 2.3) > 0.7)) ? 0.25 : 1; neon(c, s[0], s[1], s[2], s[3], s[4], s[5], fl); });
      if (st.rainbow) {
        const hue = (t * 160) % 360; const x = 960, y = 360;
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 12; i++) { const a = t * 0.6 + i * Math.PI / 6; c.fillStyle = `hsla(${(hue + i * 30) % 360},100%,60%,.10)`; c.beginPath(); c.moveTo(x, y); c.arc(x, y, 900, a, a + 0.18); c.fill(); }
        const g = c.createRadialGradient(x, y, 10, x, y, 260); g.addColorStop(0, `hsla(${hue},100%,80%,.9)`); g.addColorStop(1, `hsla(${hue},100%,60%,0)`); c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.restore();
        c.fillStyle = `hsl(${hue},100%,70%)`; c.shadowColor = c.fillStyle; c.shadowBlur = 40; c.fillRect(951, 80, 18, 560); c.shadowBlur = 0;
      }
      c.strokeStyle = 'rgba(170,190,255,.25)'; c.lineWidth = 1;
      const r = R(Math.floor(t * 30)); for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y + 18); c.stroke(); }
    }
  };

  S.hideout = {
    stat(c) {
      const r = R(5);
      c.fillStyle = grad(c, 0, H, ['#0a0c1c', '#11142a', '#05060e']); c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(80,120,255,.07)'; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 520); c.stroke(); }
      windowFrame(c, 70, 90, 220, 260, grad(c, 90, 350, ['#140a30', '#3a1a5a']));
      moon(c, 180, 170, 26);
      c.fillStyle = '#222842'; c.fillRect(0, 520, W, 200); c.fillStyle = '#2d3557'; c.fillRect(250, 470, 820, 30);
      st.mons = [[300, 150, 330, 220], [650, 120, 360, 250], [1030, 170, 210, 180]];
      st.mons.forEach(([x, y, w, h]) => { c.fillStyle = '#05070f'; c.fillRect(x - 10, y - 10, w + 20, h + 20); c.fillStyle = '#0a1a22'; c.fillRect(x, y, w, h); c.fillStyle = '#05070f'; c.fillRect(x + w / 2 - 10, y + h + 10, 20, 470 - y - h - 10); });
      // お菓子とエナドリ
      c.fillStyle = '#ff4fa8'; c.fillRect(1000, 440, 22, 30); c.fillStyle = '#5ff2ff'; c.fillRect(1030, 446, 18, 24); c.fillStyle = '#ffd84a'; c.fillRect(300, 448, 60, 22);
      c.fillStyle = '#151a30'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(200 + i * 150, 520); c.bezierCurveTo(240 + i * 150, 600, 120 + i * 150, 640, 260 + i * 150, 720); c.lineWidth = 6; c.strokeStyle = '#0d1020'; c.stroke(); }
      // ポスター
      c.fillStyle = '#ff7fae'; c.fillRect(1120, 380, 110, 80); neon(c, 'HACK', 1175, 420, 26, '#fff', false);
    },
    anim(c, t) {
      st.mons.forEach(([x, y, w, h], m) => {
        c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
        c.font = '13px Consolas, monospace';
        const r = R(m * 99 + 3);
        const off = (t * 40 * (m + 1)) % 16;
        for (let i = 0; i < h / 16 + 2; i++) {
          const line = Math.floor(t * 2.5 * (m + 1)) + i; const rr = R(line * 31 + m);
          const len = 4 + Math.floor(rr() * 30);
          c.fillStyle = ['#5ff2ff', '#8aff9a', '#ff7fae', '#ffd84a'][Math.floor(rr() * 4)];
          let s = ''; for (let k = 0; k < len; k++) s += 'abcdefghijklmnopqrstuvwxyz(){};=<>+-*/0123456789'[Math.floor(rr() * 49)];
          c.fillText(s, x + 8 + rr() * 20, y + 14 + i * 16 - off);
        }
        if (m === 1 && st.cam) { c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x + 60, y + 40, w - 120, h - 80); c.strokeStyle = '#f35'; c.strokeRect(x + 60, y + 40, w - 120, h - 80); c.fillStyle = '#f35'; c.fillText('● REC  CAM-07', x + 68, y + 56); c.fillStyle = '#fff'; c.beginPath(); const px = x + 120 + (t * 40 % (w - 200)); c.arc(px, y + 140, 8, 0, 7); c.fill(); c.fillRect(px - 4, y + 148, 8, 22); c.fillStyle = '#aaa'; c.fillText('芦花', px - 12, y + 186); }
        c.restore();
        c.fillStyle = 'rgba(95,242,255,.06)'; c.fillRect(x - 30, y - 30, w + 60, h + 60);
      });
      if (Math.sin(t * 5) > 0) { c.fillStyle = '#3f6'; c.fillRect(260, 480, 6, 6); }
    }
  };

  S.vrcity = {
    stat(c) {
      const r = R(8);
      c.fillStyle = grad(c, 0, 420, ['#02101c', '#06304a', '#1b6b8a']); c.fillRect(0, 0, W, 420);
      stars(c, r, 60, 200);
      for (let i = 0; i < 14; i++) { const x = r() * W, w = 50 + r() * 120, h = 120 + r() * 260; c.fillStyle = 'rgba(8,30,50,.9)'; c.fillRect(x, 420 - h, w, h); c.strokeStyle = r() < 0.5 ? '#5ff2ff' : '#ff5fa8'; c.lineWidth = 1.5; c.strokeRect(x, 420 - h, w, h); }
      c.fillStyle = '#02070f'; c.fillRect(0, 420, W, 300);
      c.strokeStyle = 'rgba(95,242,255,.5)'; c.lineWidth = 1.5;
      for (let i = -20; i <= 20; i++) { c.beginPath(); c.moveTo(640, 420); c.lineTo(640 + i * 120, 720); c.stroke(); }
      for (let i = 0; i < 12; i++) { const y = 420 + Math.pow(i / 12, 2) * 300; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      [200, 1080].forEach(x => pole(c, x, 600, 470, '#0d2233'));
    },
    anim(c, t) {
      neon(c, "it'a true wolrd", 640, 120, 46, '#5ff2ff', false, 0.6 + 0.4 * Math.sin(t * 2));
      neon(c, 'TUKIMI', 980, 230, 28, '#ff5fa8', false, Math.sin(t * 11) > 0.9 ? 0.2 : 1);
      for (let i = 0; i < 8; i++) { const x = (i * 173 + t * 20) % W, y = 260 + Math.sin(t + i) * 30; c.strokeStyle = '#a8ffcf'; c.lineWidth = 2; c.save(); c.translate(x, y); c.rotate(t + i); c.strokeRect(-12, -12, 24, 24); c.restore(); }
    }
  };

  S.ruin = {
    stat(c) {
      const r = R(21);
      c.fillStyle = grad(c, 0, H, ['#1a1d26', '#272a33', '#121318']); c.fillRect(0, 0, W, H);
      for (let i = 0; i < 3; i++) { const x = 160 + i * 380; c.fillStyle = '#0b0d14'; c.fillRect(x, 120, 220, 220); c.fillStyle = 'rgba(120,140,190,.35)'; c.beginPath(); c.moveTo(x, 120); c.lineTo(x + 220, 120); c.lineTo(x + 220, 200); c.lineTo(x + 150, 260); c.lineTo(x + 80, 200); c.lineTo(x, 300); c.fill(); }
      [100, 560, 1000].forEach(x => { c.fillStyle = '#30333d'; c.fillRect(x, 0, 60, 560); c.fillStyle = '#23252d'; c.fillRect(x + 44, 0, 16, 560); });
      c.fillStyle = '#16171d'; c.fillRect(0, 540, W, 180);
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${60 + r() * 40},${60 + r() * 40},${70 + r() * 40},1)`; const x = r() * W, y = 560 + r() * 150, s = 6 + r() * 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s, y + s * 0.3); c.lineTo(x + s * 0.4, y - s * 0.5); c.fill(); }
      c.save(); c.font = '900 64px sans-serif'; c.fillStyle = 'rgba(160,80,255,.35)'; c.rotate(-0.08); c.fillText('ABYSS', 700, 470); c.restore();
      c.strokeStyle = '#0a0a0e'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); let x = r() * W, y = r() * 400; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 60; y += 20 + r() * 20; c.lineTo(x, y); } c.stroke(); }
    },
    anim(c, t) {
      if (!st.holy) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) { const x = 160 + i * 380; c.fillStyle = 'rgba(150,170,220,.05)'; c.beginPath(); c.moveTo(x, 120); c.lineTo(x + 220, 120); c.lineTo(x + 380, 720); c.lineTo(x + 60, 720); c.fill(); }
        c.restore();
        const r = R(4); for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(220,220,255,.4)'; c.fillRect((r() * W + t * 8 * (r() + .2)) % W, (r() * H + Math.sin(t + i) * 10) % H, 2, 2); }
        return;
      }
      const k = Math.min(1, (t - st.holyT) / 4);
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(640, 0, 30, 640, 0, 900); g.addColorStop(0, `rgba(255,250,220,${0.9 * k})`); g.addColorStop(1, 'rgba(255,220,240,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) { const a = Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.6 + (i - 7) * 0.08; c.fillStyle = `rgba(255,240,200,${0.06 * k})`; c.beginPath(); c.moveTo(640, -20); c.lineTo(640 + Math.cos(a - 0.03) * 1400, Math.sin(a - 0.03) * 1400); c.lineTo(640 + Math.cos(a + 0.03) * 1400, Math.sin(a + 0.03) * 1400); c.fill(); }
      c.restore();
      // 水たまり→大海
      const wy = 720 - 160 * k;
      c.fillStyle = `rgba(60,140,220,${0.75 * k})`; c.beginPath(); c.moveTo(0, wy);
      for (let x = 0; x <= W; x += 20) c.lineTo(x, wy + Math.sin(x * 0.02 + t * 2) * 8); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      // 花
      const r = R(77); for (let i = 0; i < 26; i++) { const x = r() * W, y = 470 + r() * 90, s = Math.min(1, Math.max(0, k * 2 - r())) * (8 + r() * 10); const hue = [330, 50, 200, 280][i % 4]; for (let p = 0; p < 5; p++) { c.fillStyle = `hsl(${hue},90%,75%)`; c.beginPath(); c.arc(x + Math.cos(p * 1.26 + t * 0.2) * s, y + Math.sin(p * 1.26 + t * 0.2) * s, s * 0.7, 0, 7); c.fill(); } c.fillStyle = '#fff6a0'; c.beginPath(); c.arc(x, y, s * 0.5, 0, 7); c.fill(); }
      for (let i = 0; i < 5; i++) mendako(c, (i * 300 + t * 40 * (i % 2 ? 1 : -1) + 2000) % (W + 200) - 100, wy + 40 + i * 18 + Math.sin(t * 2 + i) * 10, 0.8 + (i % 3) * 0.3);
    }
  };

  S.cafe = {
    stat(c) {
      const r = R(33);
      c.fillStyle = '#ffd6e6'; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,140,190,.25)'; for (let y = 20; y < 460; y += 60) for (let x = (y / 60 % 2) * 40; x < W; x += 80) { c.beginPath(); c.arc(x - 6, y, 8, 0, 7); c.arc(x + 6, y, 8, 0, 7); c.moveTo(x - 14, y + 3); c.lineTo(x, y + 18); c.lineTo(x + 14, y + 3); c.fill(); }
      c.fillStyle = '#c96f95'; c.fillRect(0, 460, W, 12); c.fillStyle = '#f7b3cf'; c.fillRect(0, 472, W, 100);
      c.fillStyle = '#8f4a6b'; c.fillRect(0, 572, W, 148);
      windowFrame(c, 60, 80, 260, 240, grad(c, 80, 320, ['#7fc8ff', '#d9f1ff']), '#fff');
      c.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(70 + i * 22, 88, 12, 0, Math.PI); c.fill(); }
      // 棚と猫
      [[820, 200], [820, 330]].forEach(([x, y]) => { c.fillStyle = '#fff'; c.fillRect(x, y, 380, 12); });
      cat(c, 900, 186, 1.1, '#5a3a4a'); cat(c, 1100, 186, 0.9, '#fff3f8'); cat(c, 1000, 316, 1.2, '#f0a050'); cat(c, 1160, 316, 0.8, '#333');
      c.fillStyle = '#fff'; c.fillRect(420, 70, 330, 110); c.strokeStyle = '#ff5fa8'; c.lineWidth = 5; c.strokeRect(420, 70, 330, 110);
      c.fillStyle = '#ff3f8f'; c.font = '900 30px "Yu Gothic UI",sans-serif'; c.textAlign = 'center'; c.fillText('男の娘メイド猫カフェ', 585, 115); c.font = '700 22px sans-serif'; c.fillText('♡ にゃんにゃん月見亭 ♡', 585, 155); c.textAlign = 'left';
      [500, 700, 900].forEach(x => { c.strokeStyle = '#8f4a6b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 30); c.stroke(); c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(x, 40, 16, 0, 7); c.fill(); });
    },
    anim(c, t) {
      for (let i = 0; i < 10; i++) { const x = (i * 137) % W, y = H - ((t * 30 + i * 90) % H); c.fillStyle = `rgba(255,90,160,${0.25 + 0.2 * Math.sin(t + i)})`; c.font = '28px sans-serif'; c.fillText('♡', x + Math.sin(t + i) * 20, y); }
    }
  };
  S.caferoom = {
    stat(c) {
      c.fillStyle = grad(c, 0, H, ['#4a2040', '#6a2c58', '#2a1024']); c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,120,190,.12)'; for (let x = 0; x < W; x += 50) c.fillRect(x, 0, 24, 500);
      c.fillStyle = '#2a0f22'; c.fillRect(1020, 140, 200, 400); c.fillStyle = '#c99'; c.beginPath(); c.arc(1050, 340, 8, 0, 7); c.fill();
      c.fillStyle = '#3a1530'; c.fillRect(0, 500, W, 220);
      c.fillStyle = '#802050'; c.fillRect(120, 380, 520, 130); c.fillStyle = '#a03068'; c.fillRect(100, 340, 560, 60);
      c.fillStyle = '#ffd6e6'; c.fillRect(260, 130, 200, 150); cat(c, 360, 230, 1.6, '#5a3a4a');
      c.strokeStyle = '#c96f95'; c.lineWidth = 8; c.strokeRect(260, 130, 200, 150);
    },
    anim(c, t) { const a = 0.15 + Math.sin(t * 1.5) * 0.03; const g = c.createRadialGradient(700 + Math.sin(t) * 20, 60, 10, 700, 60, 600); g.addColorStop(0, `rgba(255,220,180,${a * 2})`); g.addColorStop(1, 'rgba(255,200,180,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  };

  S.prison = {
    stat(c) {
      c.fillStyle = grad(c, 0, H, ['#050816', '#0b1230', '#03040a']); c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(80,140,255,.15)'; c.lineWidth = 1.5;
      for (let y = 0; y < 560; y += 42) for (let x = (y / 42 % 2) * 36; x < W; x += 72) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.lineTo(x + Math.cos(a) * 24, y + Math.sin(a) * 24); } c.closePath(); c.stroke(); }
      c.fillStyle = '#0a0e1e'; c.fillRect(0, 560, W, 160); c.fillStyle = '#1a2040'; c.fillRect(100, 470, 380, 40); c.fillRect(120, 510, 20, 50); c.fillRect(440, 510, 20, 50);
      neon(c, '月見刑務所', 640, 60, 34, '#ff4f6a', false);
      neon(c, 'TSUKIMI PRISON  ─  LOGOUT : DISABLED', 640, 105, 16, '#7fa0ff', false);
    },
    anim(c, t) {
      if (st.open) return;
      for (let i = 0; i < 14; i++) { const x = 60 + i * 88; const a = 0.6 + 0.4 * Math.sin(t * 9 + i); c.fillStyle = `rgba(255,40,80,${a})`; c.shadowColor = '#f24'; c.shadowBlur = 16; c.fillRect(x, 130, 5, 560); }
      c.shadowBlur = 0;
      const sy = 130 + ((t * 120) % 560); c.fillStyle = 'rgba(255,60,90,.15)'; c.fillRect(0, sy, W, 6);
    }
  };

  S.hq = {
    stat(c) {
      const r = R(41);
      c.fillStyle = grad(c, 0, H, ['#08020f', '#1a0628', '#050008']); c.fillRect(0, 0, W, H);
      [80, 300, 960, 1180].forEach(x => { c.fillStyle = '#140820'; c.fillRect(x - 30, 0, 60, 600); c.fillStyle = '#4a1a6a'; c.fillRect(x - 40, 60, 80, 220); c.fillStyle = '#a14fff'; c.beginPath(); c.moveTo(x - 40, 280); c.lineTo(x, 320); c.lineTo(x + 40, 280); c.fill(); });
      const g = c.createRadialGradient(640, 230, 10, 640, 230, 170); g.addColorStop(0, '#000'); g.addColorStop(0.7, '#1a0030'); g.addColorStop(1, 'rgba(160,80,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(640, 230, 170, 0, 7); c.fill();
      c.strokeStyle = '#a14fff'; c.lineWidth = 4; c.beginPath(); c.arc(640, 230, 130, 0, 7); c.stroke();
      c.beginPath(); c.ellipse(640, 230, 70, 34, 0, 0, 7); c.stroke(); c.fillStyle = '#c87fff'; c.beginPath(); c.arc(640, 230, 18, 0, 7); c.fill();
      neon(c, 'BLACK ABYSS', 640, 420, 34, '#c87fff', false);
      c.fillStyle = '#0c0414'; c.fillRect(0, 560, W, 160); c.fillStyle = '#1e0a30'; c.fillRect(200, 520, 880, 40);
    },
    anim(c, t) {
      if (st.live) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const cols = ['255,80,170', '95,242,255', '255,216,74', '168,255,207'];
        for (let i = 0; i < 4; i++) { const a = Math.PI / 2 + Math.sin(t * (1 + i * 0.3) + i * 2) * 0.6; const x = 160 + i * 320; c.fillStyle = `rgba(${cols[i]},.18)`; c.beginPath(); c.moveTo(x, -10); c.lineTo(x + Math.cos(a - 0.12) * 900, Math.sin(a - 0.12) * 900); c.lineTo(x + Math.cos(a + 0.12) * 900, Math.sin(a + 0.12) * 900); c.fill(); }
        c.restore();
        crowd(c, R(9), 690, 16, '#05000a', t, st.bob ?? 6);
        const r = R(Math.floor(t * 4)); for (let i = 0; i < 30; i++) { c.fillStyle = `hsl(${r() * 360},90%,70%)`; c.fillRect((r() * W + t * 50) % W, (r() * H + t * 120) % H, 6, 10); }
      } else {
        const r = R(Math.floor(t * 8)); if (r() < 0.1) { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(0, 0, W, H); }
        c.fillStyle = 'rgba(120,40,200,.08)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse((i * 300 + t * 20) % (W + 400) - 200, 640, 300, 60, 0, 0, 7); c.fill(); }
      }
    }
  };

  S.plaza = {
    stat(c) {
      const r = R(64);
      c.fillStyle = grad(c, 0, 440, ['#020518', '#0b1640', '#1a3a6a']); c.fillRect(0, 0, W, 440);
      stars(c, r, 140, 380); moon(c, 640, 150, 110, '#fff8e6', '#bfe0ff');
      c.fillStyle = grad(c, 440, H, ['#0a2448', '#020814']); c.fillRect(0, 440, W, 280);
      // 寺の舞台
      c.fillStyle = '#2a0d10'; c.fillRect(300, 300, 680, 160);
      c.fillStyle = '#1a0608'; c.beginPath(); c.moveTo(250, 310); c.lineTo(640, 220); c.lineTo(1030, 310); c.fill();
      c.fillStyle = '#c23a2a'; [330, 470, 810, 950].forEach(x => c.fillRect(x, 310, 18, 150));
      c.fillStyle = '#ffd896'; for (let i = 0; i < 8; i++) for (let k = 0; k < 3; k++) c.fillRect(520 + i * 30, 330 + k * 30, 22, 22);
      c.fillStyle = '#3a1612'; c.fillRect(260, 450, 760, 18);
      [180, 1100].forEach(x => { c.fillStyle = '#1a0608'; c.fillRect(x - 4, 330, 8, 130); });
    },
    anim(c, t) {
      for (let i = 0; i < 40; i++) { const x = (i * 97 + 13) % W; const y = 480 + (i * 37) % 220; c.fillStyle = `rgba(190,224,255,${0.2 + 0.2 * Math.sin(t * 2 + i)})`; c.fillRect(x + Math.sin(t + i) * 6, y, 30 + (i % 3) * 20, 2); }
      [180, 1100].forEach((x, i) => { const g = c.createRadialGradient(x, 320, 2, x, 320, 50); g.addColorStop(0, `rgba(255,190,110,${0.8 + 0.2 * Math.sin(t * 7 + i)})`); g.addColorStop(1, 'rgba(255,150,80,0)'); c.fillStyle = g; c.fillRect(x - 50, 270, 100, 100); });
      if (st.crowd) crowd(c, R(3), 720, 20, '#01030a', t, st.alarm ? 0 : 1);
      if (st.alarm) { c.fillStyle = `rgba(255,0,40,${0.18 + 0.12 * Math.sin(t * 6)})`; c.fillRect(0, 0, W, H); }
    }
  };

  S.logout = {
    draw(c, t) {
      c.fillStyle = grad(c, 0, H, ['#dff8ff', '#ffffff', '#ffe6f2']); c.fillRect(0, 0, W, H);
      const r = R(2); for (let i = 0; i < 120; i++) { const x = r() * W; const sp = 30 + r() * 80; const y = H - ((t * sp + r() * H) % (H + 40)); c.fillStyle = `rgba(${r() < .5 ? '95,200,255' : '255,120,190'},${0.3 + r() * 0.5})`; const s = 3 + r() * 6; c.fillRect(x, y, s, s); }
    }
  };

  S.realcity = {
    stat(c) {
      const r = R(90);
      c.fillStyle = grad(c, 0, 500, ['#6fb6ff', '#bfe3ff', '#f5fbff']); c.fillRect(0, 0, W, 500);
      skyline(c, r, 500, '#a9b7c9', ['#e6eef8'], 120, 300, 60, 140, 0.4);
      skyline(c, r, 520, '#8796ab', ['#d0dae6'], 60, 180, 80, 160, 0.3);
      c.fillStyle = '#7b7f86'; c.fillRect(0, 520, W, 200); c.fillStyle = '#9a9ea6'; c.fillRect(0, 520, W, 20);
      c.fillStyle = '#f4f4f4'; c.fillRect(300, 380, 680, 150); c.fillStyle = '#2d6be0'; c.fillRect(300, 380, 680, 16);
      c.fillStyle = '#333'; c.font = '900 30px "Yu Gothic UI",sans-serif'; c.textAlign = 'center'; c.fillText('（仮称）新・月見台ビル 新築工事', 640, 450); c.font = '18px sans-serif'; c.fillText('ご迷惑をおかけします', 640, 490); c.textAlign = 'left';
      c.strokeStyle = '#e8a200'; c.lineWidth = 6; c.beginPath(); c.moveTo(1050, 520); c.lineTo(1050, 120); c.lineTo(700, 120); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(760, 120); c.lineTo(760, 300); c.stroke(); for (let y = 140; y < 520; y += 30) { c.beginPath(); c.moveTo(1040, y); c.lineTo(1060, y + 30); c.stroke(); }
    },
    anim(c, t) { for (let i = 0; i < 5; i++) { const x = ((i * 300 + t * 12) % (W + 300)) - 150; c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.ellipse(x, 80 + i * 30, 70, 20, 0, 0, 7); c.ellipse(x + 40, 70 + i * 30, 50, 22, 0, 0, 7); c.fill(); } }
  };

  S.rooftop = {
    stat(c) {
      const r = R(55);
      c.fillStyle = grad(c, 0, H, ['#030418', '#151a48', '#3a2a5a']); c.fillRect(0, 0, W, H);
      stars(c, r, 200, 400); moon(c, 300, 140, 60);
      skyline(c, r, 600, '#0b0c22', ['#ffd77a', '#ff8fc5', '#8fe3ff'], 60, 240, 30, 80, 0.35);
      c.fillStyle = '#16162a'; c.fillRect(0, 600, W, 120);
      c.strokeStyle = '#3a3a5a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 560); c.lineTo(W, 560); c.stroke();
      for (let x = 20; x < W; x += 60) { c.beginPath(); c.moveTo(x, 560); c.lineTo(x, 610); c.stroke(); }
    },
    anim(c, t) { const r = R(5); for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 3 + i)})`; c.fillRect(r() * W, r() * 380, 2, 2); } }
  };

  S.room = {
    stat(c) {
      c.fillStyle = grad(c, 0, H, ['#1a1830', '#24203a', '#100e1c']); c.fillRect(0, 0, W, H);
      windowFrame(c, 760, 80, 360, 300, grad(c, 80, 380, ['#0a1030', '#2a2050']), '#c8c2d8');
      const r = R(12); skyline(c, r, 380, '#06081a', ['#ffd77a', '#8fe3ff'], 40, 160, 20, 50, 0.3);
      c.fillStyle = grad(c, 0, H, ['#1a1830', '#24203a', '#100e1c']); c.fillRect(0, 0, 756, H); c.fillRect(1124, 0, 200, H); c.fillRect(756, 0, 368, 76); c.fillRect(756, 384, 368, 400);
      windowFrame(c, 760, 80, 360, 300, 'rgba(0,0,0,0)', '#c8c2d8');
      c.fillStyle = '#3a3050'; c.fillRect(0, 520, W, 200); c.fillStyle = '#e8e0f0'; c.fillRect(60, 430, 520, 120); c.fillStyle = '#ffb3d1'; c.fillRect(60, 410, 140, 50);
      c.fillStyle = '#5a4a3a'; c.fillRect(820, 470, 360, 20); c.fillStyle = '#ffd96a'; c.beginPath(); c.arc(1110, 430, 40, Math.PI, 0); c.fill();
    },
    anim(c, t) { }
  };

  S.title = {
    stat(c) {
      const r = R(2026);
      c.fillStyle = grad(c, 0, H, ['#02010c', '#120a36', '#3a1450']); c.fillRect(0, 0, W, H);
      stars(c, r, 220, 600); moon(c, 330, 300, 170, '#fff8ea', '#bfa0ff');
      skyline(c, r, 720, '#08051a', ['#ff5fa8', '#5ff2ff', '#ffd84a'], 80, 260, 30, 90, 0.2);
    },
    anim(c, t) {
      for (let i = 0; i < 4; i++) mendako(c, ((i * 330 + t * 25) % (W + 200)) - 100, 160 + i * 110 + Math.sin(t * 1.5 + i) * 18, 0.6 + (i % 2) * 0.3, i % 2 ? '#ff7fae' : '#c7a0ff');
      const r = R(Math.floor(t * 6)); if (r() < 0.25) { c.fillStyle = `rgba(95,242,255,${r() * 0.3})`; c.fillRect(0, r() * H, W, 2 + r() * 8); }
    }
  };

  // ---------------- ループ ----------------
  function buildStatic() {
    staticLayer = null;
    const sc = S[scene];
    if (sc && sc.stat) { staticLayer = document.createElement('canvas'); staticLayer.width = W; staticLayer.height = H; sc.stat(staticLayer.getContext('2d')); }
  }
  function set(name, opts = {}) {
    scene = name; st = Object.assign({}, opts); tint = opts.tint || null;
    buildStatic();
    override = null;
    if (overrides[name] === undefined) {
      overrides[name] = null;
      const tryLoad = (ext, next) => { const im = new Image(); im.onload = () => { overrides[name] = im; if (scene === name) override = im; }; im.onerror = next; im.src = 'bg/' + name + '.' + ext; };
      tryLoad('jpg', () => tryLoad('png', () => {}));
    } else override = overrides[name];
  }
  function frame() {
    const t = (performance.now() - t0) / 1000;
    const sc = S[scene] || S.black;
    if (override) {
      const s = Math.max(W / override.width, H / override.height); const w = override.width * s, h = override.height * s;
      ctx.drawImage(override, (W - w) / 2, (H - h) / 2, w, h);
      if (sc.anim && st.animOnOverride) sc.anim(ctx, t);
    } else {
      if (staticLayer) ctx.drawImage(staticLayer, 0, 0);
      if (sc.draw) sc.draw(ctx, t);
      if (sc.anim) sc.anim(ctx, t);
    }
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    set, get st() { return st; }, get t() { return (performance.now() - t0) / 1000; },
    setTint(c) { tint = c; },
    helpers: { R, grad, moon, stars, skyline, neon, pole, cat, mendako, crowd, windowFrame }
  };
})();
