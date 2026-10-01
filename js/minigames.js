// ===== ミニゲーム（1〜3章） =====

// ---------- 1章-A：足音を数えろ ----------
MG.footsteps = () => minigame({
  title: '足音を数えろ', sub: 'CHAPTER 1 ─ LISTEN',
  lines: ['追っ手が何人いるか当てよう。', '追っ手は1人につき<span class="keys">足跡が1列</span>。足音と一緒に足跡が近づいてくる。', '<span class="keys">足跡の列の数 ＝ 人数</span>。全2ラウンド。', '足音は位置ごとに左右から聞こえる。<span class="keys">ヘッドホン推奨</span>'],
  play: (m) => m.run((() => {
    const c = m.ctx;
    const ROUNDS = [{ n: 3 + Math.floor(Math.random() * 2), dur: 6, label: 'ROUND 1' }, { n: 5, dur: 7, label: 'ROUND 2 ─ 本番' }];
    const LANES = [170, 330, 490, 640, 790, 950, 1110];
    let ri = 0, people = [], prints = [], phase = 'intro', T = 0, msg = '', msgCol = '#fff', reveal = 0;
    const setup = () => {
      const R = ROUNDS[ri];
      const lanes = LANES.slice().sort(() => Math.random() - 0.5).slice(0, R.n);
      people = lanes.map((x, i) => ({ x, y: 70 + Math.random() * 50, iv: 0.5 + Math.random() * 0.2, next: 0.2 + i * 0.13, foot: i % 2, f: 60 + (x / 1280) * 90 }));
      prints = []; T = 0; phase = 'listen'; reveal = 0;
    };
    const btns = [1, 2, 3, 4, 5, 6, 7].map((v, i) => ({ v, x: 170 + i * 140, y: 590, w: 120, h: 80 }));
    const replay = { x: 1040, y: 22, w: 210, h: 48 };
    const answer = v => {
      if (phase !== 'answer') return;
      const R = ROUNDS[ri];
      if (v === R.n) {
        AU.se('ok'); msg = `正解！ ${R.n}人`; msgCol = '#7f7'; phase = 'ok'; T = 0; reveal = 1;
      } else {
        AU.se('error'); msg = `${v}人…？ 正解は ${R.n}人。足跡の列を見てみて`; msgCol = '#f8a'; phase = 'wrong'; T = 0; reveal = 1;
      }
    };
    m.onclick = p => {
      if (phase === 'answer' && p.x > replay.x && p.x < replay.x + replay.w && p.y > replay.y && p.y < replay.y + replay.h) { AU.se('click'); const keep = people.map(q => q.x); setup(); people.forEach((q, i) => q.x = keep[i]); return; }
      for (const b of btns) if (p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) answer(b.v);
    };
    m.onkey = e => { if (e.key >= '1' && e.key <= '7') answer(+e.key); };
    const foot = (x, y, a, left) => {
      c.save(); c.translate(x + (left ? -11 : 11), y); c.globalAlpha = a; c.fillStyle = '#d9c8ff';
      c.beginPath(); c.ellipse(0, 0, 8, 13, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 17, 6, 6, 0, 0, 7); c.fill(); c.restore();
    };
    setup(); phase = 'intro';
    return dt => {
      T += dt;
      const R = ROUNDS[ri];
      c.fillStyle = '#07040f'; c.fillRect(0, 0, 1280, 720);
      // 路地（上から見た図）
      c.fillStyle = '#120a22'; c.fillRect(90, 40, 1100, 520);
      c.strokeStyle = 'rgba(160,120,255,.15)'; c.lineWidth = 1; for (let y = 60; y < 560; y += 40) { c.beginPath(); c.moveTo(90, y); c.lineTo(1190, y); c.stroke(); }
      drawSprite(c, 'iroha', 1215, 720, 150);
      txt(c, R.label, 100, 600, { size: 22, color: '#8ef' });
      if (phase === 'intro') { txt(c, R.label, 640, 300, { size: 54, align: 'center', color: '#fff', glow: '#a6f' }); if (T > 1.3) setup(); return; }
      if (phase === 'listen') {
        for (const q of people) {
          q.next -= dt;
          if (q.next <= 0 && q.y < 520) {
            q.next = q.iv; q.foot ^= 1; q.y += 34;
            prints.push({ x: q.x, y: q.y, t: 0, left: q.foot });
            AU.se('step', { pan: (q.x - 640) / 640 * 0.9, f: q.f, vol: 0.45 + q.y / 1200, lp: 250 + q.f * 4 });
          }
        }
        txt(c, '…………（集中）', 640, 610, { size: 30, align: 'center', color: '#b9a8ff' });
        c.fillStyle = '#222'; c.fillRect(440, 640, 400, 8); c.fillStyle = '#a6f'; c.fillRect(440, 640, 400 * Math.min(1, T / R.dur), 8);
        if (T > R.dur) { phase = 'answer'; T = 0; }
      }
      prints.forEach(p => { p.t += dt; const a = reveal ? 0.9 : Math.max(0, 1 - p.t / 2.2); if (a > 0) foot(p.x, p.y, a, p.left); });
      if (reveal) people.forEach((q, i) => { c.strokeStyle = 'rgba(255,90,170,.7)'; c.lineWidth = 3; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(q.x, 60); c.lineTo(q.x, 540); c.stroke(); c.setLineDash([]); txt(c, `${i + 1}`, q.x, 70, { size: 30, align: 'center', color: '#ff5fa8', stroke: '#000' }); });
      if (phase === 'answer') {
        txt(c, '追っ手は何人？（足跡の列の数）', 640, 600, { size: 30, align: 'center', glow: '#a6f' });
        btns.forEach(b => { rrect(c, b.x, b.y + 20, b.w, b.h - 20, 14); c.fillStyle = 'rgba(80,40,160,.85)'; c.fill(); c.strokeStyle = '#7ef'; c.lineWidth = 2; c.stroke(); txt(c, b.v + '人', b.x + b.w / 2, b.y + 70, { size: 30, align: 'center' }); });
        rrect(c, replay.x, replay.y, replay.w, replay.h, 12); c.fillStyle = '#2a2244'; c.fill(); txt(c, '▶ もう一度聞く', replay.x + replay.w / 2, replay.y + 32, { size: 20, align: 'center' });
      }
      if (phase === 'ok' || phase === 'wrong') {
        txt(c, msg, 640, 640, { size: 36, align: 'center', color: msgCol, stroke: '#000', sw: 6 });
        if (T > 2.2) {
          if (phase === 'ok') { ri++; if (ri >= ROUNDS.length) return { ok: true, title: '追っ手は5人！', lines: ['さすが私。足音からして追っ手は5人。', 'この路地を抜けたら地下鉄だ。'] }; phase = 'intro'; T = 0; prints = []; people = []; reveal = 0; }
          else setup();   // 同じ人数で配置を変えてもう一度
        }
      }
    };
  })())
});

