// ===== ミニゲーム（4〜7章） =====

// 和文モールス
const WABUN = {
  'イ': '.-', 'ロ': '.-.-', 'ハ': '-...', 'ニ': '-.-.', 'ホ': '-..', 'ヘ': '.', 'ト': '..-..', 'チ': '..-.', 'リ': '--.', 'ヌ': '....', 'ル': '-.--.', 'ヲ': '.---', 'ワ': '-.-', 'カ': '.-..', 'ヨ': '--', 'タ': '-.', 'レ': '---', 'ソ': '---.', 'ツ': '.--.', 'ネ': '--.-', 'ナ': '.-.', 'ラ': '...', 'ム': '-', 'ウ': '..-', 'ノ': '..--', 'オ': '.-...', 'ク': '...-', 'ヤ': '.--', 'マ': '-..-', 'ケ': '-.--', 'フ': '--..', 'コ': '----', 'エ': '-.---', 'テ': '.-.--', 'ア': '--.--', 'サ': '-.-.-', 'キ': '-.-..', 'ユ': '-..--', 'メ': '-...-', 'ミ': '..-.-', 'シ': '--.-.', 'ヒ': '--..-', 'モ': '-..-.', 'セ': '.---.', 'ス': '---.-', 'ン': '.-.-.', '゛': '..', '゜': '..--.'
};
const GOJUON = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン゛゜';
const MORSE2KANA = Object.fromEntries(Object.entries(WABUN).map(([k, v]) => [v, k]));
const showMorse = s => s.replace(/\./g, '・').replace(/-/g, '－');

