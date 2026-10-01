// ===== Audio: 自作シンセBGM / 効果音 =====
const AU = (() => {
  let ctx = null, master, bgmBus, seBus, delay, noiseBuf;
  let muted = false;
  let cur = null;
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    bgmBus = ctx.createGain(); bgmBus.gain.value = 0.42; bgmBus.connect(master);
    seBus = ctx.createGain(); seBus.gain.value = 0.75; seBus.connect(master);
    delay = ctx.createDelay(1.5); delay.delayTime.value = 0.28;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const wet = ctx.createGain(); wet.gain.value = 0.3;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(bgmBus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  // ---------- 基本音源 ----------
  function tone(f, t, dur, o = {}) {
    const osc = ctx.createOscillator();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    if (o.detune) osc.detune.value = o.detune;
    const g = ctx.createGain();
    const v = o.vol ?? 0.2, a = o.attack ?? 0.005, r = o.release ?? 0.08;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.setValueAtTime(v, Math.max(t + a, t + dur - r));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    let node = osc;
    if (o.lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; fl.Q.value = o.q || 1; node.connect(fl); node = fl; }
    node.connect(g);
    let out = g;
    if (o.pan !== undefined && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p; }
    out.connect(o.dest || seBus);
    if (o.send) out.connect(delay);
    if (o.vib) { const l = ctx.createOscillator(); l.frequency.value = o.vib; const lg = ctx.createGain(); lg.gain.value = f * 0.012; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(t, dur, o = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const g = ctx.createGain(); const v = o.vol ?? 0.3;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = s;
    if (o.hp) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = o.hp; node.connect(f); node = f; }
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; node.connect(f); node = f; }
    if (o.bp) { const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.bp; f.Q.value = o.q || 1; node.connect(f); node = f; }
    node.connect(g);
    let out = g;
    if (o.pan !== undefined && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p; }
    out.connect(o.dest || seBus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  function kick(t, dest, v = 0.9) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.13);
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.32);
  }
  function snare(t, dest, v = 0.35) { noise(t, 0.16, { vol: v, bp: 1900, q: 0.7, dest }); tone(190, t, 0.06, { type: 'triangle', vol: v * 0.6, dest }); }
  function hat(t, dest, v = 0.12, open) { noise(t, open ? 0.12 : 0.035, { vol: v, hp: 7500, dest }); }

  // ---------- トラック定義 ----------
  const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], harm: [0, 2, 3, 5, 7, 8, 11] };
  const TRACKS = {
    title:   { bpm: 92,  root: 50, scale: 'minor', prog: [0, 5, 2, 6], drums: 'soft', bass: 'half', arp: 'up16', pad: 1, lead: 'sparse', wave: 'triangle', seed: 7 },
    chase:   { bpm: 168, root: 45, scale: 'harm', prog: [0, 0, 5, 4], drums: 'tense', bass: 'drive', arp: 'up16', pad: 0, lead: 'busy', wave: 'square', seed: 11 },
    kaguya:  { bpm: 140, root: 52, scale: 'major', prog: [3, 4, 2, 5], drums: 'pop', bass: 'eighth', arp: 'updown8', pad: 1, lead: 'busy', wave: 'square', seed: 39 },
    cyber:   { bpm: 120, root: 47, scale: 'dorian', prog: [0, 3, 6, 4], drums: 'pop', bass: 'eighth', arp: 'up16', pad: 1, lead: 'mid', wave: 'sawtooth', seed: 5 },
    daily:   { bpm: 108, root: 53, scale: 'major', prog: [0, 3, 4, 0], drums: 'soft', bass: 'walk', arp: 'updown8', pad: 1, lead: 'mid', wave: 'triangle', seed: 21 },
    yachiyo: { bpm: 72,  root: 49, scale: 'major', prog: [0, 5, 3, 4], drums: 'none', bass: 'half', arp: 'bell', pad: 1, lead: 'sparse', wave: 'sine', seed: 88 },
    cafe:    { bpm: 116, root: 55, scale: 'major', prog: [0, 5, 1, 4], drums: 'soft', bass: 'walk', arp: 'updown8', pad: 0, lead: 'mid', wave: 'triangle', seed: 31 },
    sinister:{ bpm: 80,  root: 45, scale: 'harm', prog: [0, 5, 0, 4], drums: 'none', bass: 'half', arp: 'bell', pad: 1, lead: 'sparse', wave: 'sine', seed: 13 },
    prison:  { bpm: 96,  root: 43, scale: 'minor', prog: [0, 0, 5, 6], drums: 'soft', bass: 'half', arp: 'up16', pad: 1, lead: 'none', wave: 'triangle', seed: 4 },
    stealth: { bpm: 112, root: 45, scale: 'minor', prog: [0, 6, 5, 4], drums: 'tense', bass: 'eighth', arp: null, pad: 1, lead: 'sparse', wave: 'triangle', seed: 17 },
    night:   { bpm: 76,  root: 52, scale: 'major', prog: [0, 4, 5, 3], drums: 'none', bass: 'half', arp: 'updown8', pad: 1, lead: 'sparse', wave: 'triangle', seed: 62 },
    battle:  { bpm: 176, root: 47, scale: 'harm', prog: [0, 5, 3, 4], drums: 'battle', bass: 'drive', arp: 'up16', pad: 1, lead: 'busy', wave: 'sawtooth', seed: 99 },
    hack:    { bpm: 150, root: 50, scale: 'dorian', prog: [0, 6, 3, 4], drums: 'four', bass: 'drive', arp: 'up16', pad: 0, lead: 'mid', wave: 'square', seed: 202 },
    sad:     { bpm: 66,  root: 48, scale: 'major', prog: [5, 3, 0, 4], drums: 'none', bass: 'half', arp: 'updown8', pad: 1, lead: 'sparse', wave: 'triangle', seed: 45 },
    ending:  { bpm: 84,  root: 50, scale: 'major', prog: [0, 4, 5, 3], drums: 'soft', bass: 'half', arp: 'updown8', pad: 1, lead: 'mid', wave: 'triangle', seed: 777 },
    // リズムゲーム用（ループしない）
    live: {
      bpm: 150, root: 52, scale: 'minor', prog: [0, 5, 2, 6], wave: 'square', seed: 301, loop: false,
      sections: [
        { bars: 4, drums: 'four', bass: 'eighth', arp: null, pad: 0, lead: 'none', chart: 'kick' },
        { bars: 16, drums: 'four', bass: 'eighth', arp: 'up16', pad: 1, lead: 'busy', seed: 301, chart: 'lead', label: '1曲目' },
        { bars: 2, drums: 'none', bass: 'half', arp: null, pad: 1, lead: 'none', chart: 'none' },
        { bars: 16, drums: 'battle', bass: 'drive', arp: 'up16', pad: 1, lead: 'busy', seed: 515, tr: 3, prog: [0, 3, 4, 5], chart: 'lead', label: '2曲目　イントロが流れ始める' },
        { bars: 2, drums: 'four', bass: 'half', arp: null, pad: 1, lead: 'none', chart: 'kick' },
      ]
    },
  };

  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const RHY = {
    busy: ['10101010', '11101010', '10011010', '10101110', '11011010', '10111010', '10100110', '11101011'],
    mid: ['10101010', '10001010', '10100010', '10101000', '11001000'],
    sparse: ['10000000', '10001000', '10000010', '10100000'],
  };
  const melCache = {};
  function melody(cfg) {
    const key = [cfg.seed, cfg.lead, cfg.scale, cfg.prog.join()].join('|');
    if (melCache[key]) return melCache[key];
    const r = rng(cfg.seed * 7919 + 1);
    const sc = SCALES[cfg.scale];
    const pats = RHY[cfg.lead] || RHY.mid;
    const bars = [];
    let idx = 9 + Math.floor(r() * 3);
    const pA = pats[Math.floor(r() * pats.length)], pB = pats[Math.floor(r() * pats.length)];
    for (let b = 0; b < 4; b++) {
      const pat = (b % 2 === 0) ? pA : pB;
      const chord = cfg.prog[b % cfg.prog.length];
      const notes = [];
      for (let i = 0; i < 8; i++) {
        if (pat[i] !== '1') continue;
        idx += Math.round((r() - 0.5) * 4);
        idx = Math.max(6, Math.min(16, idx));
        if (i % 4 === 0) { // 強拍はコードトーン
          const tones = [chord, chord + 2, chord + 4, chord + 7, chord + 9, chord + 11];
          let best = tones[0];
          for (const t of tones) if (Math.abs(t - idx) < Math.abs(best - idx)) best = t;
          idx = best;
        }
        notes.push({ pos: i, idx });
      }
      bars.push(notes);
    }
    // AA'構成：後半4小節は前半のコピー＋最後だけ主音で終わる
    const out = bars.concat([bars[0], bars[1], bars[2], [{ pos: 0, idx: 7 + cfg.prog[3 % cfg.prog.length] }, { pos: 2, idx: 7 + (cfg.prog[3 % cfg.prog.length] + 2) }, { pos: 4, idx: 7 }]]);
    for (const bar of out) for (let i = 0; i < bar.length; i++) bar[i].len = ((i + 1 < bar.length ? bar[i + 1].pos : 8) - bar[i].pos);
    melCache[key] = out;
    return out;
  }
  function deg(cfg, idx) { const sc = SCALES[cfg.scale]; const o = Math.floor(idx / sc.length); const m = ((idx % sc.length) + sc.length) % sc.length; return cfg.root + (cfg.tr || 0) + 12 * o + sc[m]; }

  function buildBars(tr) {
    const bars = [];
    if (tr.sections) {
      for (const s of tr.sections) { const cfg = Object.assign({}, tr, s); for (let i = 0; i < s.bars; i++) bars.push(Object.assign({ local: i }, cfg)); }
    } else for (let i = 0; i < 8; i++) bars.push(Object.assign({ local: i }, tr));
    return bars;
  }

  function schedStep(bar, s, t, sd, dest) {
    const chordDeg = bar.prog[bar.local % bar.prog.length];
    const chord = [chordDeg, chordDeg + 2, chordDeg + 4].map(i => deg(bar, i));
    // drums
    const d = bar.drums;
    if (d === 'soft') { if (s === 0 || s === 8) kick(t, dest, 0.5); if (s === 4 || s === 12) hat(t, dest, 0.06, true); }
    else if (d === 'pop') { if (s === 0 || s === 6 || s === 8) kick(t, dest, 0.7); if (s === 4 || s === 12) snare(t, dest, 0.25); if (s % 2 === 0) hat(t, dest, 0.07); }
    else if (d === 'four') { if (s % 4 === 0) kick(t, dest, 0.8); if (s === 4 || s === 12) snare(t, dest, 0.28); if (s % 4 === 2) hat(t, dest, 0.1, true); }
    else if (d === 'tense') { if ([0, 3, 6, 8, 11, 14].includes(s)) kick(t, dest, 0.6); if (s === 12) snare(t, dest, 0.25); hat(t, dest, s % 2 ? 0.03 : 0.07); }
    else if (d === 'battle') { if ([0, 3, 8, 10].includes(s)) kick(t, dest, 0.8); if (s === 4 || s === 12) snare(t, dest, 0.32); hat(t, dest, s % 4 === 2 ? 0.1 : 0.04); }
    // bass
    const root = chord[0] - 24;
    const bv = 0.22;
    if (bar.bass === 'half' && (s === 0 || s === 8)) tone(midi(root), t, sd * 7.5, { type: 'triangle', vol: bv, dest, release: 0.2 });
    if (bar.bass === 'eighth' && s % 2 === 0) tone(midi(root + (s % 4 === 2 ? 12 : 0)), t, sd * 1.6, { type: 'sawtooth', vol: bv * 0.6, lp: 700, dest });
    if (bar.bass === 'drive') tone(midi(root), t, sd * 0.8, { type: 'sawtooth', vol: bv * 0.55, lp: 600, dest });
    if (bar.bass === 'walk' && s % 4 === 0) tone(midi([root, root + 4, root + 7, root + 5][s / 4]), t, sd * 3.5, { type: 'triangle', vol: bv, dest });
    // pad
    if (bar.pad && s === 0) for (const n of chord) { tone(midi(n), t, sd * 16, { type: 'sawtooth', vol: 0.035, lp: 1100, attack: 0.3, release: 0.5, dest, detune: 7 }); tone(midi(n), t, sd * 16, { type: 'sawtooth', vol: 0.03, lp: 1100, attack: 0.3, release: 0.5, dest, detune: -7 }); }
    // arp
    if (bar.arp === 'up16') { const n = chord[s % 3] + 12 * (1 + Math.floor((s % 6) / 3)); tone(midi(n), t, sd * 0.7, { type: 'square', vol: 0.035, lp: 2500, dest }); }
    if (bar.arp === 'updown8' && s % 2 === 0) { const seq = [0, 1, 2, 1]; const n = chord[seq[(s / 2) % 4]] + 12; tone(midi(n), t, sd * 1.8, { type: 'triangle', vol: 0.06, dest }); }
    if (bar.arp === 'bell' && s % 4 === 0) { const n = chord[(s / 4) % 3] + 24; tone(midi(n), t, sd * 6, { type: 'sine', vol: 0.06, release: 0.6, dest, send: 1 }); tone(midi(n) * 2.01, t, sd * 2, { type: 'sine', vol: 0.015, dest }); }
    // lead
    if (bar.lead && bar.lead !== 'none' && s % 2 === 0) {
      const mel = melody(bar)[bar.local % 8];
      const n = mel.find(x => x.pos === s / 2);
      if (n) tone(midi(deg(bar, n.idx) + 12), t, sd * 2 * n.len * 0.9, { type: bar.wave, vol: bar.wave === 'sawtooth' ? 0.07 : bar.wave === 'square' ? 0.07 : 0.12, lp: bar.wave === 'sawtooth' ? 3000 : undefined, dest, send: 1, vib: n.len > 2 ? 5.5 : 0 });
    }
  }

  function startSynth(name, offset = 0.12) {
    const tr = TRACKS[name] || TRACKS.title;
    const bars = buildBars(tr);
    const sd = 60 / tr.bpm / 4;
    const tg = ctx.createGain(); tg.gain.value = 1; tg.connect(bgmBus);
    const t0 = ctx.currentTime + offset;
    let step = 0; let stopped = false;
    const total = bars.length * 16;
    const timer = setInterval(() => {
      if (stopped) return;
      while (t0 + step * sd < ctx.currentTime + 0.25) {
        if (tr.loop === false && step >= total) { clearInterval(timer); break; }
        const st = step % total;
        schedStep(bars[Math.floor(st / 16)], st % 16, t0 + step * sd, sd, tg);
        step++;
      }
    }, 25);
    return {
      t0, sd, bars,
      stop(fade = 0.6) { stopped = true; clearInterval(timer); const n = ctx.currentTime; tg.gain.cancelScheduledValues(n); tg.gain.setValueAtTime(tg.gain.value, n); tg.gain.linearRampToValueAtTime(0, n + fade); setTimeout(() => tg.disconnect(), fade * 1000 + 300); }
    };
  }

  // リズムゲーム用譜面
  function chart(name) {
    const tr = TRACKS[name]; const bars = buildBars(tr); const sd = 60 / tr.bpm / 4;
    const notes = []; const labels = [];
    bars.forEach((bar, bi) => {
      const base = bi * 16 * sd;
      if (bar.local === 0 && bar.label) labels.push({ time: base, text: bar.label });
      if (bar.chart === 'kick') for (let s = 0; s < 16; s += 4) notes.push({ time: base + s * sd, lane: (bi + s / 4) % 2 ? 1 : 2 });
      if (bar.chart === 'lead') {
        const mel = melody(bar)[bar.local % 8];
        for (const n of mel) notes.push({ time: base + n.pos * 2 * sd, lane: ((n.idx % 4) + 4) % 4, long: n.len >= 4 ? n.len * 2 * sd * 0.8 : 0 });
        if (bar.local % 4 === 3) notes.push({ time: base + 14 * sd, lane: 0 }, { time: base + 14 * sd, lane: 3 });
      }
    });
    return { notes, labels, length: bars.length * 16 * sd };
  }

  // ---------- BGM 再生 ----------
  function playBGM(name) {
    init();
    if (cur && cur.name === name) return;
    stopBGM();
    const s = startSynth(name);
    cur = { name, stop: (f) => s.stop(f) };
  }
  function stopBGM(fade) { if (cur) { cur.stop(fade); cur = null; } }

  // ---------- 効果音 ----------
  function se(name, o = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    switch (name) {
      case 'blip': tone(o.f || 1200, t, 0.025, { type: 'square', vol: 0.025 }); break;
      case 'click': tone(880, t, 0.05, { type: 'square', vol: 0.06 }); tone(1320, t + 0.05, 0.06, { type: 'square', vol: 0.05 }); break;
      case 'select': tone(660, t, 0.05, { type: 'triangle', vol: 0.15 }); tone(990, t + 0.06, 0.1, { type: 'triangle', vol: 0.15 }); break;
      case 'gun': noise(t, 0.18, { vol: 0.5, lp: 3000 }); tone(120, t, 0.12, { type: 'square', vol: 0.25, slide: 40 }); break;
      case 'mgun': noise(t, 0.07, { vol: 0.32, lp: 4000 }); tone(160, t, 0.05, { type: 'square', vol: 0.12, slide: 60 }); break;
      case 'shot': tone(1400, t, 0.08, { type: 'square', vol: 0.06, slide: 500 }); break;
      case 'hit': noise(t, 0.1, { vol: 0.35, bp: 900 }); tone(300, t, 0.08, { type: 'square', vol: 0.12, slide: 80 }); break;
      case 'explode': noise(t, 0.9, { vol: 0.7, lp: 900 }); tone(80, t, 0.6, { type: 'sine', vol: 0.5, slide: 30 }); break;
      case 'warp': tone(200, t, 0.5, { type: 'sine', vol: 0.25, slide: 2400, vib: 18 }); tone(400, t + 0.1, 0.45, { type: 'triangle', vol: 0.1, slide: 3200 }); break;
      case 'glitch': for (let i = 0; i < 8; i++) tone(100 + Math.random() * 2000, t + i * 0.03, 0.025, { type: 'square', vol: 0.08 }); noise(t, 0.25, { vol: 0.15, hp: 3000 }); break;
      case 'beep': tone(760, t, o.dur || 0.1, { type: 'sine', vol: 0.25, attack: 0.004, release: 0.01 }); break;
      case 'step': noise(t, 0.07, { vol: o.vol ?? 0.5, lp: o.lp || 500, pan: o.pan || 0 }); tone(o.f || 70, t, 0.06, { type: 'sine', vol: (o.vol ?? 0.5) * 0.6, pan: o.pan || 0 }); break;
      case 'ok': [0, 4, 7, 12].forEach((n, i) => tone(midi(72 + n), t + i * 0.07, 0.15, { type: 'square', vol: 0.07 })); break;
      case 'clear': [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => tone(midi(67 + n), t + i * 0.08, 0.3, { type: 'square', vol: 0.07, send: 1 })); break;
      case 'fail': [7, 3, 0, -5].forEach((n, i) => tone(midi(60 + n), t + i * 0.12, 0.2, { type: 'sawtooth', vol: 0.08, lp: 1500 })); break;
      case 'chime': [0, 7, 12, 16, 19, 24].forEach((n, i) => { tone(midi(76 + n), t + i * 0.12, 1.6, { type: 'sine', vol: 0.1, release: 1.2, send: 1 }); }); break;
      case 'heart': tone(midi(84), t, 0.08, { type: 'sine', vol: 0.15 }); tone(midi(88), t + 0.08, 0.15, { type: 'sine', vol: 0.15 }); break;
      case 'smoke': noise(t, 1.2, { vol: 0.35, hp: 1200 }); break;
      case 'door': noise(t, 0.4, { vol: 0.8, lp: 400 }); tone(60, t, 0.3, { type: 'square', vol: 0.3, slide: 30 }); break;
      case 'type': noise(t, 0.02, { vol: 0.12, hp: 2000 }); break;
      case 'error': tone(220, t, 0.12, { type: 'square', vol: 0.1 }); tone(180, t + 0.13, 0.18, { type: 'square', vol: 0.1 }); break;
      case 'cheer': for (let i = 0; i < 14; i++) noise(t + Math.random() * 0.4, 0.6 + Math.random() * 0.4, { vol: 0.08, bp: 600 + Math.random() * 1600, q: 3 }); break;
      case 'tap': tone(o.f || 1046, t, 0.05, { type: 'triangle', vol: 0.12 }); break;
      case 'trip': tone(500, t, 0.3, { type: 'square', vol: 0.08, slide: 120 }); noise(t + 0.3, 0.3, { vol: 0.5, lp: 600 }); break;
      case 'phone': for (let i = 0; i < 4; i++) { tone(1300, t + i * 0.12, 0.05, { type: 'square', vol: 0.06 }); tone(1600, t + i * 0.12 + 0.06, 0.05, { type: 'square', vol: 0.06 }); } break;
      case 'buzzer': for (let i = 0; i < 3; i++) tone(440, t + i * 0.25, 0.18, { type: 'sawtooth', vol: 0.12, lp: 2000 }); break;
    }
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.6;
    return muted;
  }

  return { init, playBGM, stopBGM, se, startSynth, chart, toggleMute, get ctx() { return ctx; }, get muted() { return muted; } };
})();