// ---------- 1章-B：路地を抜けろ（ランナー） ----------
MG.escape = () => minigame({
  title: '路地を駆け抜けろ', sub: 'CHAPTER 1 ─ RUN',
  lines: ['地下鉄の入口まで逃げ切れ！', '<span class="keys">Space / ↑ / クリック</span>：ジャンプ（2段ジャンプ可）', 'ゴミ箱・猫・低い弾はジャンプ、高い弾はジャンプせずにやり過ごす。', 'HPは3。'],
  play: (m) => m.run((() => {
    const c = m.ctx; const GY = 600;
    const P = { x: 260, y: GY, vy: 0, jumps: 0, hp: 3, inv: 0 };
    let dist = 0, obs = [], T = 0, end = null, endT = 0, scroll = 0;
    // 障害物は「プレイヤーに届く時刻」から逆算して配置する（同時到着・回避不能を防ぐ）
    const KINDS = { can: { w: 46, h: 66, y: 0, act: 'jump' }, cat: { w: 50, h: 34, y: 0, act: 'jump' }, low: { w: 40, h: 10, y: 35, act: 'jump', vx: 380 }, high: { w: 40, h: 10, y: 205, act: 'stay', vx: 380 } };
    let lastArrive = 1.2, lastAct = 'stay', spawnAt = 0;
    const gapFor = (a, b) => a === 'jump' && b === 'stay' ? 1.05 : a === 'stay' && b === 'jump' ? 0.7 : 0.8;
    const jump = () => { if (end) { if (end.stage === 1 && P.jumps < 2) { P.vy = -900; P.jumps++; AU.se('tap', { f: 900 }); } return; } if (P.jumps < 2) { P.vy = P.jumps ? -780 : -900; P.jumps++; AU.se('tap', { f: 700 + P.jumps * 200 }); } };
    m.onkey = e => { if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') jump(); };
    m.onclick = jump;
    return (dt) => {
      T += dt;
      const speed = end ? (end.stage < 3 ? 360 : 0) : 420 + Math.min(200, dist / 12);
      scroll += speed * dt; if (!end) dist += speed * dt / 20;
      P.vy += 2600 * dt; P.y += P.vy * dt; if (P.y >= GY) { P.y = GY; P.vy = 0; P.jumps = 0; }
      P.inv -= dt;
      // spawn
      if (!end) {
        if (T >= spawnAt && dist < 620) {
          const k = Math.random(); const type = k < 0.3 ? 'can' : k < 0.55 ? 'cat' : k < 0.8 ? 'low' : 'high';
          const K = KINDS[type];
          const rel = speed + (K.vx || 0);
          const lead = (1330 - P.x) / rel;   // 画面右端のすぐ外に出現
          const arrive = Math.max(lastArrive + gapFor(lastAct, K.act) + Math.random() * 0.6, T + lead);
          obs.push({ type, x: P.x + rel * (arrive - T) - K.w / 2, y: GY - K.y, w: K.w, h: K.h, vx: K.vx || 0, bullet: !!K.vx });
          lastArrive = arrive; lastAct = K.act; spawnAt = arrive - 2.8;
        }
        if (dist >= 650) { end = { stage: 1, x: 1300 }; obs = []; }
      }
      obs.forEach(o => { o.x -= (speed + o.vx) * dt; });
      obs = obs.filter(o => o.x > -100);
      for (const o of obs) {
        if (P.inv > 0) continue;
        // いろはの当たり判定は見た目より少し小さめ
        const px0 = P.x - 18, px1 = P.x + 18, py0 = P.y - 120, py1 = P.y - 4;
        const oy0 = o.bullet ? o.y - 5 : o.y - o.h, oy1 = o.bullet ? o.y + 5 : o.y;
        if (px1 > o.x && px0 < o.x + o.w && py1 > oy0 && py0 < oy1) { P.hp--; P.inv = 1.2; AU.se('hit'); shake(200, 8); if (P.hp <= 0) return { ok: false, msg: '捕まってしまった…！　低い弾・ゴミ箱・猫はジャンプ、高い弾はジャンプせずにやり過ごそう。' }; }
      }
      // 終盤：石ころ（避けられない運命）
      if (end) {
        end.x -= speed * dt;
        if (end.stage === 1 && end.x < P.x + 40) {
          if (P.y < GY - 40) { end.stage = 2; end.x2 = end.x + 260; } else { end.stage = 3; endT = 0; AU.se('trip'); }
        }
        if (end.stage === 2) { end.x2 -= speed * dt; if (end.x2 < P.x + 40 && P.y >= GY - 5) { end.stage = 3; endT = 0; AU.se('trip'); } }
        if (end.stage === 3) { endT += dt; if (endT > 2.2) return { ok: true, title: 'きゃっ！', lines: ['……私としたことが、石に躓いて転んでしまった。', '（2個目の石は反則だと思う）'] }; }
      }
      // draw
      c.fillStyle = '#0c0618'; c.fillRect(0, 0, 1280, 720);
      for (let L = 0; L < 2; L++) { const sp = L ? 0.6 : 0.25; const r = BG.helpers.R(L + 3); for (let i = 0; i < 30; i++) { const w = 60 + r() * 120, h = 150 + r() * 300 + L * 80; const x = ((i * 160 - scroll * sp) % 4800 + 4800) % 4800 - 200; if (x > 1300) continue; c.fillStyle = L ? '#1a0e2c' : '#120a22'; c.fillRect(x, GY - h, w, h); if (r() < 0.5) BG.helpers.neon(c, ['電脳', 'BAR', 'VR', '月見', '酒'][i % 5], x + w / 2, GY - h + 40, 24, ['#ff4fa8', '#5ff2ff', '#ffd84a'][i % 3], false); } }
      c.fillStyle = '#1d1430'; c.fillRect(0, GY, 1280, 120); c.fillStyle = '#ff4fa8'; for (let x = -(scroll % 80); x < 1280; x += 80) c.fillRect(x, GY + 4, 40, 3);
      obs.forEach(o => {
        if (o.type === 'can') { c.fillStyle = '#3a4a5a'; c.fillRect(o.x, o.y - o.h, o.w, o.h); c.fillStyle = '#56687a'; c.fillRect(o.x - 4, o.y - o.h, o.w + 8, 10); }
        if (o.type === 'cat') BG.helpers.cat(c, o.x + 30, o.y - 15, 1, '#222');
        if (o.bullet) { c.fillStyle = '#ffd84a'; c.shadowColor = '#fa0'; c.shadowBlur = 12; c.fillRect(o.x, o.y - 5, o.w, 10); c.shadowBlur = 0; }
      });
      if (end) {
        const stone = x => { c.fillStyle = '#888'; c.beginPath(); c.ellipse(x, GY - 10, 22, 14, 0, 0, 7); c.fill(); c.fillStyle = '#222'; c.fillRect(x - 8, GY - 16, 3, 3); c.fillRect(x + 5, GY - 16, 3, 3); };
        if (end.stage >= 1 && end.x > -50) stone(end.x);
        if (end.x2 !== undefined) stone(end.x2);
      }
      // 追っ手
      for (let i = 0; i < 3; i++) grunt(c, 40 + i * 50 + Math.sin(T * 10 + i) * 6, GY, 0.7);
      // いろは
      const tilt = end && end.stage === 3 ? Math.min(1.4, endT * 4) : (P.y < GY ? -0.15 : Math.sin(T * 18) * 0.05);
      c.save(); c.translate(P.x, P.y - (end && end.stage === 3 ? -Math.min(60, endT * 200) + 0 : 0)); c.rotate(tilt);
      if (!(P.inv > 0 && Math.floor(T * 20) % 2)) drawSprite(c, 'iroha', 0, 0, 170 + (P.y < GY ? 0 : Math.abs(Math.sin(T * 18)) * 6));
      c.restore();
      if (end && end.stage === 3) txt(c, 'きゃっ！', P.x + 60, P.y - 180, { size: 48, color: '#fff', stroke: '#f4a' });
      // HUD
      m.hud.innerHTML = `<span>HP ${'♥'.repeat(P.hp)}${'♡'.repeat(3 - P.hp)}</span><span>地下鉄まで ${end ? 'あと少し…！' : Math.max(0, Math.ceil(650 - dist)) + 'm'}</span>`;
    };
  })())
});

// ---------- 1章-C：いつもとどこが違うでしょ～？ ----------
MG.spotdiff = () => minigame({
  title: 'いつもとどこが違うでしょ～？', sub: 'CHAPTER 1 ─ SPOT THE DIFFERENCE',
  lines: ['左が「さっきのかぐや」、右が「今のかぐや」。', '違うところを <span class="keys">6か所</span> クリックで見つけよう。', 'お手つき3回 or 時間切れで……撃たれます。'],
  play: (m) => m.run((() => {
    const c = m.ctx; const im = IMG.kaguya;
    const H = 600, sc = H / im.height, W = im.width * sc;
    const L = { x: 320 - W / 2, y: 90 }, Rr = { x: 960 - W / 2, y: 90 };
    // 改変版を作る
    const mod = document.createElement('canvas'); mod.width = im.width; mod.height = im.height;
    const mc = mod.getContext('2d'); mc.drawImage(im, 0, 0);
    const hue = (x, y, w, h, deg) => { const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; const tc = tmp.getContext('2d'); tc.filter = `hue-rotate(${deg}deg) saturate(1.4)`; tc.drawImage(im, x, y, w, h, 0, 0, w, h); mc.clearRect(x, y, w, h); mc.drawImage(tmp, x, y); };
    hue(375, 95, 95, 90, 180);      // 髪飾り
    hue(360, 425, 75, 80, 150);     // 帯の蝶
    hue(735, 855, 127, 150, 200);   // 髪先のビーズ（髪型）
    hue(370, 1165, 160, 168, 120);  // 靴
    mc.save(); mc.translate(322, 250); mc.fillStyle = '#ff4f9a'; mc.beginPath(); mc.arc(-6, -4, 7, 0, 7); mc.arc(6, -4, 7, 0, 7); mc.moveTo(-13, -1); mc.lineTo(0, 13); mc.lineTo(13, -1); mc.fill(); mc.restore();
    mc.save(); mc.translate(150, 330); mc.fillStyle = '#ffd84a'; mc.strokeStyle = '#a07000'; mc.lineWidth = 4; mc.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 18 : 42; mc.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } mc.closePath(); mc.fill(); mc.stroke(); mc.restore();
    const diffs = [
      { x: 422, y: 140, r: 60, name: '髪飾り', found: false },
      { x: 397, y: 465, r: 55, name: '帯の飾り', found: false },
      { x: 798, y: 930, r: 85, name: '髪型（ビーズ）', found: false },
      { x: 450, y: 1245, r: 95, name: '靴', found: false },
      { x: 322, y: 250, r: 45, name: 'ほっぺのシール', found: false },
      { x: 150, y: 330, r: 60, name: 'シール', found: false },
    ];
    let miss = 0, T = 75, marks = [], over = null;
    m.onclick = p => {
      if (over) return;
      for (const base of [L, Rr]) {
        const u = (p.x - base.x) / sc, v = (p.y - base.y) / sc;
        if (u < 0 || v < 0 || u > im.width || v > im.height) continue;
        const d = diffs.find(d => !d.found && Math.hypot(d.x - u, d.y - v) < d.r);
        if (d) { d.found = true; AU.se('ok'); }
        else { miss++; AU.se('error'); marks.push({ x: p.x, y: p.y, t: 0 }); }
        return;
      }
    };
    return dt => {
      T -= dt;
      c.fillStyle = '#ffe6f0'; c.fillRect(0, 0, 1280, 720);
      c.fillStyle = '#ffd0e2'; for (let i = 0; i < 20; i++) c.fillRect(i * 70, 0, 35, 720);
      [L, Rr].forEach((b, i) => { rrect(c, b.x - 20, b.y - 20, W + 40, H + 40, 20); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = i ? '#ff4fa8' : '#6a6aff'; c.lineWidth = 5; c.stroke(); });
      c.drawImage(im, L.x, L.y, W, H); c.drawImage(mod, Rr.x, Rr.y, W, H);
      txt(c, 'さっき', L.x + W / 2, 60, { size: 26, align: 'center', color: '#55f' });
      txt(c, 'いま', Rr.x + W / 2, 60, { size: 26, align: 'center', color: '#f4a' });
      diffs.forEach(d => { if (!d.found) return; [L, Rr].forEach(b => { c.strokeStyle = '#ff2f7f'; c.lineWidth = 5; c.beginPath(); c.arc(b.x + d.x * sc, b.y + d.y * sc, d.r * sc, 0, 7); c.stroke(); }); });
      marks.forEach(k => { k.t += dt; c.strokeStyle = `rgba(80,80,255,${1 - k.t})`; c.lineWidth = 6; c.beginPath(); c.moveTo(k.x - 18, k.y - 18); c.lineTo(k.x + 18, k.y + 18); c.moveTo(k.x + 18, k.y - 18); c.lineTo(k.x - 18, k.y + 18); c.stroke(); });
      marks = marks.filter(k => k.t < 1);
      const found = diffs.filter(d => d.found).length;
      // かぐやの一言
      rrect(c, 520, 600, 240, 100, 20); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#f4a'; c.lineWidth = 3; c.stroke();
      txt(c, ['ねえねえ～', 'わかる～？', 'まだ～？', 'ちゃんと見て～'][Math.floor(-T / 4 + 100) % 4], 640, 645, { size: 22, align: 'center', color: '#f4a' });
      txt(c, `${found}/6`, 640, 685, { size: 26, align: 'center', color: '#333' });
      m.hud.innerHTML = `<span style="color:#333;text-shadow:none">のこり ${Math.max(0, T).toFixed(0)}秒</span><span style="color:#333;text-shadow:none">お手つき ${'✕'.repeat(miss)}${'・'.repeat(Math.max(0, 3 - miss))}</span>`;
      if (found === 6) return { ok: true, title: '全部わかった！', lines: ['「せいか～い！　よく見てるじゃん、いろはチャン」', '（初対面なのに「いつも」を知ってるわけないんだけど…）'] };
      if (miss >= 3 || T <= 0) { AU.se('gun'); const left = diffs.filter(d => !d.found).map(d => d.name).join('・'); return { ok: false, failTitle: diffs[3].found ? '髪型が違うやろがい～！' : '靴まで見ろやぁー！', msg: `見落とし：${left}<br>（パァン！……なんて冗談。もう一回どうぞ～）` }; }
    };
  })())
});

