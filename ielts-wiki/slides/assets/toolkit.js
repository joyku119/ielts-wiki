(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;

  const chapterPill = document.getElementById('chapterPill');
  const progressFill = document.getElementById('progressFill');
  const pageCounter = document.getElementById('pageCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const tocOverlay = document.getElementById('tocOverlay');
  const tocList = document.getElementById('tocList');
  const hintBtn = document.getElementById('hintBtn');
  const hintPopover = document.getElementById('hintPopover');

  const canvas = document.getElementById('drawCanvas');
  const ctx = canvas.getContext('2d');
  const laserDot = document.getElementById('laserDot');
  const selectionBubble = document.getElementById('selectionBubble');
  const cambridgeLink = document.getElementById('cambridgeLink');
  const cambridgeWord = document.getElementById('cambridgeWord');

  const modeCursorBtn = document.getElementById('modeCursor');
  const modeLaserBtn = document.getElementById('modeLaser');
  const modePenBtn = document.getElementById('modePen');
  const clearAllBtn = document.getElementById('clearAllBtn');

  let toolMode = 'cursor';
  let isDrawing = false;
  let savedRange = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function clearAnnotations() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelectorAll('mark.hl-mark').forEach((m) => {
      const parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
  }

  function setMode(mode) {
    toolMode = mode;
    [modeCursorBtn, modeLaserBtn, modePenBtn].forEach((b) => b.classList.remove('active'));
    canvas.classList.remove('drawing-mode');
    laserDot.style.display = 'none';
    hideBubble();

    if (mode === 'cursor') modeCursorBtn.classList.add('active');
    if (mode === 'laser') {
      modeLaserBtn.classList.add('active');
      laserDot.style.display = 'block';
    }
    if (mode === 'pen') {
      modePenBtn.classList.add('active');
      canvas.classList.add('drawing-mode');
    }
  }

  modeCursorBtn.addEventListener('click', () => setMode('cursor'));
  modeLaserBtn.addEventListener('click', () => setMode('laser'));
  modePenBtn.addEventListener('click', () => setMode('pen'));
  clearAllBtn.addEventListener('click', clearAnnotations);

  if (hintBtn && hintPopover) {
    hintBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hintPopover.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!hintPopover.contains(e.target) && e.target !== hintBtn) {
        hintPopover.classList.remove('open');
      }
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (toolMode === 'laser') {
      laserDot.style.left = e.clientX + 'px';
      laserDot.style.top = e.clientY + 'px';
    }
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (toolMode !== 'pen') return;
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    ctx.strokeStyle = '#002FA7';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing || toolMode !== 'pen') return;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  });

  window.addEventListener('pointerup', () => { isDrawing = false; });

  function hideBubble() {
    selectionBubble.style.display = 'none';
    savedRange = null;
  }

  document.addEventListener('mouseup', (e) => {
    if (toolMode !== 'cursor') return;
    if (selectionBubble.contains(e.target)) return;

    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        hideBubble();
        return;
      }
      const activeSlide = slides[current];
      if (!activeSlide.contains(sel.anchorNode)) {
        hideBubble();
        return;
      }

      const text = sel.toString().trim();
      savedRange = sel.getRangeAt(0).cloneRange();
      const rect = savedRange.getBoundingClientRect();

      const match = text.match(/[A-Za-z]+(?:-[A-Za-z]+)*/);
      if (match) {
        const word = match[0].toLowerCase();
        cambridgeWord.textContent = word;
        cambridgeLink.href = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`;
        cambridgeLink.style.display = 'inline-flex';
      } else {
        cambridgeLink.style.display = 'none';
      }

      const leftPos = Math.min(Math.max(rect.left + rect.width / 2, 130), window.innerWidth - 130);
      const topPos = Math.max(rect.top, 76);
      selectionBubble.style.left = `${leftPos}px`;
      selectionBubble.style.top = `${topPos}px`;
      selectionBubble.style.display = 'flex';
    }, 10);
  });

  document.querySelectorAll('.hl-swatch').forEach((btn) => {
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => {
      if (!savedRange) return;
      const cls = btn.dataset.hl;
      try {
        const mark = document.createElement('mark');
        mark.className = `hl-mark ${cls}`;
        savedRange.surroundContents(mark);
      } catch (err) {
        const frag = savedRange.extractContents();
        const mark = document.createElement('mark');
        mark.className = `hl-mark ${cls}`;
        mark.appendChild(frag);
        savedRange.insertNode(mark);
      }
      window.getSelection().removeAllRanges();
      hideBubble();
    });
  });

  function pad(n) { return String(n).padStart(2, '0'); }

  function buildToc() {
    tocList.innerHTML = '';
    slides.forEach((s, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toc-item' + (idx === current ? ' current' : '');
      btn.innerHTML = `<span class="toc-num">${pad(idx + 1)}</span><span class="toc-title">${s.dataset.title}</span>`;
      btn.addEventListener('click', () => { goToSlide(idx); closeToc(); });
      tocList.appendChild(btn);
    });
  }

  window.goToSlide = function(index) {
    if (index < 0 || index >= total) return;
    clearAnnotations();
    hideBubble();
    slides[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    slides[current].scrollTop = 0;

    const s = slides[current];
    chapterPill.textContent = s.dataset.ch;
    pageCounter.textContent = `${pad(current + 1)} / ${pad(total)}`;
    progressFill.style.width = `${((current + 1) / total) * 100}%`;

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    history.replaceState(null, '', `#s=${current + 1}`);
    buildToc();
  };

  function openToc() { tocOverlay.classList.add('open'); tocOverlay.setAttribute('aria-hidden', 'false'); }
  function closeToc() { tocOverlay.classList.remove('open'); tocOverlay.setAttribute('aria-hidden', 'true'); }

  prevBtn.addEventListener('click', () => window.goToSlide(current - 1));
  nextBtn.addEventListener('click', () => window.goToSlide(current + 1));
  document.getElementById('tocBtn').addEventListener('click', openToc);
  document.getElementById('closeTocBtn').addEventListener('click', closeToc);
  tocOverlay.addEventListener('click', (e) => { if (e.target === tocOverlay) closeToc(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') window.goToSlide(current + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') window.goToSlide(current - 1);
    if (e.key === 'Escape') { closeToc(); hideBubble(); if (hintPopover) hintPopover.classList.remove('open'); }
  });

  function initFromHash() {
    const m = window.location.hash.match(/s=(\d+)/);
    const target = m ? Math.max(0, Math.min(total - 1, parseInt(m[1], 10) - 1)) : 0;
    window.goToSlide(target);
  }
  window.addEventListener('hashchange', initFromHash);
  initFromHash();
})();