// ---------- 4章-A：モールス信号 ----------
MG.morse = () => minigame({
  title: 'モールス信号', sub: 'CHAPTER 4 ─ 1 BIT',
  lines: ['かぐやが1ビットの通信路で、月見刑務所の <span class="keys">秘密鍵</span> を送ってくる。', '光と音の信号を、和文モールス表で読み解いて入力しよう。', '短点（・）と長点（－）の組み合わせで1文字。文字の間は長めの間がある。'],
  play: (m) => new Promise(res => {
    const KEY = ['ヤ', 'ク', 'ソ', 'ク'];
    let phase = 'decode', answer = [], playing = false, lamp = 0, recv = '', stopFlag = false;
    const box = m.extra('', 'inset:0;background:#04050c;display:flex;flex-direction:column;align-items:center;padding-top:22px;');
    const playSignal = async () => {
      if (playing) return; playing = true; recv = ''; draw();
      const U = 0.16;
      for (let ci = 0; ci < KEY.length; ci++) {
        const code = WABUN[KEY[ci]];
        for (const s of code) {
          if (stopFlag) return;
          const d = s === '.' ? U : U * 3;
          AU.se('beep', { dur: d }); lamp = 1; recv += s; draw();
          await new Promise(r => setTimeout(r, d * 1000)); lamp = 0; draw();
          await new Promise(r => setTimeout(r, U * 1000));
        }
        recv += ' '; draw();
        await new Promise(r => setTimeout(r, U * 3500));
      }
      playing = false; draw();
    };
    const draw = () => {
      if (phase !== 'decode') return;
      box.querySelector('#lamp').style.background = lamp ? '#fff8c0' : '#2a2a20';
      box.querySelector('#lamp').style.boxShadow = lamp ? '0 0 40px #ffe680, 0 0 80px #ffe680' : 'none';
      box.querySelector('#recv').textContent = recv ? showMorse(recv).split(' ').filter(Boolean).join('　／　') : '（受信待ち）';
      box.querySelector('#ans').textContent = answer.join('') || '＿＿＿＿';
    };
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:26px;margin-bottom:10px">
        <div id="lamp" style="width:64px;height:64px;border-radius:50%;background:#2a2a20;border:3px solid #665"></div>
        <div><div style="color:#8ef;font:700 16px Consolas,monospace">RECEIVING ─ 1bit channel</div>
        <div id="recv" style="font:800 34px 'MS Gothic',monospace;color:#ffe680;min-width:700px;letter-spacing:4px"></div></div>
        <button class="mg-btn sub" id="replay" style="font-size:18px;padding:10px 20px">▶ 受信する</button>
      </div>
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px">
        <div style="font-size:22px">秘密鍵：</div><div id="ans" style="font:900 40px sans-serif;letter-spacing:10px;min-width:260px;color:#fff;border-bottom:3px solid #5ff2ff"></div>
        <button class="mg-btn sub" id="bs" style="font-size:18px;padding:8px 18px">1文字消す</button>
        <button class="mg-btn" id="send" style="font-size:20px;padding:10px 28px">打ち込む</button>
      </div>
      <div id="tbl" style="display:grid;grid-template-columns:repeat(10,112px);gap:5px"></div>`;
    const tbl = box.querySelector('#tbl');
    [...GOJUON].forEach(k => { const b = document.createElement('button'); b.style.cssText = 'background:#101830;border:1px solid #2a4a7a;color:#fff;border-radius:6px;padding:3px 0;cursor:pointer;font-family:inherit'; b.innerHTML = `<div style="font-size:22px;font-weight:800">${k}</div><div style="font:15px 'MS Gothic',monospace;color:#ffe680">${showMorse(WABUN[k])}</div>`; b.onclick = () => { if (answer.length < 8) { answer.push(k); AU.se('tap'); draw(); } }; tbl.appendChild(b); });
    box.querySelector('#replay').onclick = playSignal;
    box.querySelector('#bs').onclick = () => { answer.pop(); draw(); };
    box.querySelector('#send').onclick = () => {
      if (answer.join('') === KEY.join('')) { AU.se('ok'); stopFlag = true; startReply(); }
      else { AU.se('error'); box.querySelector('#ans').style.color = '#f46'; setTimeout(() => { box.querySelector('#ans').style.color = '#fff'; }, 500); }
    };
    draw(); setTimeout(playSignal, 600);
    // 返信フェーズ
    const startReply = () => {
      phase = 'reply';
      box.innerHTML = `<div style="margin-top:60px;font-size:28px;color:#fff">秘密鍵「<b style="color:#ffd94a">やくそく</b>」受信完了。かぐやに返事をしよう。</div>
        <div style="margin-top:14px;font-size:22px;color:#cde">送る言葉：<b style="font-size:34px;color:#5ff2ff">りょ</b>　（リ ＝ ${showMorse(WABUN['リ'])}　／　ョ ＝ ${showMorse(WABUN['ヨ'])}）</div>
        <div style="margin-top:12px;font-size:20px;color:#aab"><span style="color:#ffd94a">Space を押している長さ</span>で送信（短く＝・ 長く＝－）。少し待つと1文字確定。</div>
        <div id="buf" style="margin-top:40px;font:900 60px 'MS Gothic',monospace;color:#ffe680;min-height:70px;letter-spacing:8px"></div>
        <div id="out" style="margin-top:10px;font:900 56px sans-serif;color:#fff;min-height:70px;letter-spacing:12px"></div>
        <button id="key" class="mg-btn" style="margin-top:30px;width:240px;height:110px;font-size:26px;border-radius:20px">押して送信</button>
        <div id="msg" style="margin-top:16px;font-size:22px;color:#f8a;min-height:30px"></div>`;
      let buf = '', out = [], down = 0, idle = null, done = false;
      const bufEl = box.querySelector('#buf'), outEl = box.querySelector('#out'), msg = box.querySelector('#msg');
      const commit = () => {
        const k = MORSE2KANA[buf] || '？'; out.push(k); buf = ''; bufEl.textContent = ''; outEl.textContent = out.join('').replace('ヨ', 'ョ');
        if (out.length === 2) {
          if (out[0] === 'リ' && out[1] === 'ヨ') { done = true; msg.style.color = '#7f7'; msg.textContent = '送信完了。……「りょ」でいいのか？'; AU.se('clear'); setTimeout(() => { m.reset(); res({ ok: true, title: '脱出準備完了', lines: ['＜いろは　りょ　って　なに＞', '＜りょうかい　の　りょ＞', '＜ぎゃるか＞'] }); }, 1800); }
          else { AU.se('error'); msg.textContent = `「${out.join('')}」になっちゃった。もう一回！`; setTimeout(() => { out = []; outEl.textContent = ''; msg.textContent = ''; }, 1200); }
        }
      };
      const press = () => { if (done || down) return; down = performance.now(); clearTimeout(idle); AU.se('beep', { dur: 0.08 }); box.querySelector('#key').style.filter = 'brightness(1.6)'; };
      const release = () => { if (!down) return; const d = (performance.now() - down) / 1000; down = 0; box.querySelector('#key').style.filter = ''; buf += d < 0.22 ? '.' : '-'; bufEl.textContent = showMorse(buf); idle = setTimeout(commit, 750); };
      m.onkey = e => { if (e.code === 'Space') press(); };
      m.onkeyup = e => { if (e.code === 'Space') release(); };
      const kb = box.querySelector('#key'); kb.onmousedown = press; kb.onmouseup = release; kb.onmouseleave = release;
    };
  })
});

// ---------- 4章-B：月見刑務所 脱獄 ----------
MG.stealth = () => minigame({
  title: '月見刑務所 脱獄', sub: 'CHAPTER 4 ─ STEALTH',
  lines: ['<span class="keys">WASD / 矢印キー</span> で移動。出口（EXIT）まで逃げよう。', '看守の視界（黄色）とサーチライト（赤）に入ったら見つかる。', '壁の向こうは見られない。曲がり角でタイミングを計ろう。'],
  play: (m) => m.run((() => {
    const c = m.ctx; const TS = 40;
    const RAW = [
      '################################',
      '#S.....#.........#.............#',
      '#......#.........#.............#',
      '#......#...###...#....######...#',
      '#..........#.#.........#.......#',
      '#......#...#.#...#.....#.......#',
      '####.###...###...###.###...#####',
      '#................#.........#...#',
      '#..######..####..#..####...#...#',
      '#..#....#..#..#.....#..#.......#',
      '#..#....#..#..#..#..#..#...#...#',
      '#..#....##.####..#..##.#...#...#',
      '#..........................#...#',
      '#####..######..######..#####...#',
      '#..............#...............#',
      '#..####..####..#..#######..#...#',
      '#..............#.............#E#',
      '################################'];
    const MAP = RAW.map(r => r.padEnd(32, '#').slice(0, 32));
    const wall = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return ty < 0 || ty >= 18 || tx < 0 || tx >= 32 || MAP[ty][tx] === '#'; };
    let sx = 1, sy = 1, ex = 30, ey = 16;
    const P = { x: (sx + 0.5) * TS, y: (sy + 0.5) * TS, r: 11 };
    const trail = [];
    const mkG = (pts, spd = 75) => ({ pts: pts.map(([x, y]) => ({ x: (x + 0.5) * TS, y: (y + 0.5) * TS })), i: 0, x: (pts[0][0] + 0.5) * TS, y: (pts[0][1] + 0.5) * TS, a: 0, spd, wait: 0 });
    const guards = [mkG([[10, 7], [16, 7]]), mkG([[1, 12], [26, 12]], 95), mkG([[19, 1], [30, 1], [30, 2], [19, 2]]), mkG([[2, 14], [14, 14]], 85), mkG([[17, 14], [26, 14], [26, 16], [17, 16]], 70), mkG([[10, 9], [10, 12]], 60)];
    const lights = [{ x: 24.5 * TS, y: 9.5 * TS, a: 0, sp: 0.9, r: 190 }, { x: 4.5 * TS, y: 4.5 * TS, a: 2, sp: -0.7, r: 150 }];
    const los = (ax, ay, bx, by) => { const d = Math.hypot(bx - ax, by - ay); const n = Math.ceil(d / 8); for (let i = 1; i < n; i++) if (wall(ax + (bx - ax) * i / n, ay + (by - ay) * i / n)) return false; return true; };
    const inCone = (ox, oy, ang, half, range) => { const dx = P.x - ox, dy = P.y - oy, d = Math.hypot(dx, dy); if (d > range) return false; let da = Math.atan2(dy, dx) - ang; da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) < half && los(ox, oy, P.x, P.y); };
    const drawCone = (ox, oy, ang, half, range, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(ox, oy); const N = 24; for (let i = 0; i <= N; i++) { const a = ang - half + 2 * half * i / N; let d = 0; while (d < range && !wall(ox + Math.cos(a) * d, oy + Math.sin(a) * d)) d += 6; c.lineTo(ox + Math.cos(a) * d, oy + Math.sin(a) * d); } c.closePath(); c.fill(); };
    let caught = 0, T = 0, win = 0;
    return dt => {
      T += dt;
      if (!caught && !win) {
        let vx = 0, vy = 0; const k = m.keys;
        if (k.ArrowLeft || k.KeyA) vx--; if (k.ArrowRight || k.KeyD) vx++; if (k.ArrowUp || k.KeyW) vy--; if (k.ArrowDown || k.KeyS) vy++;
        const l = Math.hypot(vx, vy) || 1; const sp = 150;
        const nx = P.x + vx / l * sp * dt, ny = P.y + vy / l * sp * dt;
        const free = (x, y) => !wall(x - P.r, y - P.r) && !wall(x + P.r, y - P.r) && !wall(x - P.r, y + P.r) && !wall(x + P.r, y + P.r);
        if (free(nx, P.y)) P.x = nx; if (free(P.x, ny)) P.y = ny;
        if (vx || vy) { trail.unshift({ x: P.x, y: P.y }); if (trail.length > 60) trail.pop(); }
        guards.forEach(g => {
          if (g.wait > 0) { g.wait -= dt; g.a += Math.sin(T * 3) * dt * 2; return; }
          const tgt = g.pts[(g.i + 1) % g.pts.length]; const dx = tgt.x - g.x, dy = tgt.y - g.y, d = Math.hypot(dx, dy);
          const want = Math.atan2(dy, dx); let da = Math.atan2(Math.sin(want - g.a), Math.cos(want - g.a)); g.a += Math.max(-dt * 5, Math.min(dt * 5, da));
          if (d < 3) { g.i = (g.i + 1) % g.pts.length; g.wait = 0.9; } else { g.x += dx / d * g.spd * dt; g.y += dy / d * g.spd * dt; }
        });
        lights.forEach(L => L.a += L.sp * dt);
        if (guards.some(g => inCone(g.x, g.y, g.a, 0.5, 170)) || lights.some(L => inCone(L.x, L.y, L.a, 0.33, L.r))) { caught = 0.001; AU.se('buzzer'); }
        if (Math.floor(P.x / TS) === ex && Math.floor(P.y / TS) === ey) { win = 0.001; AU.se('door'); }
      }
      // draw
      c.fillStyle = '#060814'; c.fillRect(0, 0, 1280, 720);
      for (let y = 0; y < 18; y++) for (let x = 0; x < 32; x++) {
        if (MAP[y][x] === '#') { c.fillStyle = '#1a2148'; c.fillRect(x * TS, y * TS, TS, TS); c.strokeStyle = '#2c3a7a'; c.strokeRect(x * TS + .5, y * TS + .5, TS - 1, TS - 1); }
        else { c.fillStyle = (x + y) % 2 ? '#0b0f22' : '#0d1226'; c.fillRect(x * TS, y * TS, TS, TS); }
      }
      txt(c, 'EXIT', (ex + 0.5) * TS, (ey + 0.5) * TS + 6, { size: 14, align: 'center', color: '#3f8', glow: '#3f8' });
      c.fillStyle = 'rgba(60,255,140,.25)'; c.fillRect(ex * TS, ey * TS, TS, TS);
      guards.forEach(g => drawCone(g.x, g.y, g.a, 0.5, 170, 'rgba(255,220,80,.22)'));
      lights.forEach(L => { drawCone(L.x, L.y, L.a, 0.33, L.r, 'rgba(255,40,70,.28)'); c.fillStyle = '#f24'; c.beginPath(); c.arc(L.x, L.y, 8, 0, 7); c.fill(); });
      guards.forEach(g => { c.fillStyle = '#ffd84a'; c.beginPath(); c.arc(g.x, g.y, 13, 0, 7); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(g.x + Math.cos(g.a) * 7, g.y + Math.sin(g.a) * 7, 4, 0, 7); c.fill(); });
      const f1 = trail[18] || P, f2 = trail[36] || P;
      c.fillStyle = 'rgba(95,242,255,.35)'; c.beginPath(); c.arc(P.x, P.y, 16 + Math.sin(T * 6) * 3, 0, 7); c.fill();
      drawSprite(c, 'mami', f2.x, f2.y + 20, 50); drawSprite(c, 'roka', f1.x, f1.y + 22, 58); drawSprite(c, 'iroha', P.x, P.y + 22, 60);
      m.hud.innerHTML = `<span></span><span>月見刑務所 B3F　EXIT は右下</span>`;
      if (caught) { caught += dt; c.fillStyle = `rgba(255,0,40,${0.3 + 0.2 * Math.sin(T * 20)})`; c.fillRect(0, 0, 1280, 720); txt(c, '！', P.x, P.y - 30, { size: 56, align: 'center', color: '#ff0', stroke: '#000' }); if (caught > 1.3) return { ok: false, failTitle: '見つかった！', msg: '看守が背中を向けた瞬間を狙おう。' }; }
      if (win) { win += dt; if (win > 0.8) return { ok: true, title: '脱獄成功！', lines: ['月見刑務所、セキュリティ評価：「かぐやの前では紙」。'] }; }
    };
  })())
});

// ---------- 5章-A：洗脳解除ライブ（リズムゲーム） ----------
MG.rhythm = () => minigame({
  title: '洗脳解除ライブ', sub: 'CHAPTER 5 ─ RHYTHM',
  lines: ['特殊音波（＝歌）で、ブラックアビスの洗脳を解こう！', '落ちてくるノーツが線に重なったら <span class="keys">D F J K</span>（または ← ↓ ↑ →）', '最後に <span class="keys">洗脳解除率 70%</span> 以上でクリア。', '芦花が歌い、真実が踊り、いろははマシンガンでリズムを刻む。'],
  skipAfter: 1,
  play: (m) => new Promise(async res => {
    AU.stopBGM(0.3);
    const c = m.ctx; const s = AU.startSynth('live', 3.0); const ch = AU.chart('live');
    const notes = ch.notes.map(n => ({ ...n, t: n.time + s.t0, judged: false }));
    const LX = [470, 580, 690, 800], LW = 104, JY = 610, SPD = 520;
    let gauge = 15, combo = 0, maxc = 0, fx = [], press = [0, 0, 0, 0], label = '', labelT = 0, cnt = { P: 0, G: 0, O: 0, M: 0 };
    const keymap = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
    const judge = lane => {
      press[lane] = 0.12; AU.se('mgun');
      const now = AU.ctx.currentTime;
      const n = notes.find(n => !n.judged && n.lane === lane && Math.abs(n.t - now) < 0.16);
      if (!n) return;
      const d = Math.abs(n.t - now); n.judged = true;
      let r = d < 0.05 ? 'PERFECT' : d < 0.1 ? 'GREAT' : 'GOOD';
      gauge = Math.min(100, gauge + (r === "PERFECT" ? 1.3 : r === "GREAT" ? 1.0 : 0.6)); combo++; maxc = Math.max(maxc, combo);
      cnt[r[0]]++;
      fx.push({ lane, r, t: 0 });
    };
    m.onkey = e => { if (keymap[e.code] !== undefined) judge(keymap[e.code]); };
    m.onclick = p => { for (let i = 0; i < 4; i++) if (Math.abs(p.x - LX[i]) < LW / 2) judge(i); };
    const r = await m.run(dt => {
      const now = AU.ctx.currentTime;
      notes.forEach(n => { if (!n.judged && now - n.t > 0.16) { n.judged = true; combo = 0; gauge = Math.max(0, gauge - 1.2); cnt.M++; fx.push({ lane: n.lane, r: 'MISS', t: 0 }); } });
      ch.labels.forEach(l => { if (now >= l.time + s.t0 && now < l.time + s.t0 + dt + 0.02) { label = l.text; labelT = 3.5; } });
      labelT -= dt; press = press.map(p => Math.max(0, p - dt));
      // 背景
      c.fillStyle = '#0a0214'; c.fillRect(0, 0, 1280, 720);
      const beat = ((now - s.t0) * 150 / 60) % 1; const pulse = Math.max(0, 1 - beat * 3);
      c.save(); c.globalCompositeOperation = 'lighter';
      ['255,80,170', '95,242,255', '255,216,74'].forEach((col, i) => { const a = Math.PI / 2 + Math.sin(now * (0.8 + i * 0.4) + i) * 0.5; c.fillStyle = `rgba(${col},${0.1 + pulse * 0.08})`; c.beginPath(); c.moveTo(200 + i * 440, -10); c.lineTo(200 + i * 440 + Math.cos(a - .12) * 900, Math.sin(a - .12) * 900); c.lineTo(200 + i * 440 + Math.cos(a + .12) * 900, Math.sin(a + .12) * 900); c.fill(); });
      c.restore();
      drawSprite(c, 'roka', 190, 720, 520 + pulse * 6);
      drawSprite(c, 'mami', 1090, 700 - Math.abs(Math.sin((now - s.t0) * Math.PI * 150 / 60)) * 26, 400, { flip: Math.floor((now - s.t0) * 150 / 120) % 2 === 0 });
      drawSprite(c, 'iroha', 1180, 735, 330);
      // 観客（洗脳度で目の色が変わる）
      for (let i = 0; i < 12; i++) { const k = gauge / 100; grunt(c, 60 + i * 105, 760 + Math.abs(Math.sin(now * 5 + i)) * -14 * k, 0.9, { gun: false, eye: k > 0.7 ? '#5ff2ff' : k > 0.4 ? '#c0a0ff' : '#c060ff' }); }
      // レーン
      LX.forEach((x, i) => { c.fillStyle = `rgba(20,10,40,.78)`; c.fillRect(x - LW / 2, 0, LW, 720); if (press[i]) { c.fillStyle = `rgba(95,242,255,${press[i] * 3})`; c.fillRect(x - LW / 2, 0, LW, JY); } c.strokeStyle = 'rgba(255,255,255,.15)'; c.strokeRect(x - LW / 2, 0, LW, 720); txt(c, 'DFJK'[i], x, 680, { size: 28, align: 'center', color: '#7ef' }); });
      c.fillStyle = '#fff'; c.fillRect(LX[0] - LW / 2, JY - 3, LW * 4, 6);
      notes.forEach(n => {
        if (n.judged) return; const y = JY - (n.t - now) * SPD; if (y < -40 || y > 740) return;
        if (n.long) { c.fillStyle = 'rgba(255,120,200,.35)'; c.fillRect(LX[n.lane] - 18, y - n.long * SPD, 36, n.long * SPD); }
        c.fillStyle = ['#ff5fa8', '#5ff2ff', '#5ff2ff', '#ff5fa8'][n.lane]; rrect(c, LX[n.lane] - LW / 2 + 6, y - 12, LW - 12, 24, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(LX[n.lane] - LW / 2 + 14, y - 6, LW - 28, 4);
      });
      fx.forEach(f => { f.t += dt; txt(c, f.r, LX[f.lane], JY - 50 - f.t * 60, { size: 24, align: 'center', color: f.r === 'MISS' ? '#88a' : f.r === 'PERFECT' ? '#ffd84a' : '#5ff2ff', stroke: '#000', sw: 4 }); });
      fx = fx.filter(f => f.t < 0.5);
      if (combo >= 5) txt(c, combo + ' COMBO', 635, 300, { size: 48, align: 'center', color: '#fff', stroke: '#f4a', sw: 6 });
      if (labelT > 0) txt(c, '♪ ' + label, 640, 110, { size: 36, align: 'center', color: '#fff', glow: '#f4a' });
      if (now < s.t0) txt(c, Math.ceil(s.t0 - now), 640, 360, { size: 120, align: 'center', color: '#fff', stroke: '#a6f', sw: 8 });
      // ゲージ
      c.fillStyle = '#222'; c.fillRect(380, 30, 520, 26); c.fillStyle = gauge >= 70 ? '#5ff2ff' : '#c060ff'; c.fillRect(380, 30, 520 * gauge / 100, 26); c.fillStyle = '#fff'; c.fillRect(380 + 520 * 0.7, 24, 3, 38);
      txt(c, `洗脳解除率 ${gauge.toFixed(0)}%`, 640, 50, { size: 18, align: 'center', color: '#fff', stroke: '#000', sw: 3 });
      if (now > s.t0 + ch.length + 1.0) return gauge;
    });
    s.stop(0.5);
    const lines = [`PERFECT ${cnt.P}　GREAT ${cnt.G}　GOOD ${cnt.O}　MISS ${cnt.M}　最大コンボ ${maxc}`];
    if (r >= 70) res({ ok: true, title: `洗脳解除率 ${r.toFixed(0)}%`, lines: lines.concat(['ブラックアビスのメンバーの目に、光が戻っていく――！']) });
    else res({ ok: false, failTitle: `洗脳解除率 ${r.toFixed(0)}%`, msg: lines[0] + '<br>まだ洗脳が残っている…！ もう一曲！' });
  })
});

// ---------- 5章-B：コール＆レスポンス ----------
MG.callres = () => minigame({
  title: 'コール＆レスポンス', sub: 'CHAPTER 5 ─ CALL & RESPONSE',
  lines: ['いろはのコールに合わせて、会場を盛り上げよう！', 'マーカーが <span class="keys">ピンクの枠</span> に入った瞬間に Space / クリック！'],
  play: (m) => m.run((() => {
    const c = m.ctx;
    const calls = [['お前らブチ上がってるか～？', 'イェーーーーーーー↑↑↑↑'], ['洗脳は解けたか～？', 'イェーーーーーーー↑↑↑↑'], ['ヤチヨを倒したいか～？', 'イェーーーーーーー↑↑↑↑'], ['ブラック～？', 'アビス！　アビス！']];
    let i = 0, t = 0, state = 'call', score = 0, resp = '', respT = 0, big = false;
    const hit = () => { if (state !== 'bar') return; const p = t / 1.3; big = p > 0.68 && p < 0.86; if (big) { score++; AU.se('cheer'); AU.se('cheer'); } else AU.se('cheer'); resp = big ? calls[i][1] : 'い、いぇー…？'; respT = 1.6; state = 'resp'; };
    m.onkey = e => { if (e.code === 'Space' || e.code === 'Enter') hit(); };
    m.onclick = hit;
    return dt => {
      t += dt;
      c.fillStyle = '#0a0214'; c.fillRect(0, 0, 1280, 720);
      BG.helpers.crowd(c, BG.helpers.R(9), 740, 14, '#05000a', performance.now() / 1000, state === 'resp' && big ? 18 : 3);
      drawSprite(c, 'iroha', 640, 640, 420);
      if (state === 'call') { txt(c, calls[i][0], 640, 140, { size: 56, align: 'center', color: '#fff', stroke: '#a6f', sw: 8 }); if (t > 1.2) { state = 'bar'; t = 0; } }
      if (state === 'bar') {
        txt(c, calls[i][0], 640, 140, { size: 56, align: 'center', color: '#fff', stroke: '#a6f', sw: 8 });
        c.fillStyle = '#222'; c.fillRect(290, 620, 700, 40); c.fillStyle = 'rgba(255,80,170,.6)'; c.fillRect(290 + 700 * 0.68, 620, 700 * 0.18, 40);
        c.fillStyle = '#fff'; c.fillRect(290 + 700 * Math.min(1, t / 1.3) - 4, 610, 8, 60);
        if (t > 1.3) { resp = '……（しーん）'; big = false; respT = 1.4; state = 'resp'; AU.se('error'); }
      }
      if (state === 'resp') {
        respT -= dt; txt(c, resp, 640, 330, { size: big ? 80 : 44, align: 'center', color: big ? '#ffd84a' : '#99a', stroke: '#000', sw: 8 });
        if (respT <= 0) { i++; t = 0; state = 'call'; if (i >= calls.length) return { ok: true, title: `盛り上がり ${score}/4`, lines: [score >= 3 ? '会場は最高潮！　完全に洗脳解除！' : 'ちょっと噛み合わなかったけど、気持ちは伝わった！'] }; }
      }
      m.hud.innerHTML = `<span>${i + 1}/4</span><span>盛り上がり ${'🔥'.repeat(score)}</span>`;
    };
  })())
});

// ---------- 6章-A：ヤチヨ戦（弾幕） ----------
MG.danmaku = () => minigame({
  title: 'ヤチヨの注目を集めろ', sub: 'CHAPTER 6 ─ BOSS',
  lines: ['いろはがヤチヨの気を引いている間に、かぐやがハッキングする作戦。', '<span class="keys">矢印 / WASD</span> で移動（<span class="keys">Shift</span> で低速）。キーターから音符を自動発射。', 'ヤチヨに当てると <span class="keys">注目ゲージ</span> が上がり、注目されている間だけハッキングが進む。', '<span class="keys">X</span>：ブラックアビス援護射撃（弾消し・2回）。ライフは5。'],
  play: (m) => m.run((() => {
    const c = m.ctx;
    const P = { x: 640, y: 620, inv: 0, lives: 5, bombs: 2 };
    const Y = { x: 640, y: 150 };
    let shots = [], bullets = [], T = 0, fire = 0, aggro = 30, prog = 0, a1 = 0, tm = { ring: 0, spiral: 0, fan: 0, petal: 0, talk: 0 }, talk = 'うふふ……可愛いデザートが自分から来てくれたのね', bombT = 0;
    const taunts = ['どうして洗脳が解けているの……？', '邪魔をしないで、いろはちゃん', 'あなたの脳、いちばん美味しそう', 'メンダコたち、おいで', '私の世界で、私に勝てると思って？', 'かぐや……？　どこにいるの……？'];
    m.onkey = e => { if (e.code === 'KeyX' && P.bombs > 0) { P.bombs--; bullets = []; bombT = 1.2; AU.se('explode'); shake(400, 14); aggro = Math.min(100, aggro + 20); } };
    const shoot = (x, y, a, sp, r, kind) => bullets.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, kind });
    return dt => {
      T += dt;
      const k = m.keys, slow = k.ShiftLeft || k.ShiftRight; const sp = slow ? 170 : 380;
      let vx = (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0), vy = (k.ArrowDown || k.KeyS ? 1 : 0) - (k.ArrowUp || k.KeyW ? 1 : 0);
      const l = Math.hypot(vx, vy) || 1; P.x = Math.max(30, Math.min(1250, P.x + vx / l * sp * dt)); P.y = Math.max(260, Math.min(700, P.y + vy / l * sp * dt));
      P.inv -= dt; bombT -= dt;
      Y.x = 640 + Math.sin(T * 0.6) * 300; Y.y = 185 + Math.sin(T * 1.3) * 25;
      fire -= dt; if (fire <= 0) { fire = 0.09; shots.push({ x: P.x - 10, y: P.y - 40 }, { x: P.x + 10, y: P.y - 40 }); }
      shots.forEach(s => s.y -= 950 * dt);
      shots = shots.filter(s => { if (Math.abs(s.x - Y.x) < 70 && Math.abs(s.y - Y.y) < 110) { aggro = Math.min(100, aggro + 1.1); return false; } return s.y > -20; });
      aggro = Math.max(0, aggro - 7 * dt);
      prog = Math.min(100, prog + dt * (aggro > 25 ? 2.3 : 0.35));
      const ph = prog < 33 ? 1 : prog < 66 ? 2 : 3;
      // 弾幕
      tm.ring -= dt; tm.spiral -= dt; tm.fan -= dt; tm.petal -= dt; tm.talk -= dt;
      if (tm.ring <= 0) { tm.ring = ph === 3 ? 0.75 : 1.0; const n = ph === 3 ? 22 : 16; const off = T; for (let i = 0; i < n; i++) shoot(Y.x, Y.y, off + i * Math.PI * 2 / n, 150 + ph * 15, 11, 'tako'); }
      if (ph >= 2 && tm.spiral <= 0) { tm.spiral = 0.075; a1 += 0.32; shoot(Y.x, Y.y, a1, 210, 7, 'red'); shoot(Y.x, Y.y, a1 + Math.PI, 210, 7, 'red'); }
      if (ph >= 2 && tm.fan <= 0) { tm.fan = 1.6; const a = Math.atan2(P.y - Y.y, P.x - Y.x); for (let i = -2; i <= 2; i++) shoot(Y.x, Y.y, a + i * 0.14, 300, 8, 'aim'); }
      if (ph === 3 && tm.petal <= 0) { tm.petal = 0.12; bullets.push({ x: Math.random() * 1280, y: -10, vx: (Math.random() - .5) * 60, vy: 150 + Math.random() * 80, r: 7, kind: 'petal' }); }
      if (tm.talk <= 0) { tm.talk = 5; talk = taunts[Math.floor(Math.random() * taunts.length)]; }
      bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; });
      bullets = bullets.filter(b => b.x > -30 && b.x < 1310 && b.y > -30 && b.y < 750);
      if (P.inv <= 0 && bullets.some(b => Math.hypot(b.x - P.x, b.y - P.y) < b.r + 4)) { P.lives--; P.inv = 1.6; bullets = bullets.filter(b => Math.hypot(b.x - P.x, b.y - P.y) > 160); AU.se('hit'); shake(300, 12); }
      // draw
      c.fillStyle = '#030616'; c.fillRect(0, 0, 1280, 720);
      BG.helpers.moon(c, 640, 120, 90, '#fff8e6', '#bfe0ff');
      c.fillStyle = 'rgba(10,36,72,.8)'; c.fillRect(0, 520, 1280, 200);
      drawSprite(c, 'yachiyo', Y.x, Y.y + 120, 260, { filter: aggro > 25 ? 'drop-shadow(0 0 16px #f4a)' : 'none' });
      shots.forEach(s => txt(c, '♪', s.x, s.y, { size: 22, align: 'center', color: '#5ff2ff' }));
      bullets.forEach(b => {
        if (b.kind === 'tako') BG.helpers.mendako(c, b.x, b.y + 4, 0.38);
        else if (b.kind === 'petal') { c.fillStyle = '#ffb3d1'; c.beginPath(); c.ellipse(b.x, b.y, 8, 5, T * 3, 0, 7); c.fill(); }
        else { c.fillStyle = b.kind === 'red' ? '#ff3050' : '#ffd84a'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x, b.y, b.r * 0.45, 0, 7); c.fill(); }
      });
      if (!(P.inv > 0 && Math.floor(T * 16) % 2)) drawSprite(c, 'iroha', P.x, P.y + 40, 90);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(P.x, P.y, 4, 0, 7); c.fill(); c.strokeStyle = '#f4a'; c.lineWidth = 2; c.stroke();
      if (bombT > 0) { c.fillStyle = `rgba(200,120,255,${bombT * 0.4})`; c.fillRect(0, 0, 1280, 720); txt(c, 'ブラックアビス援護射撃！', 640, 400, { size: 54, align: 'center', color: '#fff', stroke: '#a14fff', sw: 8 }); }
      // UI
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(0, 676, 1280, 44);
      txt(c, `ヤチヨ「${talk}」`, 20, 706, { size: 20, color: '#ffc8e0' });
      c.fillStyle = '#222'; c.fillRect(840, 20, 400, 16); c.fillStyle = aggro > 25 ? '#ff4fa8' : '#665'; c.fillRect(840, 20, 4 * aggro, 16); c.fillStyle = '#fff'; c.fillRect(840 + 100, 16, 2, 24);
      txt(c, '注目', 830, 34, { size: 16, align: 'right' });
      c.fillStyle = '#222'; c.fillRect(840, 46, 400, 16); c.fillStyle = '#5ff2ff'; c.fillRect(840, 46, 4 * prog, 16);
      txt(c, 'ハッキング', 830, 60, { size: 16, align: 'right' }); txt(c, prog.toFixed(0) + '%', 1248, 60, { size: 14, align: 'right' });
      m.hud.innerHTML = `<span>LIFE ${'♥'.repeat(Math.max(0, P.lives))}　援護 ${'★'.repeat(P.bombs)}</span><span></span>`;
      if (prog >= 100) return { ok: true, title: 'ハッキング完了まで、あと少し！', lines: ['ヤチヨは、いろはに完全に気を取られている。', '――その背後の電柱が、虹色に光った。'] };
      if (P.lives <= 0) return { ok: false, failTitle: 'デザートにされた…', msg: 'Shiftで低速移動すると避けやすい。ヤチヨに当て続けて注目を切らさないように！' };
    };
  })())
});

// ---------- 6章-B：最終ハッキング（タイピング） ----------
MG.typing = () => minigame({
  title: 'ハッキング', sub: 'CHAPTER 6 ─ ROOT ACCESS',
  lines: ['かぐやになって、世界の権限を書き換えよう。', '表示されたコマンドをそのまま入力。<span class="keys">半角英数モード</span>で！', '制限時間は90秒。ヤチヨの妨害に負けるな。'],
  play: (m) => new Promise(res => {
    const cmds = [
      ['sudo su kaguya', '> root 権限を取得'],
      ['chown -R kaguya /world', "> 権限を'月見かぐや'に移動"],
      ['grant yachiyo --deny logout', "> '月見ヤチヨ'にログアウト不可を付与"],
      ['grant yachiyo --lock motion', "> '月見ヤチヨ'に身体動作制限を付与"],
      ['mute yachiyo', "> '月見ヤチヨ'に発言不可を付与"],
      ['logout --all-users', '> 全ユーザーの強制ログアウト開始'],
    ];
    let ci = 0, pos = 0, miss = 0, T = 90, done = false, glitchT = 0;
    const box = m.extra('', 'inset:0;background:#000a05;padding:40px 60px;font:24px/1.6 Consolas,"MS Gothic",monospace;color:#7f9;');
    box.innerHTML = `<div style="color:#5ff2ff">tukimi-world-core v2.050 ── kaguya@electric-pole:~$</div><div id="hist" style="height:300px;overflow:hidden;color:#5a8"></div>
      <div style="margin-top:20px;font-size:40px;letter-spacing:2px" id="cur"></div>
      <div id="ime" style="color:#f68;font-size:20px;height:30px"></div>
      <div style="position:absolute;right:60px;top:40px;color:#fff;font-size:28px" id="tm"></div>
      <div id="yell" style="position:absolute;right:60px;bottom:60px;color:#ff8ac0;font-size:26px;text-align:right"></div>`;
    const hist = box.querySelector('#hist'), cur = box.querySelector('#cur'), tm = box.querySelector('#tm'), yell = box.querySelector('#yell'), ime = box.querySelector('#ime');
    const yells = ['かぐや！　今すぐ止めなさい！', 'ママの言うことが聞けないの！？', 'このクソチーターがぁ！', 'やめて……私の世界……！'];
    const render = () => {
      const s = cmds[ci][0];
      const scr = glitchT > 0 ? s.split('').map(ch => Math.random() < 0.3 ? '#$%&@!?'[Math.floor(Math.random() * 7)] : ch).join('') : s;
      cur.innerHTML = `<span style="color:#5ff2ff">$ </span><span style="color:#fff">${scr.slice(0, pos).replace(/ /g, '&nbsp;')}</span><span style="background:#7f9;color:#000">${(scr[pos] || ' ').replace(' ', '&nbsp;')}</span><span style="color:#3a6">${scr.slice(pos + 1).replace(/ /g, '&nbsp;')}</span>`;
    };
    render();
    m.onkey = e => {
      if (done) return;
      if (e.key === 'Process' || e.isComposing) { ime.textContent = '※ 日本語入力がオンになっています。半角英数に切り替えてね'; return; }
      if (e.key.length !== 1) return;
      ime.textContent = '';
      const s = cmds[ci][0];
      if (e.key === s[pos]) {
        pos++; AU.se('type');
        if (pos >= s.length) { AU.se('ok'); hist.innerHTML += `<div>$ ${s}</div><div style="color:#ffd94a">${cmds[ci][1]}</div>`; hist.scrollTop = 9999; ci++; pos = 0; if (ci >= cmds.length) { done = true; } }
      } else { miss++; AU.se('error'); box.style.background = '#2a0008'; setTimeout(() => box.style.background = '#000a05', 80); }
      if (!done) render();
    };
    m.run(dt => {
      T -= dt; glitchT -= dt;
      if (Math.random() < dt / 7) { glitchT = 0.9; glitch(500); yell.textContent = 'ヤチヨ「' + yells[Math.floor(Math.random() * yells.length)] + '」'; }
      if (glitchT > 0 && Math.random() < 0.3) render(); else if (glitchT <= 0 && glitchT > -dt * 2) render();
      tm.textContent = `TIME ${Math.max(0, T).toFixed(1)}`;
      if (done) return { ok: true, title: 'ROOT ACCESS GRANTED', lines: [`ミスタイプ ${miss}回`, '「隙だらけじゃん。」'] };
      if (T <= 0) return { ok: false, failTitle: 'タイムアウト', msg: 'ヤチヨに気づかれた！　もう一度！（半角英数モードを確認）' };
    }).then(res);
  })
});

// ---------- 7章：スマホで検索 → Wikipedia ----------
MG.phone = () => new Promise(res => {
  const m = mgOpen();
  m.root.style.background = 'rgba(0,0,0,.35)';
  const ph = m.extra('<div class="scr"></div>', 'inset:0'); ph.className = 'phone mg-extra';
  ph.style.cssText = '';
  const scr = ph.querySelector('.scr');
  const screenSearch = () => {
    scr.innerHTML = `<div class="srch"><div class="gl"><span>S</span><span>e</span><span>a</span><span>r</span><span>c</span><span>h</span></div>
      <input id="q" placeholder="検索ワードを入力" autocomplete="off"><div class="sug" id="sug">🔍 月見かぐや</div></div>`;
    const q = scr.querySelector('#q'); setTimeout(() => q.focus(), 100);
    const go = () => { const v = q.value.trim(); if (/かぐや|kaguya|カグヤ/i.test(v)) screenResults(); else if (v) { q.value = ''; q.placeholder = '「月見かぐや」で検索してみよう'; AU.se('error'); } };
    q.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) go(); };
    scr.querySelector('#sug').onclick = () => { q.value = '月見かぐや'; AU.se('tap'); setTimeout(screenResults, 300); };
  };
  const screenResults = () => {
    AU.se('click');
    scr.innerHTML = `<div class="res"><div style="font-size:13px;color:#666;margin-bottom:12px">「月見かぐや」の検索結果 約 3 件</div>
      <div class="item" id="wk"><div class="u">ja.wikipedia.org › wiki › 月見かぐや</div><div class="t">月見かぐや - Wikipedia</div><div class="d">月見かぐや（つきみ かぐや）は日本生まれのプログラマー。母は月見ヤチヨ。……</div></div>
      <div class="item"><div class="u">news-matome.jp</div><div class="t">【2年前】VR世界大規模不正アクセス事件まとめ</div><div class="d">第二の世界は一夜にして消えた。創始者・月見ヤチヨ容疑者は今も行方不明……</div></div>
      <div class="item"><div class="u">chiebukuro.example</div><div class="t">電柱が虹色に光っているのを見ました。通報すべきですか？</div><div class="d">ベストアンサー：疲れているのだと思います……</div></div></div>`;
    scr.querySelector('#wk').onclick = screenWiki;
  };
  const screenWiki = () => {
    AU.se('click');
    scr.innerHTML = `<div class="wiki"><div class="bar">☰ <b>W</b>IKIPEDIA</div><div class="body">
      <h1 id="wt">月見かぐや</h1>
      <div class="note">出典: フリー百科事典『ウィキペディア（Wikipedia）』</div>
      <div class="warn">この記事は出典が不十分です。</div>
      <div class="infobox"><img src="img/kaguya_real.png"><div>月見かぐや</div></div>
      <p><b>月見かぐや</b>（つきみ かぐや　英:Tukimi Kaguya）は日本生まれのプログラマー。母は<span class="lk">月見ヤチヨ</span>。</p>
      <p><span class="lk">Tukimi社</span>のVR世界『<span class="lk">it'a true wolrd</span>』での抗争に巻き込まれ、その後行方不明になっている。</p>
      <h3>業績</h3><p>世界を守った天才ハッカーである</p><p>ふはははWikipediaおそるるにたらず！ハッキングしてやったぜ</p><p>だれかみてるー？</p>
      <h3>関連項目</h3><p>・<span class="lk">天才</span><br>・<span class="lk">天才ハッカー</span><br>・<span class="lk">かわいい</span></p>
      <div class="talk"><div style="font-size:12px;color:#555">この記事のノートに書き込む（「だれかみてるー？」へ返信）</div>
      <div id="thread"></div><input id="rep" placeholder="返信を書く" autocomplete="off"> <button id="post">投稿</button></div>
      </div></div>`;
    const rep = scr.querySelector('#rep'), thread = scr.querySelector('#thread');
    let posted = false;
    const post = async () => {
      const v = rep.value.trim(); if (!v || posted) return; posted = true; AU.se('select');
      rep.disabled = true;
      thread.innerHTML += `<p style="background:#eef;padding:6px;border-radius:6px">名無しさん：${v.replace(/</g, '&lt;')}</p>`;
      scr.scrollTop = 99999;
      await wait(1800);
      glitch(900); AU.se('glitch');
      scr.querySelector('#wt').innerHTML = '月見かぐや<span class="glitchy">（ログイン中）</span>';
      const lines = ['……いろは？', 'こんなとこに返事するの、いろはしかいないでしょ', '2年もかかったけど、ママとの話し合いは終わったよ', 'いまから、そっちに帰る方法をハッキングする', 'だからさ', 'パン屋の物件、探しといて'];
      for (const l of lines) { await wait(1500); AU.se('blip', { f: 900 }); thread.innerHTML += `<p class="glitchy">月見かぐや（会話）：${l}</p>`; scr.scrollTop = 99999; }
      await wait(2500);
      m.close(); res(v);
    };
    scr.querySelector('#post').onclick = post;
    rep.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) post(); };
  };
  screenSearch();
});