// ---------- 2章-A：コード読解 ----------
MG.codequiz = () => minigame({
  title: 'このコード、なにしてる？', sub: 'CHAPTER 2 ─ READ THE CODE',
  lines: ['かぐやが書いているコードを読み解こう。', '共通テスト「情報」400点時代のいろはなら読めるはず。', '6問中 <span class="keys">5問以上</span> 正解でクリア。'],
  play: (m) => new Promise(res => {
    const Q = [
      { code: 'player.HP ← 999999\nもし player.HP < 999999 ならば:\n　　player.HP ← 999999', a: ['体力がずっと最大のまま', '攻撃力が999999になる', '敵のHPを999999にする', 'ログアウトできなくなる'], k: 0, ex: '体力を最大値に固定し続けている。つまり<b>体力を増やすコード</b>。' },
      { code: '関数 攻撃(相手):\n　　ダメージ ← player.攻撃力 × 100\n　　相手.HP ← 相手.HP − ダメージ', a: ['相手を回復する', '与えるダメージが100倍になる', '自分の攻撃力が下がる', '100回攻撃する'], k: 1, ex: '攻撃力に100を掛けている。<b>攻撃力を増やすコード</b>。' },
      { code: 'すべての 建物 b について繰り返す:\n　　b.不透明度 ← 0.1\n　　b.当たり判定 ← 有効のまま', a: ['建物を壊す', '建物をすり抜ける', '建物が透けて見える', '建物を増やす'], k: 2, ex: '見た目だけ透明にして、当たり判定はそのまま。<b>壁透視</b>。' },
      { code: 'すべての ユーザー u について繰り返す:\n　　もし u ≠ 自分 ならば:\n　　　　地図.表示(u.名前, u.座標)', a: ['全員の位置が地図に出る', '全員にメッセージを送る', '全員をログアウトさせる', '自分の位置を隠す'], k: 0, ex: '自分以外の全ユーザーの座標を表示。<b>人の位置を表示するコード</b>。' },
      { code: '関数 ワープ(n):\n　　自分.座標 ← 電柱[n].座標\n　　演出.虹色に光る(電柱[n])', a: ['電柱を虹色に塗る', '任意の電柱に瞬間移動する', '電柱を n 本建てる', '電柱にハッキングする'], k: 1, ex: '<b>任意の電柱に瞬間移動するコード</b>。……電柱から出てきた理由、これだ。' },
      { code: 'もし 自分.呼ばれ方 = "チーター" ならば:\n　　自分.呼ばれ方 ← "ハッカー"\n　　表示("ハッカーってよんで！")', a: ['チーターを通報する', 'ハッカーをBANする', '呼び方を「ハッカー」に直させる', '何もしない'], k: 2, ex: '……こいつ、<b>チーター</b>だ。' },
    ];
    let qi = 0, score = 0;
    const box = m.extra('', 'inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle,#0b1a24,#020509);');
    const render = (fb) => {
      const q = Q[qi];
      box.innerHTML = `<div style="font:800 20px Consolas,monospace;color:#5ff2ff;margin-bottom:10px">Q${qi + 1} / ${Q.length}　　正解 ${score}</div>
        <pre style="width:900px;min-height:170px;margin:0;padding:24px 30px;background:#03110c;border:2px solid #3f8;border-radius:10px;color:#9f9;font:26px/1.6 Consolas,'MS Gothic',monospace;box-shadow:0 0 20px #3f84;white-space:pre-wrap">${q.code}</pre>
        <div style="font-size:24px;margin:18px 0 12px;color:#fff">このコードを実行すると、どうなる？</div>
        <div id="qa" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:900px"></div>
        <div id="fb" style="min-height:70px;margin-top:14px;font-size:22px;color:#ffd94a;text-align:center"></div>`;
      const qa = box.querySelector('#qa');
      q.a.forEach((s, i) => { const b = document.createElement('button'); b.className = 'mg-btn sub'; b.style.cssText = 'font-size:20px;padding:12px;border-radius:12px;color:#fff;background:#1a2a44'; b.textContent = s; b.onclick = () => answer(i, b); qa.appendChild(b); });
    };
    let locked = false;
    const answer = (i, btn) => {
      if (locked) return; locked = true; const q = Q[qi];
      const ok = i === q.k; if (ok) score++;
      AU.se(ok ? 'ok' : 'error');
      btn.style.background = ok ? '#1a7a4a' : '#8a1a3a';
      box.querySelector('#fb').innerHTML = (ok ? '正解！　' : `ざんねん、答えは「${q.a[q.k]}」　`) + q.ex;
      setTimeout(() => { locked = false; qi++; if (qi < Q.length) render(); else { box.remove(); res(score >= 5 ? { ok: true, title: `${score}/6 正解！`, lines: ['体力増加、攻撃力増加、壁透視、位置表示、電柱ワープ……', '……あ、こいつチーターだ。'] } : { ok: false, msg: `${score}/6 正解。共通テスト400点の名が泣くよ！` }); } }, 2300);
    };
    render();
  })
});

