// foldkit content script · sidebar + HUD + κ classifier + F(S⃗) fingerprint
// AI-Native Solutions · MIT
(function(){
  if (window.__foldkitLoaded) return;
  window.__foldkitLoaded = true;

  const FK = window.foldkit || {};
  const SPINE = FK.SPINE || [2,3,5,7,11,13,17];
  const GLYPHS = FK.SPINE_GLYPHS || ['●','〜','┃','♡','△','◐','◯'];
  const NAMES = FK.SPINE_NAMES || ['ground','perception','gate','heart','naming','observation','resolution'];

  // ---- helpers ----
  function classify(text){
    if (FK.classifyKappaBand) return FK.classifyKappaBand(text);
    return { name: 'ground', glyph: '●', ring: 0 };
  }
  function probe(text){
    if (FK.probeFromKappa) return FK.probeFromKappa(null, text);
    return { band: classify(text), op: { verb: 'ECHO', kanji: '響', probe: '' }, probe: '' };
  }
  function pageStateVector(text){
    // hash text into 7 spine buckets, threshold for exponent
    const buckets = new Array(7).fill(0);
    const words = (text || '').toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    for (const w of words){
      let h = 0;
      for (let i=0;i<w.length;i++) h = ((h<<5) - h + w.charCodeAt(i)) | 0;
      buckets[Math.abs(h) % 7]++;
    }
    const total = words.length || 1;
    // exponents 0..3 based on normalized share
    return buckets.map(c => {
      const share = c / total;
      if (share > 0.22) return 3;
      if (share > 0.16) return 2;
      if (share > 0.10) return 1;
      return 0;
    });
  }
  function foldNumber(S){
    if (FK.foldNumber) return FK.foldNumber(S);
    return SPINE.reduce((a,p,i)=> a * Math.pow(p, S[i]||0), 1);
  }
  function stateSignature(S){
    return GLYPHS.map((g,i)=> (S[i]||0)>0 ? `${g}^${S[i]}` : '').filter(Boolean).join('·') || '∅';
  }

  // ---- UI ----
  const host = document.createElement('div');
  host.id = 'foldkit-host';
  host.setAttribute('data-foldkit','1');
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    .fk-hud, .fk-sidebar {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      color: #e8e4db;
      box-sizing: border-box;
    }
    .fk-hud {
      position: fixed; bottom: 14px; right: 14px;
      background: rgba(26,26,30,0.92); backdrop-filter: blur(8px);
      border: 1px solid rgba(232,228,219,0.16);
      border-radius: 10px; padding: 6px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px; letter-spacing: 0.08em;
      color: #7a9c7e; cursor: pointer; z-index: 2147483646;
      user-select: none;
    }
    .fk-hud .g { font-size: 14px; margin-right: 6px; }
    .fk-hud .b { color: #d4a052; }
    .fk-hud.hidden { display: none; }

    .fk-sidebar {
      position: fixed; top: 0; right: -380px; width: 360px; height: 100vh;
      background: #1a1a1e;
      border-left: 1px solid rgba(232,228,219,0.16);
      transition: right 0.3s ease;
      z-index: 2147483647;
      display: flex; flex-direction: column;
      box-shadow: -8px 0 30px rgba(0,0,0,0.4);
    }
    .fk-sidebar.open { right: 0; }
    .fk-head {
      padding: 16px 18px 12px;
      border-bottom: 1px solid rgba(232,228,219,0.08);
      display: flex; justify-content: space-between; align-items: center;
    }
    .fk-brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 22px; color: #e8e4db;
    }
    .fk-brand .glyph { color: #7a9c7e; margin-right: 6px; }
    .fk-brand em { color: #7a9c7e; font-style: italic; }
    .fk-close {
      background: transparent; border: 1px solid rgba(232,228,219,0.16);
      color: #928d80; padding: 4px 10px; border-radius: 6px;
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
    }
    .fk-close:hover { color: #e8e4db; }
    .fk-body { flex: 1; overflow-y: auto; padding: 16px 18px 24px; }
    .fk-body::-webkit-scrollbar { width: 6px; }
    .fk-body::-webkit-scrollbar-thumb { background: rgba(232,228,219,0.16); border-radius: 3px; }
    h3 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; color: #928d80;
      letter-spacing: 0.16em; text-transform: uppercase;
      margin: 18px 0 8px; font-weight: 500;
    }
    h3:first-child { margin-top: 4px; }
    .fk-card {
      background: #212127; border: 1px solid rgba(232,228,219,0.08);
      border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;
    }
    .fk-band {
      display: flex; align-items: center; gap: 10px;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 22px; color: #e8e4db;
    }
    .fk-band .g { font-size: 26px; color: #7a9c7e; }
    .fk-band .n { font-style: italic; color: #7a9c7e; }
    .fk-op {
      display: flex; align-items: baseline; gap: 8px; margin-top: 6px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: #d4a052; letter-spacing: 0.1em; text-transform: uppercase;
    }
    .fk-op .k { font-size: 16px; }
    .fk-probe {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 16px; font-style: italic; color: #e8e4db;
      line-height: 1.5; margin-top: 8px;
    }
    .fk-sel {
      font-size: 12px; color: #928d80; margin-top: 8px;
      max-height: 60px; overflow-y: auto;
      border-left: 2px solid rgba(232,228,219,0.16);
      padding: 4px 10px; line-height: 1.5;
    }
    .fk-fp {
      font-family: 'JetBrains Mono', monospace; font-size: 12px;
      color: #7a9c7e; letter-spacing: 0.06em;
    }
    .fk-fp .num { color: #d4a052; font-size: 15px; }
    .fk-sig { color: #e8e4db; font-size: 16px; margin-top: 4px; letter-spacing: 0.06em; }
    .fk-vec {
      display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
      margin-top: 10px;
    }
    .fk-vec .cell {
      text-align: center; padding: 4px 0;
      background: #2a2a30; border-radius: 4px;
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      color: #928d80;
    }
    .fk-vec .cell.on { background: rgba(122,156,126,0.14); color: #7a9c7e; }
    .fk-vec .cell .g { display: block; font-size: 14px; color: #e8e4db; }
    .fk-tools {
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px;
    }
    .fk-tool {
      background: #2a2a30; color: #e8e4db;
      border: 1px solid rgba(232,228,219,0.08);
      border-radius: 8px; padding: 8px 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      letter-spacing: 0.12em; text-transform: uppercase;
      cursor: pointer; text-align: center;
    }
    .fk-tool:hover { background: rgba(122,156,126,0.14); color: #7a9c7e; }
    .fk-foot {
      padding: 10px 18px; border-top: 1px solid rgba(232,228,219,0.08);
      font-family: 'JetBrains Mono', monospace; font-size: 9px;
      color: #6b6660; letter-spacing: 0.14em; text-transform: uppercase;
      text-align: center;
    }
    .fk-empty {
      color: #6b6660; font-style: italic;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 15px;
    }
  `;
  shadow.appendChild(style);

  const hud = document.createElement('div');
  hud.className = 'fk-hud';
  hud.innerHTML = `<span class="g">●</span><span class="b">ground</span>`;
  hud.title = 'foldkit · click to open sidebar';
  hud.addEventListener('click', ()=> toggle(true));
  shadow.appendChild(hud);

  const sb = document.createElement('div');
  sb.className = 'fk-sidebar';
  sb.innerHTML = `
    <div class="fk-head">
      <div class="fk-brand"><span class="glyph">◊</span>fold<em>kit</em></div>
      <button class="fk-close">close</button>
    </div>
    <div class="fk-body">
      <h3>selection · κ band</h3>
      <div class="fk-card">
        <div class="fk-band"><span class="g" id="fk-glyph">●</span><span class="n" id="fk-name">ground</span></div>
        <div class="fk-op" id="fk-op"></div>
        <div class="fk-probe" id="fk-probe">select text on the page to classify.</div>
        <div class="fk-sel" id="fk-sel" style="display:none"></div>
      </div>

      <h3>page · F(S⃗) fingerprint</h3>
      <div class="fk-card">
        <div class="fk-fp"><span>F = </span><span class="num" id="fk-fold">1</span></div>
        <div class="fk-sig" id="fk-sig">∅</div>
        <div class="fk-vec" id="fk-vec"></div>
      </div>

      <h3>estate tools</h3>
      <div class="fk-tools">
        <button class="fk-tool" data-tool="mirror">fallmirror</button>
        <button class="fk-tool" data-tool="px">fallpx</button>
        <button class="fk-tool" data-tool="sig">fallsignature</button>
        <button class="fk-tool" data-tool="bloom">bloom overlay</button>
      </div>
    </div>
    <div class="fk-foot">◊·κ=1 · ai-native solutions</div>
  `;
  shadow.appendChild(sb);
  (document.documentElement || document.body).appendChild(host);

  const $ = id => shadow.getElementById(id);
  sb.querySelector('.fk-close').addEventListener('click', ()=> toggle(false));
  sb.querySelectorAll('.fk-tool').forEach(b => {
    b.addEventListener('click', ()=> {
      const sel = String(window.getSelection && window.getSelection().toString() || '').trim();
      chrome.runtime.sendMessage({ type: 'open-tool', tool: b.dataset.tool, input: sel });
    });
  });

  function toggle(force){
    const open = typeof force === 'boolean' ? force : !sb.classList.contains('open');
    sb.classList.toggle('open', open);
    if (open) refreshFingerprint();
  }

  // ---- selection classification ----
  let lastSel = '';
  function onSelection(){
    const sel = String(window.getSelection && window.getSelection().toString() || '').trim();
    if (!sel || sel === lastSel) return;
    if (sel.length < 3) return;
    lastSel = sel;
    const r = probe(sel);
    const band = r.band || { glyph: '●', name: 'ground' };
    const op = r.op || {};
    $('fk-glyph').textContent = band.glyph || '●';
    $('fk-name').textContent = band.name || 'ground';
    $('fk-op').innerHTML = op.kanji
      ? `<span class="k">${op.kanji}</span><span>${op.verb || ''}</span>`
      : '';
    $('fk-probe').textContent = op.probe || r.probe || '—';
    const selDiv = $('fk-sel');
    selDiv.style.display = 'block';
    selDiv.textContent = sel.length > 240 ? sel.slice(0,240) + '…' : sel;
    // HUD
    hud.innerHTML = `<span class="g">${band.glyph||'●'}</span><span class="b">${band.name||'ground'}</span>`;
  }
  document.addEventListener('mouseup', ()=> setTimeout(onSelection, 10));
  document.addEventListener('keyup', e => {
    if (e.shiftKey || e.key === 'Shift') setTimeout(onSelection, 10);
  });

  // ---- page fingerprint ----
  function refreshFingerprint(){
    const text = (document.body && document.body.innerText || '').slice(0, 200000);
    const S = pageStateVector(text);
    const F = foldNumber(S);
    $('fk-fold').textContent = F.toLocaleString();
    $('fk-sig').textContent = stateSignature(S);
    const vec = $('fk-vec');
    vec.innerHTML = '';
    for (let i=0;i<7;i++){
      const c = document.createElement('div');
      c.className = 'cell' + ((S[i]||0)>0 ? ' on' : '');
      c.innerHTML = `<span class="g">${GLYPHS[i]}</span>${S[i]||0}`;
      c.title = NAMES[i];
      vec.appendChild(c);
    }
  }

  // ---- storage: hud visibility ----
  try {
    chrome.storage && chrome.storage.sync.get({ hudVisible: true }, res => {
      hud.classList.toggle('hidden', !res.hudVisible);
    });
    chrome.storage && chrome.storage.onChanged.addListener(changes => {
      if (changes.hudVisible) hud.classList.toggle('hidden', !changes.hudVisible.newValue);
    });
  } catch(e){}

  // ---- messages from background ----
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === 'toggle-sidebar') { toggle(); sendResponse({ ok: true }); }
    if (msg && msg.type === 'get-selection') {
      sendResponse({ selection: String(window.getSelection && window.getSelection().toString() || '').trim() });
    }
    return true;
  });

  // initial fingerprint pass
  setTimeout(refreshFingerprint, 500);
})();
