/* Civic Dash — one-thumb arcade. No dependencies; learning content stays in app.js. */
(() => {
  'use strict';
  const KEY = 'atest-arcade-v1';
  const reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  // Canvas compatibility for older mobile Safari/WebViews. Civic Dash should degrade gracefully, not vanish.
  function roundedRect(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') { ctx.roundRect(x, y, w, h, r); return; }
    const radius = Math.max(0, Math.min(Number(r) || 0, Math.abs(w) / 2, Math.abs(h) / 2));
    ctx.moveTo(x + radius, y); ctx.lineTo(x + w - radius, y); ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius); ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  const worlds = [
    { part: 'people', name: 'Sunrise Coast', topic: 'Australia & its people', icon: '☀', sky: '#ffe7cb', hill: '#ffa985' },
    { part: 'rights', name: 'Together Town', topic: 'Rights & liberties', icon: '♡', sky: '#f6e0ef', hill: '#e99cc4' },
    { part: 'government', name: 'Parliament Peaks', topic: 'Government & the law', icon: '⌂', sky: '#e9e5ff', hill: '#b0a0ed' },
    { part: 'values', name: 'Values Valley', topic: 'Australian Values', icon: '✦', sky: '#dff0ff', hill: '#98c6ef' }
  ];
  // Arcade rewards recognise play, never substitute for citizenship knowledge.
  const badgeCatalog = [
    { id: 'first-flight', icon: '🚀', title: 'First Flight', why: 'Finish your first run' },
    { id: 'combo-five', icon: '⚡', title: 'Combo Pilot', why: 'Collect five stars in a row' },
    { id: 'civic-boost', icon: '💎', title: 'Boost Explorer', why: 'Collect a Civic Boost' },
    { id: 'perfect-run', icon: '🌟', title: 'Bright Thinker', why: 'Answer every checkpoint correctly in a completed run' },
    { id: 'four-worlds', icon: '🗺️', title: 'World Wanderer', why: 'Explore all four worlds' }
  ];
  const badgeIds = new Set(badgeCatalog.map(b => b.id));
  const safeRead = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };
  const raw = safeRead();
  const num = n => Number.isFinite(Number(n)) ? Math.max(0, Math.floor(Number(n))) : 0;
  const data = {
    best: num(raw.best), stars: num(raw.stars), runs: num(raw.runs),
    cleared: Array.isArray(raw.cleared) ? [...new Set(raw.cleared.filter(x => Number.isInteger(x) && x >= 0 && x < 4))] : [],
    medals: Array.isArray(raw.medals) ? raw.medals.slice(0, 4).map(x => Math.min(3, num(x))) : [],
    credited: Array.isArray(raw.credited) ? raw.credited.filter(x => typeof x === 'string').slice(-1000) : [],
    daily: raw.daily && typeof raw.daily === 'object' ? raw.daily : {},
    sound: raw.sound === true, haptics: raw.haptics === true,
    effects: raw.effects !== false,
    badges: Array.isArray(raw.badges) ? [...new Set(raw.badges.filter(id => badgeIds.has(id)))] : []
  };
  const effectsEnabled = () => data.effects && !reduced.matches;
  let mode = reduced.matches ? 'chill' : 'adventure';
  let active = null, lobbyEvents = null, audio = null, storageWarning = false;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = Math.imul(a ^ a >>> 15, 1 | a); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let n = 2166136261; for (const c of s) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
  function shuffled(items, random) { const copy = items.slice(); for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
  function announce(text) { const el = document.getElementById('app-status'); if (el) el.textContent = text; }
  function warnStorage() { if (storageWarning) return; storageWarning = true; announce('Device storage is unavailable. You can keep playing, but this visit may not be saved.'); }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { warnStorage(); } }
  // A blocked/full localStorage must not break answer feedback in the study app.
  const originalSave = save;
  save = function () { try { originalSave(); } catch { warnStorage(); } };
  function unlockBadge(id) {
    if (!badgeIds.has(id) || data.badges.includes(id)) return false;
    data.badges.push(id);
    persist();
    return true;
  }
  function sound(kind) {
    if (data.haptics && navigator.vibrate) {
      try { navigator.vibrate(kind === 'hit' ? [22, 24, 22] : kind === 'boost' ? [12, 25, 16] : 10); } catch {}
    }
    if (!data.sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audio) audio = new AC();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      // Original, quietly synthesised arcade cues. Audio is opt-in; no music.
      const notes = {
        hit: [[165, 90, .16]], star: [[620, 950, .09]],
        combo: [[550, 790, .1], [820, 1050, .12]],
        boost: [[410, 710, .1], [760, 1190, .14]],
        answer: [[660, 840, .12], [830, 1240, .13]],
        victory: [[520, 660, .11], [660, 830, .11], [830, 1040, .18]]
      }[kind] || [[620, 900, .1]];
      let offset = 0;
      notes.forEach(([from, to, duration]) => {
        const now = audio.currentTime + offset;
        const osc = audio.createOscillator(), gain = audio.createGain();
        osc.type = kind === 'hit' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(from, now);
        osc.frequency.exponentialRampToValueAtTime(to, now + duration);
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.linearRampToValueAtTime(.036, now + .018);
        gain.gain.exponentialRampToValueAtTime(.001, now + duration);
        osc.connect(gain); gain.connect(audio.destination);
        osc.start(now); osc.stop(now + duration + .012);
        offset += duration * .8;
      });
    } catch { /* Optional effects must never block the game. */ }
  }
  function focusHeading(root = app) { const h = root.querySelector('[data-focus], h1, h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  function stop() {
    if (active) { active.dispose(); active = null; }
    if (lobbyEvents) { lobbyEvents.abort(); lobbyEvents = null; }
    document.body.classList.remove('dash-active');
  }
  function lobby() {
    stop();
    const next = worlds.findIndex((_, i) => !data.cleared.includes(i));
    const target = next < 0 ? 0 : next;
    const dailyBest = data.daily.date === dayKey() ? num(data.daily.best) : 0;
    app.innerHTML = `<section class="dash-lobby" aria-labelledby="dash-title">
      <div class="dash-hero">
        <div class="dash-intro"><span class="dash-kicker">THE LITTLE ARCADE · CIVIC DASH</span>
          <h1 id="dash-title">Big adventure.<br><em>One little thumb.</em></h1>
          <p>Meet Sunny. Surf the skyway, scoop up stars and discover the ideas that make Australia, Australia.</p>
          <button class="dash-button dash-primary" data-dash-start="${target}">Let's play <span aria-hidden="true">→</span></button>
          <span class="dash-micro">${mode === 'chill' ? 'No timer. No hazards. Your pace.' : mode === 'daily' ? 'A fresh four-topic challenge. Same course all day.' : 'Slide to steer. Three shields. Three learning stops.'}</span>
        </div>
        <div class="dash-preview" aria-hidden="true"><span class="dash-cloud cloud-one"></span><span class="dash-cloud cloud-two"></span>
          <span class="dash-orbit">✦</span><span class="dash-orbit orbit-two">✧</span><span class="dash-orbit orbit-three">✦</span>
          <div class="dash-road"><i></i><i></i></div><div class="dash-sunny"><span class="sunny-eyes">••</span><span class="sunny-smile"></span></div>
          <span class="dash-preview-label">A little play. A lot of progress.</span>
        </div>
      </div>
      <div class="dash-records" aria-label="Arcade records saved on this device">
        <div><strong>${data.best.toLocaleString()}</strong><span>Best adventure</span></div><div><strong>${data.stars.toLocaleString()}</strong><span>Stars collected</span></div><div><strong>${data.cleared.length}<small> / 4</small></strong><span>Worlds explored</span></div>
      </div>
      <section class="dash-badge-section" aria-label="Civic Dash achievements">
        <div class="dash-badges-heading"><strong>YOUR ARCADE BADGES</strong><span>${data.badges.length} / ${badgeCatalog.length} unlocked</span></div>
        <div class="dash-badges">${badgeCatalog.map(b => `<div class="dash-badge ${data.badges.includes(b.id) ? 'unlocked' : 'locked'}" aria-label="${esc(b.title)}. ${esc(b.why)}. ${data.badges.includes(b.id) ? 'Earned' : 'Not yet earned'}"><span class="dash-badge-symbol" aria-hidden="true">${data.badges.includes(b.id) ? b.icon : '◇'}</span><strong>${esc(b.title)}</strong><small>${esc(b.why)}</small></div>`).join('')}</div>
      </section>
      <div class="dash-section-title"><div><span class="dash-kicker">MAKE IT YOURS</span><h2>Choose your kind of happy.</h2></div><span class="dash-local">Saved on this device</span></div>
      <div class="dash-modes" role="group" aria-label="Game mode">
        ${[['adventure', '↗', 'Adventure', 'Dodge, collect, discover.'], ['chill', '☁', 'Chill ride', 'No hazards or timer.'], ['daily', '✧', 'Daily dash', dailyBest ? `Today's best: ${dailyBest}` : 'Four topics. One fresh course.']].map(([id, icon, title, detail]) => `<button class="dash-mode ${mode === id ? 'selected' : ''}" data-dash-mode="${id}" aria-pressed="${mode === id}"><span aria-hidden="true">${icon}</span><b>${title}</b><small>${detail}</small></button>`).join('')}
      </div>
      <div class="dash-section-title"><div><span class="dash-kicker">YOUR JOURNEY</span><h2>Four worlds. Bigger horizons.</h2></div></div>
      <div class="dash-worlds">${worlds.map((w, i) => {
        const locked = mode !== 'chill' && i > target && next >= 0 && !data.cleared.includes(i);
        return `<button class="dash-world world-${i} ${data.cleared.includes(i) ? 'cleared' : ''}" data-dash-start="${i}" ${locked || mode === 'daily' ? 'disabled' : ''} aria-label="${esc(w.name)}. ${esc(w.topic)}. ${locked ? 'Finish the previous world to unlock.' : 'Play.'}"><span class="dash-world-icon" aria-hidden="true">${w.icon}</span><small>WORLD 0${i + 1}</small><h3>${w.name}</h3><p>${w.topic}</p><b>${mode === 'daily' ? 'Included in daily dash' : locked ? '○ Up next' : data.cleared.includes(i) ? `✓ Explored · ${'★'.repeat(data.medals[i] || 1)}` : 'Explore →'}</b></button>`;
      }).join('')}</div>
      <details class="dash-help"><summary>How to play & comfort settings</summary><div class="dash-help-body"><p><b>Adventure:</b> slide anywhere on the skyway or tap the three lane buttons. Collect gold stars, grab turquoise Civic Boosts for bonus points and a shield, and dodge coral bumpers. Every ten seconds, the action stops for a citizenship question. A correct answer restores a shield. There is no timer on questions.</p><p><b>Chill ride:</b> tap the lane with a star. Four stars open a learning checkpoint. No moving obstacles, lost shields or time limit. Keyboard: arrow keys or A / D to steer; Space or Escape to pause.</p><div class="dash-settings"><button data-dash-setting="sound" aria-pressed="${data.sound}">Sound ${data.sound ? 'on' : 'off'}</button><button data-dash-setting="effects" aria-pressed="${data.effects}">Effects ${data.effects ? 'on' : 'off'}</button><button data-dash-setting="haptics" aria-pressed="${data.haptics}" ${navigator.vibrate ? '' : 'disabled'}>Vibration ${navigator.vibrate ? data.haptics ? 'on' : 'off' : 'unavailable'}</button></div><p class="dash-fine">Visual effects respect your device’s reduced-motion setting. Sound and vibration are off unless you enable them. Game points and badges are not exam readiness. First-time checkpoint answers contribute practice evidence; repeating the same game question does not add extra evidence. Scores stay on this device. Daily dash resets on your device's local date.</p></div></details>
      <div class="dash-links"><span>Prefer a quiet brain workout?</span><button data-view="game">Keyword game →</button><button data-view="map">Capital challenge →</button></div>
    </section>`;
    lobbyEvents = new AbortController();
    app.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn || btn.disabled) return;
      if (btn.hasAttribute('data-dash-mode')) { mode = btn.dataset.dashMode; lobby(); app.querySelector(`[data-dash-mode="${mode}"]`).focus({ preventScroll: true }); }
      else if (btn.hasAttribute('data-dash-start')) launch(Number(btn.dataset.dashStart));
      else if (btn.hasAttribute('data-dash-setting')) {
        const key = btn.dataset.dashSetting; data[key] = !data[key]; persist();
        btn.setAttribute('aria-pressed', String(data[key])); btn.textContent = `${key === 'sound' ? 'Sound' : key === 'effects' ? 'Effects' : 'Vibration'} ${data[key] ? 'on' : 'off'}`;
        if (data[key] && key !== 'effects') sound('star');
      }
    }, { signal: lobbyEvents.signal });
  }
  function chooseQuestions(world, kind, seed) {
    const random = rng(seed), unique = [...new Map(questions.map(q => [q[1], q])).values()];
    const pool = kind === 'daily' ? worlds.map(w => shuffled(unique.filter(q => q[0] === w.part), random)[0]) : shuffled(unique.filter(q => q[0] === worlds[world].part), random).slice(0, 3);
    return pool.filter(Boolean).map(q => ({ q, options: shuffled(q[2].map((text, original) => ({ text, original })), random) }));
  }
  function creditAnswer(q, ok) {
    if (data.credited.includes(q[1])) return;
    data.credited.push(q[1]); persist();
    const st = state.stats[q[0]] || { c: 0, t: 0 }; st.t++; if (ok) st.c++; state.stats[q[0]] = st;
    state.missed[q[1]] = ok ? 0 : (state.missed[q[1]] || 0) + 1;
    const id = questionDomainMap[q[1]];
    if (id) {
      const ev = state.domainEvidence[id] || { c: 0, t: 0 }; ev.t++; if (ok) ev.c++; state.domainEvidence[id] = ev;
      state.domains[id] = Math.max(state.domains[id] || 0, ev.t >= 3 && ev.c >= 2 && ev.c / ev.t >= .75 ? 3 : 1);
    }
    save();
  }
  function launch(world = 0) {
    stop();
    const seed = mode === 'daily' ? hash(`civic-dash-v1-${dayKey()}`) : Math.floor(Math.random() * 0xffffffff);
    active = new DashRun(mode === 'daily' ? 0 : Math.max(0, Math.min(3, world)), mode, seed);
    active.mount();
  }
  class DashRun {
    constructor(world, kind, seed) {
      Object.assign(this, { world, kind, phase: 'ready', score: 0, stars: 0, shields: 3, streak: 0, maxStreak: 0, lane: 1, x: .5, elapsed: 0, spawnIn: .35, frame: 0, last: 0, checkpoint: 0, correct: 0, picks: 0, target: 1, invulnerable: 0, saved: false, width: 480, height: 520 });
      this.random = rng(seed ^ 0x5F3759DF); this.fxRandom = rng(seed ^ 0xA17C09BA);
      this.deck = chooseQuestions(world, kind, seed); this.objects = []; this.particles = [];
      this.trail = []; this.answers = []; this.events = new AbortController();
      this.spawnCount = 0; this.boosts = 0; this.flash = 0; this.shake = 0; this.newBadges = [];
    }
    mount() {
      document.body.classList.add('dash-active');
      app.innerHTML = `<section class="dash-game" aria-label="Civic Dash game"><header class="dash-toolbar"><button data-dash-action="exit" aria-label="Leave game">← <span>Arcade</span></button><b>CIVIC DASH <small>${this.kind === 'daily' ? 'DAILY' : this.kind === 'chill' ? 'CHILL' : 'ADVENTURE'}</small></b><button data-dash-action="pause" aria-label="Pause game">Ⅱ</button></header>
        <div class="dash-hud"><div><small>SCORE</small><strong id="dash-score">0</strong></div><div><small>STARS</small><strong id="dash-stars">✦ 0</strong></div><div><small>${this.kind === 'chill' ? 'PACE' : 'SHIELDS'}</small><strong id="dash-shields">${this.kind === 'chill' ? 'Yours' : '♥ ♥ ♥'}</strong></div><div><small>COMBO</small><strong id="dash-combo">×1</strong></div></div>
        <div class="dash-route"><span id="dash-world-name">${esc(worlds[this.world].name)}</span><span id="dash-progress">Checkpoint 0 / ${this.deck.length}</span></div><div class="dash-meter"><i id="dash-distance"></i></div>
        <div class="dash-playfield"><canvas id="dash-canvas" role="img" aria-label="Three-lane skyway. Collect gold stars and avoid coral bumpers using the lane buttons below."></canvas><div class="dash-float-message" id="dash-message" aria-hidden="true"></div>
          <div class="dash-boost-banner" id="dash-boost-banner" aria-hidden="true">💎 Civic Boost: +45 points and a shield</div>
          <div class="dash-thumb" aria-label="Steering controls"><div class="dash-steer-hint" id="dash-steer-hint">${this.kind === 'chill' ? 'TAP THE LANE WITH A STAR' : 'SLIDE TO STEER · OR TAP A LANE'}</div><div class="dash-lanes" role="group" aria-label="Choose a lane">${['Left', 'Centre', 'Right'].map((s, i) => `<button data-dash-lane="${i}" aria-pressed="${i === 1}"><span aria-hidden="true">${['←', '●', '→'][i]}</span><small>${s}</small></button>`).join('')}</div></div><div class="dash-overlay" id="dash-overlay"></div>
        </div></section>`;
      this.canvas = document.getElementById('dash-canvas'); this.ctx = this.canvas.getContext('2d'); this.overlay = document.getElementById('dash-overlay');
      if (!this.ctx) { this.overlay.innerHTML = '<div class="dash-dialog"><h2>This browser cannot draw the skyway.</h2><p>Your study tools still work.</p><button class="dash-button" data-view="practice">Go to practice</button></div>'; return; }
      const signal = this.events.signal;
      app.addEventListener('click', e => this.click(e), { signal });
      document.addEventListener('keydown', e => this.key(e), { signal });
      document.addEventListener('visibilitychange', () => { if (document.hidden) this.pause('Your ride is safe. Resume when you are ready.'); }, { signal });
      // visibilitychange is the reliable mobile lifecycle signal. Window blur fires for
      // harmless browser/UI focus changes on some phones and caused surprise pause loops.
      for (const surface of [this.canvas, app.querySelector('.dash-lanes')]) {
        let pointer = null;
        const move = e => { if (this.phase !== 'running') return; const box = surface.getBoundingClientRect(); this.steer(Math.min(2, Math.max(0, Math.floor((e.clientX - box.left) / box.width * 3)))); };
        surface.addEventListener('pointerdown', e => { if (this.phase !== 'running' || this.kind === 'chill') return; pointer = e.pointerId; surface.setPointerCapture(e.pointerId); move(e); }, { signal });
        surface.addEventListener('pointermove', e => { if (e.pointerId === pointer) move(e); }, { signal });
        for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) surface.addEventListener(event, () => { pointer = null; }, { signal });
      }
      if (typeof ResizeObserver === 'function') {
        this.resize = new ResizeObserver(() => this.fit()); this.resize.observe(this.canvas);
      } else {
        this.onResize = () => this.fit(); window.addEventListener('resize', this.onResize, { signal });
      }
      this.fit();
      this.show(`<span class="dash-dialog-icon" aria-hidden="true">✦</span><span class="dash-kicker">MEET YOUR LITTLE STAR</span><h2 data-focus>Ready, Sunny?</h2><p>${this.kind === 'chill' ? 'Tap the lane with a star. Collect four to open a learning checkpoint. Take all the time you need.' : 'Slide left and right to collect gold stars. Dodge coral bumpers. Three shields keep you flying. Turquoise Civic Boosts recharge them and give bonus points.'}</p><div class="dash-mini-legend"><span>✦ Collect</span><span>${this.kind === 'chill' ? '☁ No rush' : '▰ Dodge'}</span><span>💎 Boost</span><span>♡ Learn</span></div><p class="dash-fine">The game always stops for questions. No rushed reading.</p><button class="dash-button dash-primary" data-dash-action="begin">${this.kind === 'chill' ? 'Start my chill ride' : "Let's fly"} →</button>`);
    }
    fit() { const b = this.canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2); if (!b.width || !b.height) return; this.canvas.width = Math.round(b.width * dpr); this.canvas.height = Math.round(b.height * dpr); this.width = 480; this.height = b.height / b.width * 480; this.ctx.setTransform(this.canvas.width / this.width, 0, 0, this.canvas.height / this.height, 0, 0); this.draw(); }
    show(html) { this.overlay.hidden = false; this.overlay.innerHTML = `<section class="dash-dialog">${html}</section>`; this.canvas.setAttribute('aria-hidden', 'true'); app.querySelector('.dash-thumb').inert = true; app.querySelector('[data-dash-action="pause"]').disabled = this.phase !== 'paused'; focusHeading(this.overlay); }
    hide() { this.overlay.hidden = true; this.overlay.innerHTML = ''; this.canvas.removeAttribute('aria-hidden'); app.querySelector('.dash-thumb').inert = false; app.querySelector('[data-dash-action="pause"]').disabled = false; }
    click(e) {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.hasAttribute('data-dash-lane')) { if (this.phase === 'running') this.steer(Number(b.dataset.dashLane)); return; }
      if (b.hasAttribute('data-dash-choice')) { this.answer(Number(b.dataset.dashChoice)); return; }
      switch (b.dataset.dashAction) {
        case 'toggle-effects':
        case 'toggle-sound': {
          const setting = b.dataset.dashAction === 'toggle-effects' ? 'effects' : 'sound';
          data[setting] = !data[setting]; persist();
          b.setAttribute('aria-pressed', String(data[setting]));
          b.textContent = (setting === 'effects' ? 'Visual effects' : 'Sound') + (data[setting] ? ' on' : ' off');
          if (setting === 'sound' && data.sound) sound('star');
          break;
        }
        case 'begin': this.phase = 'running'; this.hide(); if (this.kind === 'chill') this.chillStar(); else this.startLoop(); this.focusControls(); break;
        case 'pause': if (this.phase === 'paused') this.resume(); else this.pause(); break;
        case 'resume': this.resume(); break;
        case 'exit': if (this.phase === 'ready' || this.phase === 'result') route('games'); else if (this.phase === 'running' || this.phase === 'paused') this.pause('Leaving ends this run. Your answered questions stay saved.'); else this.confirmExit(); break;
        case 'leave': route('games'); break;
        case 'return-checkpoint': this.show(this.savedOverlay); this.phase = this.savedPhase; break;
        case 'next': this.continue(); break;
        case 'retry': launch(this.world); break;
        case 'world': launch(Math.min(3, this.world + 1)); break;
      }
    }
    confirmExit() { if (this.phase === 'exit') return; this.savedPhase = this.phase; this.savedOverlay = this.overlay.querySelector('.dash-dialog').innerHTML; this.phase = 'exit'; this.show('<h2 data-focus>Back to the arcade?</h2><p>This ends the current run. Answered questions stay saved.</p><button class="dash-button dash-primary" data-dash-action="return-checkpoint">Keep playing</button><button class="dash-button dash-secondary" data-dash-action="leave">Leave this run</button>'); }
    key(e) {
      if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === 'Escape') { e.preventDefault(); this.phase === 'paused' ? this.resume() : this.pause(); return; }
      if (this.phase !== 'running') return;
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) { e.preventDefault(); if (e.repeat && this.kind === 'chill') return; this.steer(Math.max(0, Math.min(2, this.lane + (['ArrowLeft', 'a', 'A'].includes(e.key) ? -1 : 1)))); }
      if (e.code === 'Space' && e.target.tagName !== 'BUTTON') { e.preventDefault(); this.pause(); }
    }
    focusControls() { app.querySelector(`[data-dash-lane="${this.lane}"]`).focus({ preventScroll: true }); }
    steer(lane) {
      if (this.phase !== 'running') return;
      this.lane = lane; app.querySelectorAll('[data-dash-lane]').forEach((b, i) => b.setAttribute('aria-pressed', String(lane === i)));
      if (this.kind === 'chill') {
        this.x = [.2, .5, .8][lane];
        if (lane === this.target) { this.collect(.82); this.picks++; if (this.picks % 4 === 0) { this.openCheckpoint(); return; } this.chillStar(); }
        this.draw();
      }
    }
    chillStar() { this.target = Math.floor(this.random() * 3); this.draw(); const names = ['Left', 'Centre', 'Right']; app.querySelectorAll('[data-dash-lane]').forEach((b, i) => { b.querySelector('span').textContent = i === this.target ? '✦' : ['←', '●', '→'][i]; b.setAttribute('aria-label', `${names[i]} lane${i === this.target ? ', collect star' : ''}`); }); announce(`Star in the ${names[this.target].toLowerCase()} lane. ${4 - this.picks % 4} stars to the next checkpoint.`); }
    startLoop() { cancelAnimationFrame(this.frame); this.last = 0; this.frame = requestAnimationFrame(t => this.tick(t)); }
    tick(t) { if (this.phase !== 'running') return; const dt = this.last ? Math.min((t - this.last) / 1000, .04) : 0; this.last = t; this.update(dt); this.draw(); if (this.phase === 'running') this.frame = requestAnimationFrame(n => this.tick(n)); }
    update(dt) {
      this.elapsed += dt; this.invulnerable = Math.max(0, this.invulnerable - dt);
      this.flash = Math.max(0, this.flash - dt); this.shake = Math.max(0, this.shake - dt);
      for (const p of this.particles) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += dt * .34; p.life -= dt;
      }
      this.particles = this.particles.filter(p => p.life > 0);
      for (const p of this.trail) p.life -= dt;
      this.trail = this.trail.filter(p => p.life > 0);
      if (effectsEnabled() && dt > 0 && this.trail.length < 18) {
        this.trail.push({ x: this.x, life: .35 });
      }
      this.x += ([.2, .5, .8][this.lane] - this.x) * Math.min(1, dt * 20);
      if (this.elapsed >= (this.checkpoint + 1) * 10) { this.openCheckpoint(); return; }
      // Distance is the visual heartbeat of the ride. Keep it independent of object spawns.
      this.roadTravel = (this.roadTravel || 0) + dt * 180;
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        this.spawnCount++;
        this.spawnIn = .8 - this.checkpoint * .06;
        const lane = Math.floor(this.random() * 3), obstacle = (lane + 1 + Math.floor(this.random() * 2)) % 3;
        this.objects.push({ lane, y: -.08, kind: this.spawnCount % 9 === 0 ? 'boost' : 'star' });
        if (this.elapsed > 2 && this.random() > .2) this.objects.push({ lane: obstacle, y: -.08, kind: 'bumper' });
      }
      for (const o of this.objects) {
        o.y += dt * (.29 + this.checkpoint * .025);
        if (!o.taken && Math.abs(o.y - .82) < .048 && Math.abs([.2, .5, .8][o.lane] - this.x) < .115) {
          o.taken = true;
          if (o.kind === 'star') this.collect(o.y);
          else if (o.kind === 'boost') this.collectBoost(o.y);
          else if (!this.invulnerable) {
            this.shields--; this.streak = 0; this.invulnerable = 1.15;
            this.shake = effectsEnabled() ? .20 : 0;
            sound('hit'); this.message('Bump! Find an open lane.'); this.hud();
            announce(`${this.shields} shields remaining.`);
            if (!this.shields) { this.finish(false); return; }
          }
        }
      }
      this.objects = this.objects.filter(o => !o.taken && o.y < 1.15);
      document.getElementById('dash-distance').style.width = `${this.elapsed / (this.deck.length * 10) * 100}%`;
    }
    burst(kind, y = .82) {
      if (!effectsEnabled() || this.kind === 'chill') return;
      const n = kind === 'boost' ? 22 : kind === 'combo' ? 18 : 11;
      const palette = kind === 'boost' ? ['#27b7b4', '#6be6d1', '#a3f7e6', '#f7eac0'] : ['#f2b849', '#fff3a2', '#ef8e67', '#b69af1'];
      const yy = (.12 + y * .88);
      for (let i = 0; i < n; i++) {
        const a = this.fxRandom() * Math.PI * 2;
        const speed = .15 + this.fxRandom() * .42;
        this.particles.push({
          x: this.x, y: yy, vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - .06,
          life: .36 + this.fxRandom() * .44,
          maxLife: .8, size: 2 + this.fxRandom() * 4,
          colour: palette[i % palette.length]
        });
      }
      if (this.particles.length > 100) this.particles.splice(0, this.particles.length - 100);
    }
    pulse(id) {
      if (!effectsEnabled()) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('dash-bop');
      void el.offsetWidth;
      el.classList.add('dash-bop');
    }
    earnBadge(id) {
      if (!unlockBadge(id)) return;
      const item = badgeCatalog.find(b => b.id === id);
      if (item) {
        this.newBadges.push(item);
        announce('Arcade badge unlocked: ' + item.title + '.');
      }
    }
    collect(y) {
      const previousMultiplier = Math.min(3, 1 + Math.floor(this.streak / 5));
      this.stars++; this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      const multiplier = Math.min(3, 1 + Math.floor(this.streak / 5));
      this.score += 10 * multiplier;
      this.burst('star', y);
      this.pulse('dash-stars');
      if (multiplier > previousMultiplier) {
        this.flash = effectsEnabled() ? .18 : 0;
        this.burst('combo', y);
        this.message('⚡ COMBO ×' + multiplier + '! Keep the streak!');
        this.pulse('dash-combo');
        sound('combo');
        announce('Combo multiplier now ' + multiplier + ' times.');
      } else sound('star');
      if (this.streak >= 5) this.earnBadge('combo-five');
      this.hud();
    }
    collectBoost(y) {
      this.boosts++; this.score += 45;
      this.shields = Math.min(3, this.shields + 1);
      this.flash = effectsEnabled() ? .24 : 0;
      this.burst('boost', y);
      this.pulse('dash-shields');
      sound('boost');
      this.message('💎 CIVIC BOOST! +45 and a shield');
      this.earnBadge('civic-boost');
      this.hud();
      announce('Civic Boost collected. 45 bonus points. ' + this.shields + ' shields.');
    }
    hud() {
      document.getElementById('dash-score').textContent = this.score.toLocaleString();
      document.getElementById('dash-stars').textContent = `✦ ${this.stars}`;
      document.getElementById('dash-shields').textContent = this.kind === 'chill' ? 'Yours' : '♥ '.repeat(this.shields).trim() || '0';
      document.getElementById('dash-combo').textContent = `×${Math.min(3, 1 + Math.floor(this.streak / 5))}`;
      const boosts = document.getElementById('dash-boost-banner');
      if (boosts) boosts.textContent = this.boosts ? `💎 ${this.boosts} Civic Boost${this.boosts === 1 ? '' : 's'} collected` : '💎 Civic Boost: +45 points and a shield';
    }
    message(text) {
      const el = document.getElementById('dash-message');
      if (!el) return;
      el.textContent = text; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    }
    openCheckpoint() {
      this.phase = 'question'; cancelAnimationFrame(this.frame); this.objects = []; this.particles = []; this.draw();
      const item = this.deck[this.checkpoint];
      if (!item) { this.finish(true); return; }
      document.getElementById('dash-progress').textContent = `Checkpoint ${this.checkpoint + 1} / ${this.deck.length}`;
      this.show(`<span class="dash-kicker">LEARNING STOP ${this.checkpoint + 1} / ${this.deck.length} · NO TIMER</span><h2 class="dash-question" data-focus>${esc(item.q[1])}</h2><p class="dash-fine">Skyway paused. Take your time.</p><div class="dash-answers">${item.options.map((o, i) => `<button data-dash-choice="${i}"><span>${String.fromCharCode(65 + i)}</span><b>${esc(o.text)}</b></button>`).join('')}</div>`);
      announce(`Learning checkpoint ${this.checkpoint + 1}. The action is paused.`);
    }
    answer(index) {
      if (this.phase !== 'question') return;
      const item = this.deck[this.checkpoint], option = item.options[index]; if (!option) return;
      this.phase = 'feedback'; const ok = option.original === item.q[3];
      this.answers.push({ q: item.q, ok }); creditAnswer(item.q, ok);
      if (ok) { this.correct++; this.score += 120; this.shields = Math.min(3, this.shields + 1); sound('answer'); } else this.streak = 0;
      this.hud();
      const confetti = ok && effectsEnabled() ? '<div class="dash-confetti" aria-hidden="true">' + Array.from({length: 12}, (_, i) => '<i style="--i:' + i + '"></i>').join('') + '</div>' : '';
      this.show(`${confetti}<span class="dash-dialog-icon ${ok ? '' : 'dash-warm'}" aria-hidden="true">${ok ? '✦' : '♡'}</span><span class="dash-kicker">${ok ? '+120 POINTS' + (this.kind === 'chill' ? '' : ' · SHIELD RESTORED') : 'A LITTLE LEARNING MOMENT'}</span><h2 data-focus>${ok ? 'That’s the idea!' : 'Now you know.'}</h2>${ok ? '' : `<p class="dash-fine">You chose: ${esc(option.text)}</p>`}<div class="dash-explanation"><strong>${esc(item.q[2][item.q[3]])}</strong><p>${esc(item.q[4])}</p></div><p class="dash-fine">${ok ? 'Keep that one in your pocket.' : 'No shield lost. Learning is part of the adventure.'}</p><button class="dash-button dash-primary" data-dash-action="next">${this.checkpoint + 1 === this.deck.length ? 'See my results' : 'Back to the skyway'} →</button>`);
    }
    continue() {
      if (this.phase !== 'feedback') return;
      this.checkpoint++;
      if (this.checkpoint >= this.deck.length) { this.finish(true); return; }
      if (this.kind === 'daily') this.world = this.checkpoint;
      document.getElementById('dash-world-name').textContent = worlds[this.world].name;
      document.getElementById('dash-distance').style.width = `${this.checkpoint / this.deck.length * 100}%`;
      this.invulnerable = 1.1; this.spawnIn = .5; this.hide(); this.phase = 'running';
      if (this.kind === 'chill') this.chillStar(); else this.startLoop(); this.focusControls();
    }
    pause(message = 'Take a breath. Your skyway will be right here.') {
      if (this.phase !== 'running' && this.phase !== 'paused') return;
      this.phase = 'paused'; cancelAnimationFrame(this.frame);
      this.show(`<span class="dash-dialog-icon" aria-hidden="true">☁</span><h2 data-focus>Cloud break.</h2><p>${esc(message)}</p><div class="dash-pause-settings" role="group" aria-label="Comfort settings"><button data-dash-action="toggle-effects" aria-pressed="${data.effects}">Visual effects ${data.effects ? 'on' : 'off'}</button><button data-dash-action="toggle-sound" aria-pressed="${data.sound}">Sound ${data.sound ? 'on' : 'off'}</button></div><button class="dash-button dash-primary" data-dash-action="resume">Keep flying →</button><button class="dash-button dash-secondary" data-dash-action="leave">End run & return to arcade</button>`);
    }
    resume() { if (this.phase !== 'paused') return; this.hide(); this.phase = 'running'; if (this.kind === 'chill') this.chillStar(); else this.startLoop(); this.focusControls(); }
    finish(success) {
      if (this.saved) return;
      this.saved = true; this.phase = 'result'; cancelAnimationFrame(this.frame);
      this.earnBadge('first-flight');
      if (success && this.deck.length && this.correct === this.deck.length) this.earnBadge('perfect-run');
      const medal = !success ? 0 : this.correct === this.deck.length ? 3 : this.correct >= 2 ? 2 : 1;
      const freshBest = this.kind === 'adventure' && this.score > data.best;
      data.runs++; data.stars += this.stars;
      if (this.kind === 'adventure') data.best = Math.max(data.best, this.score);
      if (this.kind === 'daily') data.daily = { date: dayKey(), best: Math.max(data.daily.date === dayKey() ? num(data.daily.best) : 0, this.score) };
      else if (success) { if (!data.cleared.includes(this.world)) data.cleared.push(this.world); data.medals[this.world] = Math.max(data.medals[this.world] || 0, medal); }
      persist();
      if (data.cleared.length === 4) this.earnBadge('four-worlds');
      if (success) sound('victory');
      const badgeAward = this.newBadges.length ? '<section class="dash-new-badges" aria-label="New arcade achievements"><strong>🏅 New badge' + (this.newBadges.length === 1 ? '' : 's') + ' unlocked!</strong>' +
        this.newBadges.map(b => '<span>' + b.icon + ' ' + esc(b.title) + '</span>').join('') + '</section>' : '';
      const misses = this.answers.filter(x => !x.ok), review = misses.map(x => questionDomainMap[x.q[1]]).find(Boolean);
      this.show(`<span class="dash-result-stars" aria-label="${medal} of 3 exploration stars">${success ? '★'.repeat(medal) + '☆'.repeat(3 - medal) : '♡'}</span><span class="dash-kicker">${freshBest ? 'NEW ADVENTURE BEST!' : success ? 'JOURNEY COMPLETE' : 'EVERY RUN IS A FRESH START'}</span><h2 data-focus>${success ? this.kind === 'daily' ? 'Daily dash, done!' : 'Look at you go!' : 'A little bump. A new beginning.'}</h2><p>${success ? this.kind === 'daily' ? 'Four topics explored. Your best daily score is saved.' : `${esc(worlds[this.world].name)} explored. Your next adventure is waiting.` : 'Your learning answers are saved. Try again, or take a no-pressure chill ride.'}</p><div class="dash-result-grid"><div><strong>${this.score}</strong><small>Game points</small></div><div><strong>${this.stars}</strong><small>Stars collected</small></div><div><strong>${this.correct}/${this.answers.length}</strong><small>Answers correct</small></div></div><p class="dash-game-recap">💎 ${this.boosts} boost${this.boosts === 1 ? '' : 's'} · ⚡ Best combo ${this.maxStreak} stars</p>${badgeAward}<p class="dash-fine">${success ? 'Exploration stars celebrate this run, not exam readiness.' : `${this.checkpoint} / ${this.deck.length} checkpoints completed.`}</p>${success && this.kind !== 'daily' && this.world < 3 ? '<button class="dash-button dash-primary" data-dash-action="world">Next world →</button>' : '<button class="dash-button dash-primary" data-dash-action="retry">Play again →</button>'}<div class="dash-result-actions"><button class="dash-button dash-secondary" data-dash-action="leave">Back to arcade</button>${review ? `<button class="dash-button dash-secondary" data-domain="${esc(review)}">Review a missed idea</button>` : '<button class="dash-button dash-secondary" data-view="readiness">My learning progress</button>'}</div>`);
    }
    draw() {
      const c = this.ctx; if (!c) return;
      const w = this.width, h = this.height, theme = worlds[this.world], roadTop = h * .12;
      c.clearRect(0, 0, w, h); c.save();
      if (effectsEnabled() && this.shake > 0) c.translate(Math.sin(this.elapsed * 110) * this.shake * 14, 0);
      c.fillStyle = theme.sky; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(w * .82, h * .13, 43, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 3; i++) {
        const drift = this.kind === 'chill' ? 0 : (this.roadTravel || this.elapsed * 180) * .08;
        const x = (i * 190 + 35 - drift) % 590 - 55; this.cloud(x, h * (.08 + i * .055));
      }
      c.fillStyle = theme.hill; c.beginPath(); c.moveTo(0, h * .38); c.quadraticCurveTo(w * .2, h * .05, w * .45, h * .35); c.quadraticCurveTo(w * .75, h * .1, w, h * .3); c.lineTo(w, h); c.lineTo(0, h); c.fill();
      c.fillStyle = '#fffaf3'; c.beginPath(); c.moveTo(w * .37, roadTop); c.lineTo(w * .63, roadTop); c.lineTo(w * .99, h); c.lineTo(w * .01, h); c.closePath(); c.fill();
      c.strokeStyle = '#e4dbe9'; c.lineWidth = 2;
      // Moving cross-markers make forward flight readable even when no collectible is nearby.
      if (this.kind !== 'chill') {
        const travel = (this.roadTravel || this.elapsed * 180) % 92;
        c.strokeStyle = '#eadfea'; c.lineWidth = 2;
        for (let y = roadTop - 92 + travel; y < h; y += 92) {
          const p = Math.max(0, Math.min(1, (y - roadTop) / Math.max(1, h - roadTop)));
          const half = w * (.13 + .36 * p);
          c.globalAlpha = .22 + .32 * p;
          c.beginPath(); c.moveTo(w * .5 - half, y); c.lineTo(w * .5 + half, y); c.stroke();
        }
        c.globalAlpha = 1;
      }
      for (const v of [1 / 3, 2 / 3]) { c.setLineDash([8, 15]); c.lineDashOffset = this.kind === 'chill' ? 0 : -(this.roadTravel || this.elapsed * 180); c.beginPath(); c.moveTo(w * (.37 + .26 * v), roadTop); c.lineTo(w * (.01 + .98 * v), h); c.stroke(); } c.setLineDash([]);
      const project = (lane, y) => ({ x: w * (.5 + (lane - 1) * (.10 + Math.max(0, y) * .244)), y: roadTop + y * (h - roadTop), scale: .42 + Math.max(0, y) * .68 });
      if (this.kind === 'chill' && this.phase === 'running') { const p = project(this.target, .5); this.star(p.x, p.y, 27, '#ffc850'); }
      for (const o of this.objects) {
        if (o.taken) continue; const p = project(o.lane, o.y);
        if (o.kind === 'star') this.star(p.x, p.y, 24 * p.scale, '#ffc850');
        else if (o.kind === 'boost') this.boostIcon(p.x, p.y, p.scale);
        else { c.save(); c.translate(p.x, p.y); c.scale(p.scale, p.scale); c.fillStyle = '#dc583f'; c.beginPath(); roundedRect(c, -28, -17, 56, 34, 10); c.fill(); c.fillStyle = '#fff1dc'; c.fillRect(-17, -4, 34, 7); c.fillStyle = '#b54238'; c.fillRect(-23, 14, 46, 5); c.restore(); }
      }
      const py = roadTop + .82 * (h - roadTop), px = w * (.5 + (this.x - .5) * 1.0);
      if (effectsEnabled() && this.kind !== 'chill') for (const p of this.trail) {
        c.globalAlpha = Math.max(0, Math.min(.42, p.life * .8));
        c.fillStyle = '#a68aea';
        c.beginPath(); c.arc(p.x * w, py + 4, 12 + (1 - p.life) * 15, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
      c.save(); c.globalAlpha = this.invulnerable > 0 ? .7 : 1; c.fillStyle = '#5e487c22'; c.beginPath(); c.ellipse(px, py + 34, 33, 8, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#7760cf'; c.beginPath(); roundedRect(c, px - 33, py + 19, 66, 12, 8); c.fill(); this.star(px, py - 6, 31, '#ffbf4f');
      c.fillStyle = '#49384f'; for (const dx of [-8, 8]) { c.beginPath(); c.arc(px + dx, py - 9, 2.7, 0, Math.PI * 2); c.fill(); } c.strokeStyle = '#49384f'; c.lineWidth = 2; c.beginPath(); c.arc(px, py - 2, 6, 0, Math.PI); c.stroke(); c.restore();
      if (effectsEnabled()) for (const p of this.particles) {
        c.globalAlpha = Math.max(0, Math.min(.9, p.life / p.maxLife));
        c.fillStyle = p.colour;
        c.beginPath(); c.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
      if (effectsEnabled() && this.flash > 0) {
        c.fillStyle = 'rgba(255, 246, 184, ' + Math.min(.08, this.flash * .3) + ')';
        c.fillRect(0, 0, w, h);
      }
      c.restore();
    }
    boostIcon(x, y, scale) {
      const c = this.ctx;
      c.save(); c.translate(x, y); c.scale(scale, scale);
      if (effectsEnabled()) { c.shadowBlur = 12; c.shadowColor = '#20cdbb'; }
      c.fillStyle = '#158e99'; c.beginPath();
      c.moveTo(0, -31); c.lineTo(26, 0); c.lineTo(0, 31); c.lineTo(-26, 0); c.closePath(); c.fill();
      c.shadowBlur = 0; c.strokeStyle = '#d6fff3'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#e8fff3'; c.font = 'bold 22px system-ui';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+', 0, 1);
      c.restore();
    }
    cloud(x, y) { const c = this.ctx; c.fillStyle = '#ffffffb8'; c.beginPath(); c.ellipse(x, y, 34, 10, 0, 0, Math.PI * 2); c.ellipse(x - 10, y - 8, 14, 13, 0, 0, Math.PI * 2); c.ellipse(x + 9, y - 6, 19, 14, 0, 0, Math.PI * 2); c.fill(); }
    star(x, y, radius, color) { const c = this.ctx; c.fillStyle = color; c.beginPath(); for (let i = 0; i < 10; i++) { const angle = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? radius * .48 : radius; const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); c.fill(); }
    dispose() { this.phase = 'disposed'; cancelAnimationFrame(this.frame); this.events.abort(); if (this.resize) this.resize.disconnect(); }
  }
  // Small compatibility bridge: keep the existing syllabus and delegated actions intact.
  games = lobby;
  const baseRoute = route;
  const viewAliases = { play: 'games', progress: 'readiness', today: 'home', practise: 'practice' };
  const knownViews = new Set(['home', 'syllabus', 'audit', 'glossary', 'learn', 'readings', 'study', 'visual', 'map', 'cards', 'game', 'games', 'practice', 'mistakes', 'values', 'mock', 'readiness']);
  const parentView = v => ['syllabus', 'audit', 'glossary', 'learn', 'readings', 'visual', 'map'].includes(v) ? 'study' : ['cards', 'mistakes', 'values'].includes(v) ? 'practice' : v === 'game' ? 'games' : v;
  function setNavigation(view) { document.body.dataset.page = parentView(view); document.querySelectorAll('.nav button').forEach(b => { const on = b.dataset.view === parentView(view); b.classList.toggle('active', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); }
  function clearMock() { if (mockTimer) { clearInterval(mockTimer); mockTimer = null; } if (session && session.mode === 'mock') session = null; }
  route = function (view, fromHistory = false) {
    view = viewAliases[view] || view; if (!knownViews.has(view)) view = 'home';
    stop(); clearMock(); baseRoute(view); setNavigation(view);
    if (view === 'home') {
      const stat = app.querySelector('.mini-stats span:nth-child(2)');
      if (stat) { stat.querySelector('b').textContent = data.best; stat.querySelector('small').textContent = 'Best game'; }
      const playCopy = app.querySelector('.mode-card[data-view="games"] p');
      if (playCopy) playCopy.textContent = 'Steer Sunny, collect stars and learn in Civic Dash.';
    }
    const fragment = view === 'games' ? 'play' : view === 'readiness' ? 'progress' : view;
    if (!fromHistory && location.hash !== `#${fragment}`) history.pushState({ view }, '', `#${fragment}`);
    window.scrollTo({ top: 0, behavior: 'instant' }); focusHeading();
  };
  window.addEventListener('hashchange', () => { if (location.hash !== '#app') route(location.hash.slice(1), true); });
  document.querySelector('.skip-link')?.addEventListener('click', e => { e.preventDefault(); app.focus({ preventScroll: true }); });
  // Subpages use the legacy delegated handler instead of route(). Clean up before it runs.
  document.addEventListener('click', e => {
    const studyAction = e.target.closest('[data-domain],[data-study],[data-study-resume],[data-lesson],[data-story]');
    const practiceAction = e.target.closest('[data-topic],[data-evidence],[data-adaptive],[data-mapquiz]');
    if (!studyAction && !practiceAction) return;
    stop(); clearMock(); const parent = studyAction ? 'study' : 'practice'; setNavigation(parent);
    if (location.hash !== `#${parent}`) history.pushState({ view: parent }, '', `#${parent}`);
    queueMicrotask(() => { window.scrollTo({ top: 0, behavior: 'instant' }); focusHeading(); });
  }, true);
  route(location.hash.slice(1) || 'home', true);
})();