// ---------- 2章-B：電柱ワープ（ターン制パズル） ----------
MG.polewarp = () => minigame({
  title: '電柱ワープ', sub: 'CHAPTER 2 ─ WARP',
  lines: ['光っている電柱をクリックしてワープ。芦花のいる電柱（★）を目指そう。', 'ワープできるのは <span class="keys">4マス以内</span> の電柱だけ。', 'ワープするたびにブラックアビスが1歩動く。<span class="keys">赤い視界</span>に入ったらアウト。', '薄い赤は「次のターンの視界」。<span class="keys">Space</span> でその場で待機。'],
  play: (m) => m.run((() => {
    const c = m.ctx; const CS = 84, OX = 136, OY = 70, COLS = 12, ROWS = 7;
    const blocks = new Set(['2,1', '3,1', '2,2', '3,2', '2,4', '3,4', '2,5', '3,5', '6,0', '7,0', '6,1', '7,1', '6,3', '7,3', '6,5', '7,5', '6,6', '7,6', '10,1', '10,2', '10,4', '10,5']);
    const poles = [[0, 3], [1, 0], [1, 6], [4, 3], [4, 0], [5, 6], [8, 2], [8, 4], [9, 0], [9, 6], [11, 3]];
    const goal = 10;
    let cur = 0, turn = 0, state = 'play', anim = 0, from = null;
    const mk = (path) => ({ path, i: 0, d: 1 });
    const enemies = [mk([[4, 6], [4, 5], [4, 4], [4, 3], [4, 2], [4, 1]]), mk([[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]]), mk([[8, 1], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [8, 5]]), mk([[11, 0], [11, 1], [11, 2]]), mk([[1, 1], [1, 2]])];
    const pos = e => e.path[e.i];
    const facing = e => { let j = e.i + e.d; if (j < 0 || j >= e.path.length) j = e.i - e.d; const a = e.path[e.i], b = e.path[j]; return [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])]; };
    const step = e => { if (e.i + e.d < 0 || e.i + e.d >= e.path.length) e.d = -e.d; e.i += e.d; };
    const vision = (e) => { const [x, y] = pos(e); const [dx, dy] = facing(e); const out = [[x, y]]; for (let k = 1; k <= 3; k++) { const cx = x + dx * k, cy = y + dy * k; if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS || blocks.has(cx + ',' + cy)) break; out.push([cx, cy]); } return out; };
    const seen = (cells, p) => cells.some(([x, y]) => x === p[0] && y === p[1]);
    const allVision = () => enemies.flatMap(vision);
    const nextVision = () => { const cl = enemies.map(e => ({ path: e.path, i: e.i, d: e.d })); cl.forEach(step); return cl.flatMap(vision); };
    const reach = i => i !== cur && Math.max(Math.abs(poles[i][0] - poles[cur][0]), Math.abs(poles[i][1] - poles[cur][1])) <= 4;
    let result = null;
    const doTurn = (to) => {
      if (state !== 'play') return;
      if (to !== null) { from = cur; cur = to; anim = 0.35; AU.se('warp'); }
      turn++;
      if (seen(allVision(), poles[cur])) { state = 'caught'; return; }
      enemies.forEach(step);
      if (seen(allVision(), poles[cur])) { state = 'caught'; return; }
      if (cur === goal) state = 'goal';
    };
    m.onclick = p => { const gx = Math.floor((p.x - OX) / CS), gy = Math.floor((p.y - OY) / CS); const i = poles.findIndex(q => q[0] === gx && q[1] === gy); if (i >= 0 && reach(i)) doTurn(i); };
    m.onkey = e => { if (e.code === 'Space') { AU.se('tap'); doTurn(null); } };
    let endT = 0;
    return dt => {
      anim = Math.max(0, anim - dt);
      c.fillStyle = '#050a14'; c.fillRect(0, 0, 1280, 720);
      const nv = nextVision(), av = allVision();
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const X = OX + x * CS, Y = OY + y * CS;
        if (blocks.has(x + ',' + y)) { c.fillStyle = '#1a2238'; c.fillRect(X + 2, Y + 2, CS - 4, CS - 4); c.fillStyle = '#ffd77a55'; for (let k = 0; k < 4; k++) c.fillRect(X + 12 + (k % 2) * 34, Y + 14 + Math.floor(k / 2) * 30, 18, 16); continue; }
        c.fillStyle = '#0c1424'; c.fillRect(X + 1, Y + 1, CS - 2, CS - 2);
        if (seen(nv, [x, y])) { c.fillStyle = 'rgba(255,60,90,.13)'; c.fillRect(X + 1, Y + 1, CS - 2, CS - 2); }
        if (seen(av, [x, y])) { c.fillStyle = 'rgba(255,40,70,.42)'; c.fillRect(X + 1, Y + 1, CS - 2, CS - 2); }
      }
      poles.forEach((p, i) => {
        const X = OX + p[0] * CS + CS / 2, Y = OY + p[1] * CS + CS / 2; const r = reach(i) && state === 'play';
        c.fillStyle = r ? `hsl(${(performance.now() / 5 + i * 40) % 360},100%,65%)` : '#3a4560';
        if (r) { c.shadowColor = c.fillStyle; c.shadowBlur = 20; }
        c.fillRect(X - 6, Y - 32, 12, 64); c.fillRect(X - 20, Y - 26, 40, 6); c.shadowBlur = 0;
        if (i === goal) { txt(c, '★', X + 20, Y - 18, { size: 28, color: '#ffd84a' }); drawSprite(c, 'roka', X + 26, Y + 40, 70); }
      });
      enemies.forEach(e => { const [x, y] = pos(e); const [dx] = facing(e); grunt(c, OX + x * CS + CS / 2, OY + y * CS + CS - 6, 0.48, { flip: dx < 0 }); });
      const P = poles[cur]; const X = OX + P[0] * CS + CS / 2, Y = OY + P[1] * CS + CS;
      if (anim > 0) { c.fillStyle = `rgba(255,255,255,${anim * 2})`; c.beginPath(); c.arc(X, Y - 40, 60 * (1 - anim), 0, 7); c.fill(); }
      drawSprite(c, 'kaguya', X - 12, Y - 2, 76); drawSprite(c, 'iroha', X + 16, Y, 80);
      m.hud.innerHTML = `<span>ターン ${turn}</span><span>Space：待機</span>`;
      if (state === 'caught') { endT += dt; txt(c, '見つかった！', 640, 380, { size: 72, align: 'center', color: '#fff', stroke: '#f24', sw: 8 }); if (endT > 1.2) return { ok: false, msg: '赤い視界の中にワープしちゃダメ！　薄い赤で次の動きを読もう。' }; }
      if (state === 'goal') { endT += dt; if (endT > 0.8) return { ok: true, title: '合流成功！', lines: ['「わっ！？　だ、誰ですか！？」', '「味方だよ～。ハッカーのかぐやちゃんです」'] }; }
    };
  })())
});

