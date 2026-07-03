(() => {
  const BOARD_W = 2960;
  const BOARD_H = 2340;
  const PAD     = 55;
  const MAX_ZOOM = 2.1;

  const topbar     = document.querySelector('.topbar');
  const viewport   = document.getElementById('viewport');
  const board      = document.getElementById('board');
  const threads    = document.getElementById('threads');
  const tabs       = document.querySelectorAll('.evidence-tabs button');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const intro      = document.getElementById('intro');
  const clusters   = Array.from(document.querySelectorAll('.cluster'));

  const folderModal    = document.getElementById('folderModal');
  const folderBackdrop = document.getElementById('folderBackdrop');
  const folderClose    = document.getElementById('folderClose');
  const fmCase         = document.getElementById('fmCase');
  const fmStatus       = document.getElementById('fmStatus');
  const fmTitle        = document.getElementById('fmTitle');
  const fmMeta         = document.getElementById('fmMeta');
  const fmSummary      = document.getElementById('fmSummary');
  const fmDetails      = document.getElementById('fmDetails');

  const reelHud       = document.getElementById('reelHud');
  const reelTimecode  = document.getElementById('reelTimecode');
  const reelCaption   = document.getElementById('reelCaption');
  const replayReelBtn = document.getElementById('replayReelBtn');

  const detectiveSenseBtn = document.getElementById('detectiveSenseBtn');
  const folderBody        = document.getElementById('folderBody');

  let currentZoom = null;
  let reelPlaying = false;
  let expScrollBounds = null; // {scale, tx, minTy, maxTy, currentTy} — camera pan range while zoomed on Experience
  let wheelIdleTimer;
  let pendingWheelTy = null;
  let wheelRafId = null;
  const isDesktop = () => window.matchMedia('(min-width: 881px)').matches;

  /* ---- INTRO REEL ----
     A short cinematic camera sweep through a handful of evidence cards,
     styled like reviewed security footage, that plays as the intro fades. */
  const REEL_STOPS = [
    { id:'card-bio-photo',      caption:'Subject identified…',              highlight:null },
    { id:'card-bio-id',         caption:'Cross-referencing profile…',       highlight:'hl-bio-role' },
    { id:'card-edu-diploma',    caption:'Verifying credentials…',           highlight:'hl-edu-honours' },
    { id:'card-bio-highlights', caption:'Compiling case highlights…',       highlight:'hl-bio-stat' },
    { id:'card-exp-1',          caption:'Reviewing active case file…',      highlight:'hl-exp-case' },
    { id:'card-proj-2',         caption:'Inspecting open cases…',           highlight:'hl-proj-name' },
    { id:'card-rec-1',          caption:'Collecting witness statements…',   highlight:'hl-rec-quote' },
    { id:'card-contact-main',   caption:'Locating contact details…',        highlight:'hl-contact-email' },
  ];

  const wait = ms => new Promise(res => setTimeout(res, ms));

  function formatTimecode(ms){
    const totalCentis = Math.floor(ms / 10);
    const centis  = totalCentis % 100;
    const seconds = Math.floor(totalCentis / 100) % 60;
    const minutes = Math.floor(totalCentis / 6000);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}:${pad(centis)}`;
  }

  /* Board-space rect of an element, independent of the board's current scale/translate.
     Accepts an optional pre-computed {boardRect, scale} to avoid redundant
     getComputedStyle/getBoundingClientRect reads when called in a loop. */
  function boardSpaceRect(el, info){
    const { boardRect, scale } = info || getBoardScaleInfo();
    const r = el.getBoundingClientRect();
    return {
      x: (r.left - boardRect.left) / scale,
      y: (r.top  - boardRect.top)  / scale,
      w: r.width  / scale,
      h: r.height / scale,
    };
  }

  function getBoardScaleInfo(){
    const boardRect = board.getBoundingClientRect();
    const m = new DOMMatrix(getComputedStyle(board).transform);
    return { boardRect, scale: m.a || 1 };
  }

  /* Board-space bounding rect that covers a set of elements. */
  function unionBoardRect(els){
    const info = getBoardScaleInfo();
    const rects = els.filter(Boolean).map(el => boardSpaceRect(el, info));
    const x = Math.min(...rects.map(r => r.x));
    const y = Math.min(...rects.map(r => r.y));
    const right  = Math.max(...rects.map(r => r.x + r.w));
    const bottom = Math.max(...rects.map(r => r.y + r.h));
    return { x, y, w: right - x, h: bottom - y };
  }

  function zoomToBoardRect(r, opts = {}){
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const pad = opts.pad ?? PAD;
    let scale = Math.min(vw / (r.w + pad*2), vh / (r.h + pad*2));
    scale = Math.min(scale, opts.maxZoom ?? MAX_ZOOM);
    const cx = r.x + r.w/2, cy = r.y + r.h/2;
    applyTransform(scale, vw/2 - cx*scale, vh/2 - cy*scale);
  }

  async function playIntroReel(){
    if (!isDesktop() || reelPlaying) return;

    const stops = REEL_STOPS
      .map(s => {
        const el = document.getElementById(s.id);
        if (!el) return null;
        return {
          rect: boardSpaceRect(el),
          caption: s.caption,
          highlightEl: s.highlight ? document.getElementById(s.highlight) : null,
        };
      })
      .filter(Boolean);
    if (!stops.length) return;

    reelPlaying = true;
    document.querySelectorAll('.reel-highlight').forEach(el => el.classList.remove('reel-highlight--active'));
    document.body.classList.add('reel-active');

    const start = performance.now();
    const timer = setInterval(() => {
      reelTimecode.textContent = formatTimecode(performance.now() - start);
    }, 100);

    for (const stop of stops){
      reelCaption.textContent = stop.caption;
      zoomToBoardRect(stop.rect, { pad:70, maxZoom:2.3 });
      if (stop.highlightEl){
        setTimeout(() => stop.highlightEl.classList.add('reel-highlight--active'), 1100);
      }
      await wait(2200);
    }

    reelCaption.textContent = 'Case board assembled.';
    await wait(800);
    clearInterval(timer);

    document.body.classList.remove('reel-active');
    fitBoard();
    requestAnimationFrame(() => buildThreads());
    reelPlaying = false;
  }

  function replayReel(){
    if (reelPlaying || !isDesktop()) return;
    if (folderModal.classList.contains('open')) closeFolder();
    currentZoom = null;
    document.body.classList.remove('zoomed');
    viewport.classList.remove('zoomed');
    clusters.forEach(c => c.classList.remove('is-active'));
    tabs.forEach(t => t.classList.remove('active'));
    playIntroReel();
  }

  /* ---- Keep the viewport clear of the fixed header ---- */
  function syncHeaderHeight(){
    if (topbar) document.documentElement.style.setProperty('--header-h', topbar.offsetHeight + 'px');
  }

  /* ---- LAYOUT clusters from data attributes ---- */
  function rectOf(el){
    return { x:+el.dataset.x, y:+el.dataset.y, w:+el.dataset.w, h:+el.dataset.h };
  }
  function layoutClusters(){
    if (!isDesktop()){
      clusters.forEach(el=>{ el.style.left=el.style.top=el.style.width=el.style.height=''; });
      return;
    }
    clusters.forEach(el => {
      const r = rectOf(el);
      el.style.left  = r.x+'px';
      el.style.top   = r.y+'px';
      el.style.width = r.w+'px';
      el.style.height= r.h+'px';
    });
  }

  /* ---- GRADIENT GLOW WRAPPERS ---- */
  function addGradientWrappers(){
    document.querySelectorAll('.card').forEach(card => {
      const wrapper = document.createElement('div');
      wrapper.className = 'card-glow-wrapper';
      card.parentNode.insertBefore(wrapper, card);
      wrapper.appendChild(card);
    });
  }

  /* ---- PINS ---- */
  function addPins(){
    document.querySelectorAll('.pinned').forEach(el => {
      if (el.querySelector('.card-pin')) return;
      const color = el.dataset.pinColor || 'red';
      const pin = document.createElement('div');
      pin.className = `card-pin card-pin--${color}`;
      el.appendChild(pin);
    });
  }

  /* ---- RED STRING THREADS between individual cards ---- */
  /*
    Each connection names two card element IDs and an attachment anchor on each
    ('top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' |
     'bottom-right' | 'left' | 'right').

    Positions are resolved at draw-time by reading the card's rendered position
    relative to the board element, so they track the actual laid-out cards.
  */
  const CARD_CONNECTIONS = [
    // Bio card → Education clipping (bio connects to studies)
    { fromId:'card-bio-id',       fromAnchor:'top-right',     toId:'card-edu-clipping',    toAnchor:'left',         pinColor:'#d4a017' },
    // Bio note → Experience report 1 (the quote feeds into the first job)
    { fromId:'card-bio-note',     fromAnchor:'bottom-right',  toId:'card-exp-1',           toAnchor:'top-left',     pinColor:'#c0392b' },
    // Education diploma → Projects folder 2 (thesis → cipher_kit project)
    { fromId:'card-edu-diploma',  fromAnchor:'bottom-right',  toId:'card-proj-2',          toAnchor:'top-left',     pinColor:'#2e4374' },
    // Education cert → Contact card (cert linked to contact info)
    { fromId:'card-edu-cert',     fromAnchor:'right',         toId:'card-contact-main',    toAnchor:'left',         pinColor:'#4f7942' },
    // Experience 1 → Experience 2 (career timeline)
    { fromId:'card-exp-1',        fromAnchor:'bottom-center', toId:'card-exp-2',           toAnchor:'top-center',   pinColor:'#c0392b' },
    // Experience 2 → Experience 3 (career timeline)
    { fromId:'card-exp-2',        fromAnchor:'bottom-center', toId:'card-exp-3',           toAnchor:'top-center',   pinColor:'#c0392b' },
    // Experience 1 → Projects folder 1 (main job → de_constructor project)
    { fromId:'card-exp-1',        fromAnchor:'right',         toId:'card-proj-1',          toAnchor:'left',         pinColor:'#c0392b' },
    // Experience 2 → Projects folder 3 (pixel studio → stakeout project)
    { fromId:'card-exp-2',        fromAnchor:'right',         toId:'card-proj-3',          toAnchor:'left',         pinColor:'#2e4374' },
    // Experience 1 → Recommendation 1 (Marcus's testimonial)
    { fromId:'card-exp-1',        fromAnchor:'top-right',     toId:'card-rec-1',           toAnchor:'left',         pinColor:'#c0392b' },
    // Experience 2 → Recommendation 2 (Aria's testimonial)
    { fromId:'card-exp-2',        fromAnchor:'right',         toId:'card-rec-2',           toAnchor:'left',         pinColor:'#2e4374' },
    // Experience 3 → Recommendation 3 (James's testimonial)
    { fromId:'card-exp-3',        fromAnchor:'right',         toId:'card-rec-3',           toAnchor:'left',         pinColor:'#4f7942' },
    // Contact rolodex → Recommendation note
    { fromId:'card-contact-rolodex', fromAnchor:'bottom-center', toId:'card-rec-note',     toAnchor:'top-center',   pinColor:'#d4a017' },
    // Photo card → Bio Card
    { fromId:'card-bio-photo',       fromAnchor:'top-right',     toId:'card-bio-id',    toAnchor:'left',         pinColor:'#d4a017' },
  ];

  /* Get the anchor point of a card in board-space coordinates.
     Always returns the pin centre: top-centre of the card, offset up by
     the pin's visual centre (pin is top:-14px, height:22px → centre at y-3). */
  function cardAnchorPoint(el, info) {
    const { boardRect, scale } = info || getBoardScaleInfo();
    // Use the actual rendered pin element so rotated cards still align correctly
    const pin = el.querySelector('.card-pin');
    const target = pin || el;
    const r = target.getBoundingClientRect();
    const cx = (r.left + r.right)  / 2;
    const cy = (r.top  + r.bottom) / 2;
    return {
      x: (cx - boardRect.left) / scale,
      y: (cy - boardRect.top)  / scale,
    };
  }

  function buildThreads(){
    if (!isDesktop()){ threads.innerHTML=''; return; }

    // Set the SVG to exactly fill the board canvas
    threads.setAttribute('viewBox', `0 0 ${BOARD_W} ${BOARD_H}`);
    threads.setAttribute('width',  BOARD_W);
    threads.setAttribute('height', BOARD_H);

    let svg = '';
    const info = getBoardScaleInfo();

    const PIN_GRADIENTS = {
      '#c0392b': { id:'pg-red',   hi:'#e74c3c', lo:'#8b1a1a' },
      '#d4a017': { id:'pg-gold',  hi:'#f5c842', lo:'#a06b00' },
      '#2e4374': { id:'pg-navy',  hi:'#4a6fa5', lo:'#1a2e50' },
      '#4f7942': { id:'pg-green', hi:'#6abf69', lo:'#2d6b2c' },
    };

    function svgPin(x, y, color) {
      const g = PIN_GRADIENTS[color] || PIN_GRADIENTS['#c0392b'];
      const r = 10;
      return `
        <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g.id})"
          stroke="rgba(0,0,0,.28)" stroke-width="1" filter="url(#pin-shadow)"/>
        <rect x="${x - 1.5}" y="${y + r - 1}" width="3" height="10" rx="1.5"
          fill="rgba(0,0,0,.38)"/>
      `;
    }

    CARD_CONNECTIONS.forEach(conn => {
      const fromEl = document.getElementById(conn.fromId);
      const toEl   = document.getElementById(conn.toId);
      if (!fromEl || !toEl) return;

      const a = cardAnchorPoint(fromEl, info);
      const b = cardAnchorPoint(toEl, info);

      // Natural sag: control point hangs below the midpoint
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const sagAmount = Math.min(80, dist * 0.12 + 20);

      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2 + sagAmount;

      const pc = conn.pinColor;

      svg += `<path d="M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}" fill="none" stroke="#a3271f" stroke-width="2.8" stroke-linecap="round" filter="url(#thread-shadow)"/>`;
      svg += svgPin(a.x, a.y, pc);
      svg += svgPin(b.x, b.y, pc);
    });

    // Wrap with defs for drop-shadow filter and pin gradients
    const gradientDefs = Object.values(PIN_GRADIENTS).map(g => `
      <radialGradient id="${g.id}" cx="35%" cy="35%" r="65%">
        <stop offset="0%"   stop-color="${g.hi}"/>
        <stop offset="100%" stop-color="${g.lo}"/>
      </radialGradient>
    `).join('');

    threads.innerHTML = `
      <defs>
        <filter id="thread-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
        <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
        ${gradientDefs}
      </defs>
      ${svg}
    `;
  }

  /* ---- DETECTIVE SENSE — lightweight dictionary/regex NER ----
     Scans visible text for entities (organisations, technologies, dates,
     result/metric figures) and wraps each match in a <mark> with a
     spaCy-displacy-style label tag. Highlighting is toggled purely via a
     body class so the underlying markup only needs to be built once. */
  const NER_COMPANY_TERMS = [
    'CoachScribe', 'ITO World', 'GOF', 'AccntMapper', 'Taxually', 'NNG', 'EnCo Soft',
    'Pázmány Péter Catholic University', 'GitHub', 'LinkedIn', 'Morgan Stanley'
  ];
  const NER_TECH_TERMS = [
    'Python', 'PyTorch', 'LLMs', 'RAG', 'NLP', 'AWS', 'Docker', 'MLFlow', 'SQL',
    'Computer Vision', 'LiDAR', 'OpenCV', 'Point Clouds',
  ];
  const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const byLenDesc = (a, b) => b.length - a.length;

  const NER_TYPES = [
    { type:'DATE',    label:'DATE',   className:'date',
      pattern:'(?:19|20)\\d{2}\\s*[—–-]\\s*(?:Present|(?:19|20)\\d{2})|(?:19|20)\\d{2}' },
    { type:'RESULT',  label:'RESULT', className:'result',
      pattern:'\\d+\\s?%\\s*(?:→|->)\\s*\\d+\\s?%|\\d+\\s?%|\\d+\\s?k\\+|\\d+\\+' },
    { type:'TECH',    label:'TECH',   className:'tech',
      pattern:NER_TECH_TERMS.slice().sort(byLenDesc).map(escapeRegExp).join('|') },
    { type:'COMPANY', label:'ORG',    className:'company',
      pattern:NER_COMPANY_TERMS.slice().sort(byLenDesc).map(escapeRegExp).join('|') },
  ];

  function buildNerRegex(){
    return new RegExp(NER_TYPES.map(e => `(?<${e.type}>${e.pattern})`).join('|'), 'g');
  }

  function applyNerToRoot(root){
    const regex = buildNerRegex();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p || p.closest('script, style, svg, .ner-ent, .reel-highlight')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(node => {
      const text = node.nodeValue;
      regex.lastIndex = 0;
      let match, lastIndex = 0, found = false;
      const frag = document.createDocumentFragment();
      while ((match = regex.exec(text))){
        found = true;
        if (match.index > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        const typeKey = Object.keys(match.groups).find(k => match.groups[k] !== undefined);
        const info = NER_TYPES.find(e => e.type === typeKey);
        const mark = document.createElement('mark');
        mark.className = `ner-ent ner-ent--${info.className}`;
        mark.appendChild(document.createTextNode(match[0]));
        const tag = document.createElement('span');
        tag.className = 'ner-ent-tag';
        tag.textContent = info.label;
        mark.appendChild(tag);
        frag.appendChild(mark);
        lastIndex = match.index + match[0].length;
      }
      if (found){
        if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        node.parentNode.replaceChild(frag, node);
      }
    });
  }

  let nerBoardScanned = false;
  function toggleDetectiveSense(){
    if (!nerBoardScanned){
      applyNerToRoot(board);
      nerBoardScanned = true;
    }
    const on = document.body.classList.toggle('detective-mode');
    detectiveSenseBtn.classList.toggle('active', on);
    detectiveSenseBtn.setAttribute('aria-pressed', String(on));
  }

  /* ---- ZOOM ---- */
  function applyTransform(scale, tx, ty){
    board.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  }
  function fitBoard(){
    const vw=viewport.clientWidth, vh=viewport.clientHeight;
    const scale = Math.min(vw/BOARD_W, vh/BOARD_H)*.97;
    applyTransform(scale, (vw-BOARD_W*scale)/2, (vh-BOARD_H*scale)/2);
  }
  /* Experience cluster zooms in on just the top two field reports, then lets
     the user scroll the camera down over the rest of the case file (the
     third report + the closed-case archive) instead of scrolling the page. */
  function setupExperienceZoom(el){
    const full = rectOf(el);
    const topNotes = [document.getElementById('card-exp-1'), document.getElementById('card-exp-2')].filter(Boolean);
    const target = topNotes.length ? unionBoardRect(topNotes) : full;

    const vw=viewport.clientWidth, vh=viewport.clientHeight;
    let scale=Math.min(vw/(target.w+PAD*2), vh/(target.h+PAD*2));
    scale=Math.min(scale, MAX_ZOOM);

    const tx = vw/2 - (full.x+full.w/2)*scale;
    const tyTop    = PAD - target.y*scale;
    const tyBottom = Math.min(tyTop, vh - PAD - (full.y+full.h)*scale);

    applyTransform(scale, tx, tyTop);
    expScrollBounds = { scale, tx, minTy: tyBottom, maxTy: tyTop, currentTy: tyTop };
    pendingWheelTy = null;
  }

  function zoomToCluster(id){
    if (!isDesktop()){
      const el=document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    const el=document.getElementById(id);
    if(!el) return;
    board.style.transition = '';
    expScrollBounds = null;
    pendingWheelTy = null;
    if(id === 'experience'){
      setupExperienceZoom(el);
    } else {
      const r=rectOf(el);
      const vw=viewport.clientWidth, vh=viewport.clientHeight;
      let scale=Math.min(vw/(r.w+PAD*2), vh/(r.h+PAD*2));
      scale=Math.min(scale, MAX_ZOOM);
      const cx=r.x+r.w/2, cy=r.y+r.h/2;
      applyTransform(scale, vw/2-cx*scale, vh/2-cy*scale);
    }
    currentZoom=id;
    document.body.classList.add('zoomed');
    viewport.classList.add('zoomed');
    clusters.forEach(c=>c.classList.toggle('is-active', c.id===id));
    tabs.forEach(t=>t.classList.toggle('active', t.dataset.target===id));
    // Rebuild threads so they recompute positions at new scale
    requestAnimationFrame(() => buildThreads());
  }
  function zoomOut(){
    currentZoom=null;
    expScrollBounds=null;
    board.style.transition = '';
    document.body.classList.remove('zoomed');
    viewport.classList.remove('zoomed');
    clusters.forEach(c=>c.classList.remove('is-active'));
    tabs.forEach(t=>t.classList.remove('active'));
    if(isDesktop()) fitBoard();
    requestAnimationFrame(() => buildThreads());
  }

  /* While zoomed on Experience, the wheel pans the camera down/up over the
     case file instead of scrolling the page. */
  function handleExperienceWheel(e){
    if(!isDesktop() || !expScrollBounds || currentZoom !== 'experience') return;
    if(folderModal.classList.contains('open')) return;
    e.preventDefault();

    const { scale, tx, minTy, maxTy } = expScrollBounds;
    const base = pendingWheelTy ?? expScrollBounds.currentTy;
    pendingWheelTy = Math.max(minTy, Math.min(maxTy, base - e.deltaY));

    if (board.style.transition !== 'none') board.style.transition = 'none';

    // Coalesce rapid wheel events (trackpads can fire far more than 60/s)
    // into a single transform write per animation frame.
    if (wheelRafId === null){
      wheelRafId = requestAnimationFrame(() => {
        expScrollBounds.currentTy = pendingWheelTy;
        applyTransform(scale, tx, pendingWheelTy);
        wheelRafId = null;
      });
    }

    clearTimeout(wheelIdleTimer);
    wheelIdleTimer = setTimeout(() => {
      board.style.transition = '';
      buildThreads();
    }, 120);
  }

  /* ---- FOLDER MODAL ---- */
  function openFolder(card){
    const d = card.dataset;
    fmCase.textContent   = `CASE #${d.case}`;
    fmStatus.textContent = d.status;
    fmStatus.className   = 'folder-modal__status ' + (d.status==='ONGOING' ? 'open' : 'closed');
    fmTitle.textContent  = d.title;
    fmMeta.textContent   = `${d.company} · ${d.period}`;
    fmSummary.textContent = d.summary;
    fmDetails.innerHTML  = [d.detail1, d.detail2, d.detail3, d.detail4]
      .filter(Boolean).map(t=>`<li>${t}</li>`).join('');
    applyNerToRoot(folderBody);
    folderModal.setAttribute('aria-hidden','false');
    folderModal.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeFolder(){
    folderModal.classList.remove('open');
    folderModal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }

  /* ---- EVENT WIRING ---- */
  tabs.forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    zoomToCluster(btn.dataset.target);
  }));
  zoomOutBtn.addEventListener('click', zoomOut);
  replayReelBtn.addEventListener('click', e => { e.stopPropagation(); replayReel(); });
  detectiveSenseBtn.addEventListener('click', e => { e.stopPropagation(); toggleDetectiveSense(); });

  clusters.forEach(cluster => {
    cluster.addEventListener('click', e => {
      if(!isDesktop()) return;
      if(cluster.classList.contains('is-active')) return;
      e.preventDefault();
      zoomToCluster(cluster.id);
    });
  });

  document.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('click', e => {
      if(!card.closest('.cluster').classList.contains('is-active')) return;
      e.stopPropagation();
      openFolder(card);
    });
  });

  folderClose.addEventListener('click', closeFolder);
  folderBackdrop.addEventListener('click', closeFolder);

  viewport.addEventListener('wheel', handleExperienceWheel, { passive:false });

  viewport.addEventListener('click', e => {
    if(!isDesktop() || !currentZoom) return;
    if(folderModal.classList.contains('open')) return;
    if(!e.target.closest('.cluster') && !e.target.closest('.board-btn') && !e.target.closest('.evidence-tabs')){
      zoomOut();
    }
  });

  document.addEventListener('keydown', e => {
    if(e.key==='Escape'){
      if(folderModal.classList.contains('open')){ closeFolder(); return; }
      if(currentZoom) zoomOut();
    }
  });

  // Also rebuild threads after CSS transitions complete
  board.addEventListener('transitionend', () => {
    if (isDesktop()) buildThreads();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(() => {
      syncHeaderHeight();
      layoutClusters();
      if(!isDesktop()){ board.style.transform=''; buildThreads(); return; }
      if(currentZoom) zoomToCluster(currentZoom); else { fitBoard(); buildThreads(); }
    }, 120);
  });

  /* ---- INIT ---- */
  syncHeaderHeight();
  layoutClusters();
  addGradientWrappers();
  addPins();
  if(isDesktop()) fitBoard();
  // Wait for layout + fonts before drawing threads
  requestAnimationFrame(() => requestAnimationFrame(() => {
    buildThreads();
    setTimeout(() => {
      intro && intro.classList.add('hide');
      playIntroReel();
    }, 900);
  }));
})();