// ---------- 2章-C：廃ビル籠城戦 ----------
MG.siege = () => minigame({
  title: '廃ビル籠城戦', sub: 'CHAPTER 2 ─ HOLD OUT',
  lines: ['窓やドアから顔を出す敵を <span class="keys">クリック</span> で撃て！　（芦花のハンドガン）', '弾は8発。<span class="keys">右クリック / R</span> でリロード。', '撃たれる前に倒そう。<span class="keys">Q</span>：かぐやの透視チート（1回だけ・出現位置が先に見える）', '15人倒せばクリア。HPは5。'],
  play: (m) => m.run((() => {
    const c = m.ctx;
    const slots = []; for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) slots.push({ x: 200 + k * 260, y: 100 + r * 180, w: 120, h: 130 }); slots.push({ x: 120, y: 470, w: 150, h: 170 }, { x: 1010, y: 470, w: 150, h: 170 });
    let enemies = [], spawn = 1, kills = 0, hp = 5, ammo = 8, reload = 0, T = 0, wall = 0, wallUsed = false, hurt = 0, pending = [];
    const shoot = p => {
      if (reload > 0) return;
      if (ammo <= 0) { AU.se('error'); return; }
      ammo--; AU.se('gun');
      const e = enemies.find(e => e.state === 'up' && p.x > e.s.x && p.x < e.s.x + e.s.w && p.y > e.s.y && p.y < e.s.y + e.s.h);
      if (e) { e.state = 'dead'; e.t = 0; kills++; AU.se('hit'); }
      if (ammo === 0) doReload();
    };
    const doReload = () => { if (reload > 0 || ammo === 8) return; reload = 1.0; AU.se('click'); };
    m.onclick = (p, e) => { if (e.button === 2) doReload(); else shoot(p); };
    m.onkey = e => { if (e.code === 'KeyR') doReload(); if (e.code === 'KeyQ' && !wallUsed) { wallUsed = true; wall = 6; AU.se('warp'); } };
    m.cv.style.cursor = 'none';
    return dt => {
      T += dt; hurt = Math.max(0, hurt - dt);
      if (reload > 0) { reload -= dt; if (reload <= 0) ammo = 8; }
      wall = Math.max(0, wall - dt);
      spawn -= dt;
      if (spawn <= 0) {
        spawn = Math.max(0.45, 1.3 - T * 0.02);
        const free = slots.filter(s => !enemies.some(e => e.s === s) && !pending.some(p => p.s === s));
        if (free.length) pending.push({ s: free[Math.floor(Math.random() * free.length)], t: 0.9 });
      }
      pending.forEach(p => p.t -= dt);
      pending.filter(p => p.t <= 0).forEach(p => enemies.push({ s: p.s, state: 'up', t: 0, life: Math.max(1.1, 2.1 - T * 0.02) }));
      pending = pending.filter(p => p.t > 0);
      enemies.forEach(e => { e.t += dt; if (e.state === 'up' && e.t > e.life) { e.state = 'shot'; e.t = 0; hp--; hurt = 0.5; AU.se('gun'); shake(250, 10); } });
      enemies = enemies.filter(e => !((e.state === 'dead' && e.t > 0.4) || (e.state === 'shot' && e.t > 0.3)));
      // draw
      c.fillStyle = '#1b1e28'; c.fillRect(0, 0, 1280, 720);
      c.fillStyle = '#2a2e3a'; c.fillRect(60, 80, 1160, 580);
      slots.forEach(s => { c.fillStyle = '#07080c'; c.fillRect(s.x, s.y, s.w, s.h); });
      enemies.forEach(e => {
        c.save(); c.beginPath(); c.rect(e.s.x, e.s.y, e.s.w, e.s.h); c.clip();
        const up = e.state === 'up' ? Math.min(1, e.t * 6) : e.state === 'dead' ? 1 - e.t * 2.5 : 1;
        grunt(c, e.s.x + e.s.w / 2, e.s.y + e.s.h + 70 - up * 60, 0.95, { eye: e.state === 'up' && e.t > e.life - 0.5 ? '#ff2040' : '#c060ff' });
        if (e.state === 'dead') { txt(c, 'HIT!', e.s.x + e.s.w / 2, e.s.y + 40, { size: 30, align: 'center', color: '#ffd84a', stroke: '#000' }); }
        c.restore();
        if (e.state === 'up') { c.fillStyle = '#f24'; c.fillRect(e.s.x, e.s.y - 10, e.s.w * (1 - e.t / e.life), 6); }
      });
      slots.forEach(s => { c.strokeStyle = '#4a4e5c'; c.lineWidth = 8; c.strokeRect(s.x, s.y, s.w, s.h); });
      if (wall > 0) pending.forEach(p => { c.strokeStyle = '#5ff2ff'; c.lineWidth = 4; c.setLineDash([8, 6]); c.strokeRect(p.s.x + 6, p.s.y + 6, p.s.w - 12, p.s.h - 12); c.setLineDash([]); txt(c, '!', p.s.x + p.s.w / 2, p.s.y + p.s.h / 2 + 14, { size: 40, align: 'center', color: '#5ff2ff' }); });
      // 手前の窓枠（こちら側）
      c.fillStyle = '#0a0a10'; c.fillRect(0, 660, 1280, 60); c.fillRect(0, 0, 1280, 40);
      if (hurt > 0) { c.fillStyle = `rgba(255,0,40,${hurt})`; c.fillRect(0, 0, 1280, 720); }
      // 照準
      const { x, y } = m.mouse; c.strokeStyle = '#5ff2ff'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 22, 0, 7); c.moveTo(x - 34, y); c.lineTo(x - 10, y); c.moveTo(x + 10, y); c.lineTo(x + 34, y); c.moveTo(x, y - 34); c.lineTo(x, y - 10); c.moveTo(x, y + 10); c.lineTo(x, y + 34); c.stroke();
      for (let i = 0; i < 8; i++) { c.fillStyle = i < ammo ? '#ffd84a' : '#333'; c.fillRect(1000 + i * 26, 676, 18, 30); }
      if (reload > 0) txt(c, 'RELOAD...', 1100, 670, { size: 22, align: 'center', color: '#f88' });
      m.hud.innerHTML = `<span>HP ${'♥'.repeat(Math.max(0, hp))}</span><span>撃破 ${kills}/15　透視 ${wallUsed ? (wall > 0 ? wall.toFixed(1) + 's' : '使用済') : 'Q'}</span>`;
      if (kills >= 15) { m.cv.style.cursor = ''; return { ok: true, title: '持ちこたえた！', lines: ['……でも、まだ来る。キリがない。', 'その時、窓から眩い光が差し込んだ。'] }; }
      if (hp <= 0) { m.cv.style.cursor = ''; return { ok: false, msg: '押し切られた…！　赤い目になった敵から優先して撃とう。' }; }
    };
  })())
});

// ---------- 3章-A：おいしくなる魔法 ----------
MG.omajinai = () => minigame({
  title: 'おいしくなーれ♡', sub: 'CHAPTER 3 ─ MAID MAGIC',
  lines: ['メイドさんと一緒に、オムライスに魔法をかけよう。', '縮んでくる輪がハートに重なった瞬間に <span class="keys">Space / クリック</span>！', '6回中4回成功で、とってもおいしくなる。'],
  play: (m) => m.run((() => {
    const c = m.ctx; const words = ['おいしく', 'なーれ', 'もえ', 'もえ', 'きゅん', '♡♡♡'];
    let i = 0, t = 0, good = 0, fb = [], done = false, endT = 0; const dur = 1.25;
    const hit = () => { if (done || t < 0.2) return; const d = Math.abs(t - dur); const ok = d < 0.13; if (ok) { good++; AU.se('heart'); } else AU.se('error'); fb.push({ s: ok ? (d < 0.06 ? 'PERFECT♡' : 'GOOD') : 'MISS', t: 0 }); next(); };
    const next = () => { i++; t = 0; if (i >= words.length) done = true; };
    m.onkey = e => { if (e.code === 'Space' || e.code === 'Enter') hit(); };
    m.onclick = hit;
    return dt => {
      c.fillStyle = '#ffe1ee'; c.fillRect(0, 0, 1280, 720);
      drawSprite(c, 'noi', 1060, 760, 640);
      // オムライス
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(560, 560, 260, 70, 0, 0, 7); c.fill();
      c.fillStyle = '#ffd34a'; c.beginPath(); c.ellipse(560, 520, 190, 70, 0, Math.PI, 0); c.lineTo(750, 540); c.quadraticCurveTo(560, 580, 370, 540); c.fill();
      c.strokeStyle = '#e02040'; c.lineWidth = 8; c.beginPath(); for (let k = 0; k <= Math.min(1, good / 4) * 40; k++) { const a = k / 40 * Math.PI * 2; const x = 560 + 16 * Math.pow(Math.sin(a), 3) * 3, y = 490 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 3; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      if (!done) {
        t += dt; if (t > dur + 0.3) { fb.push({ s: 'MISS', t: 0 }); AU.se('error'); next(); }
        const cx = 560, cy = 250;
        c.fillStyle = '#ff4f9a'; c.font = '120px sans-serif'; c.textAlign = 'center'; c.fillText('♡', cx, cy + 42); c.textAlign = 'left';
        const r = 50 + (1 - Math.min(1, t / dur)) * 220; c.strokeStyle = '#ff4f9a'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
        txt(c, words[i] || '', cx, 110, { size: 54, align: 'center', color: '#ff2f7f', stroke: '#fff', sw: 8 });
      } else { endT += dt; }
      fb.forEach((f, k) => { f.t += dt; txt(c, f.s, 300, 300 - f.t * 60, { size: 40, align: 'center', color: f.s === 'MISS' ? '#66f' : '#ff2f7f', stroke: '#fff' }); });
      fb = fb.filter(f => f.t < 1);
      m.hud.innerHTML = `<span style="color:#f4a">成功 ${good}/${words.length}</span>`;
      if (done && endT > 0.8) return good >= 4 ? { ok: true, title: 'きゅん♡', lines: ['「はい、おいしくなりました～♡」', 'メイドさん（男の娘）の声はやたらと低かった。'] } : { ok: false, msg: 'あんまりおいしくならなかった…。輪がハートと同じ大きさになった瞬間がタイミング！' };
    };
  })())
});

// ---------- 3章-B：ワンウェイスモーク ----------
MG.smoke = () => minigame({
  title: 'ワンウェイスモーク', sub: 'CHAPTER 3 ─ CLUTCH',
  lines: ['スモークを投げ込んだのは、謎のチンチラ。あなたはそのチンチラだ。', 'スモークの中、<span class="keys">オレンジの輪郭</span>が敵。<span style="color:#5ff2ff">水色の輪郭</span>は人質（いろはと芦花）。', '煙が晴れる前に、敵6人を <span class="keys">クリック</span> で撃ち抜け。人質に当てたら即アウト。'],
  play: (m) => m.run((() => {
    const c = m.ctx;
    const foes = []; for (let i = 0; i < 6; i++) foes.push({ x: 140 + i * 190 + Math.random() * 40, y: 600 - (i % 2) * 60, ph: Math.random() * 6, sp: 0.6 + Math.random() * 0.8, amp: 40 + Math.random() * 50, alive: true, t: 0 });
    const hostages = [{ n: 'iroha', x: 470, y: 660 }, { n: 'roka', x: 830, y: 660 }];
    let T = 13, puffs = [], shots = [], fail = false, time = 0;
    for (let i = 0; i < 60; i++) puffs.push({ x: Math.random() * 1280, y: Math.random() * 720, r: 80 + Math.random() * 140, vx: (Math.random() - .5) * 20, vy: (Math.random() - .5) * 10 });
    const fx = f => f.x + Math.sin(time * f.sp + f.ph) * f.amp;
    m.onclick = p => {
      AU.se('gun'); shots.push({ x: p.x, y: p.y, t: 0 });
      const f = foes.find(f => f.alive && Math.abs(p.x - fx(f)) < 40 && p.y > f.y - 165 && p.y < f.y);
      if (f) { f.alive = false; AU.se('hit'); return; }
      for (const h of hostages) if (Math.abs(p.x - h.x) < 50 && p.y > h.y - 340 && p.y < h.y) { fail = true; return; }
    };
    m.cv.style.cursor = 'crosshair';
    return dt => {
      time += dt; T -= dt;
      c.fillStyle = '#3a1530'; c.fillRect(0, 0, 1280, 720);
      c.fillStyle = '#5a2048'; c.fillRect(0, 0, 1280, 500);
      const clear = Math.max(0, 1 - T / 13);
      // 人質
      hostages.forEach(h => drawSprite(c, h.n, h.x, h.y, 360, { filter: 'brightness(0.15) drop-shadow(0 0 6px #5ff2ff) drop-shadow(0 0 3px #5ff2ff)' }));
      foes.forEach(f => { if (f.alive) { c.save(); c.shadowColor = '#ff8a2a'; c.shadowBlur = 16; grunt(c, fx(f), f.y, 1.25, { col: '#2a0a10', eye: '#ffb04a' }); c.restore(); } });
      // 煙
      puffs.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, `rgba(200,200,210,${0.55 * (1 - clear)})`); g.addColorStop(1, 'rgba(200,200,210,0)'); c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); });
      // 熱源の輪郭（一方向スモークなので真実には見える）
      foes.forEach(f => { if (!f.alive) return; c.save(); c.globalAlpha = 0.85; c.strokeStyle = '#ff9a3a'; c.lineWidth = 3; c.beginPath(); c.ellipse(fx(f), f.y - 70, 40, 90, 0, 0, 7); c.stroke(); c.restore(); });
      hostages.forEach(h => { c.strokeStyle = '#5ff2ff'; c.lineWidth = 3; c.beginPath(); c.ellipse(h.x, h.y - 170, 60, 180, 0, 0, 7); c.stroke(); });
      shots.forEach(s => { s.t += dt; c.fillStyle = `rgba(255,240,180,${1 - s.t * 4})`; c.beginPath(); c.arc(s.x, s.y, 14, 0, 7); c.fill(); });
      shots = shots.filter(s => s.t < 0.25);
      const left = foes.filter(f => f.alive).length;
      m.hud.innerHTML = `<span>煙が晴れるまで ${Math.max(0, T).toFixed(1)}</span><span>残り敵 ${left}</span>`;
      if (fail) { m.cv.style.cursor = ''; return { ok: false, failTitle: '人質に当たった！', msg: '水色の輪郭は撃っちゃダメ！' }; }
      if (left === 0) { m.cv.style.cursor = ''; return { ok: true, title: 'クラッチ！', lines: ['ワンウェイスモークでのクラッチ……。', '自分、フレ申いっすか？'] }; }
      if (T <= 0) { m.cv.style.cursor = ''; return { ok: false, failTitle: '煙が晴れた…', msg: '時間切れ！　オレンジの輪郭を素早く撃とう。' }; }
    };
  })())
});
