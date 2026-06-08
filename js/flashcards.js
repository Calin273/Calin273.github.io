/* ===========================================================
   Motorul de flashcards
   =========================================================== */
(function () {
  "use strict";

  function run(id) {
    const { h, esc, byId } = window.AppUtils;
    const Store = window.Store;
    const o = byId(id);
    if (!o || !o.flashcards || !o.flashcards.length)
      return h(`<div class="view empty"><h2>Nu există flashcards aici 🤔</h2><a class="btn" href="#/flashcards">← Alege altă operă</a></div>`);

    const cards = o.flashcards;
    const total = cards.length;
    let idx = 0;

    const root = h(`<div class="view fc-wrap">
      <a class="back-link" href="#/flashcards">← Toate flashcard-urile</a>
      <div class="fc-top">
        <strong>${esc(o.titlu)}</strong>
        <span id="fcPos"></span>
      </div>
      <div class="progress-bar"><i id="fcBar"></i></div>
      <div id="fcStage"></div>
    </div>`);

    const stage = root.querySelector("#fcStage");
    const pos = root.querySelector("#fcPos");
    const bar = root.querySelector("#fcBar");

    function statusOf(i) { return Store.getCards(o.id)[i]; }
    function knownCount() { const s = Store.getCards(o.id); return Object.values(s).filter(v => v === "known").length; }

    function render() {
      const c = cards[idx];
      const st = statusOf(idx);
      bar.style.width = ((idx + 1) / total * 100) + "%";
      pos.innerHTML = `${idx + 1} / ${total} · <span style="color:var(--good)">${knownCount()} știute</span>`;

      const stamp = st === "known" ? `<div class="pill" style="color:var(--good)">✓ știu</div>`
        : st === "again" ? `<div class="pill" style="color:var(--warn)">↻ de repetat</div>` : "";

      const node = h(`<div class="view">
        <div class="flashcard" id="card">
          <div class="inner">
            <div class="fc-face fc-front">
              <div class="tag">concept · ${esc(o.titlu)}</div>
              <div class="term">${esc(c.fata)}</div>
              ${stamp}
              <div class="flip-hint">apasă pentru explicație 👆</div>
            </div>
            <div class="fc-face fc-back">
              <div class="tag">explicație</div>
              <div class="def">${esc(c.spate)}</div>
            </div>
          </div>
        </div>
        <div class="fc-controls">
          <button class="btn icon-btn" id="prev" title="Înapoi">←</button>
          <button class="btn again" id="again">↻ Repet</button>
          <button class="btn know" id="know">✓ Știu</button>
          <button class="btn icon-btn" id="next" title="Următor">→</button>
        </div>
      </div>`);

      stage.innerHTML = "";
      stage.appendChild(node);

      const card = node.querySelector("#card");
      card.addEventListener("click", () => card.classList.toggle("flipped"));

      node.querySelector("#prev").addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
      node.querySelector("#next").addEventListener("click", () => advance());
      node.querySelector("#know").addEventListener("click", () => { Store.setCard(o.id, idx, "known"); advance(); });
      node.querySelector("#again").addEventListener("click", () => { Store.setCard(o.id, idx, "again"); advance(); });
    }

    function advance() {
      if (idx < total - 1) { idx++; render(); }
      else renderDone();
    }

    function renderDone() {
      bar.style.width = "100%";
      const known = knownCount();
      stage.innerHTML = "";
      stage.appendChild(h(`<div class="view result">
        <div class="ring" style="--p:${Math.round(known / total * 100)}%"><div class="inner"><div class="pct">${known}/${total}</div></div></div>
        <h2>Gata pachetul! 🎴</h2>
        <div class="msg">${known === total ? "Le știi pe toate. Imbatabil! 🏆" : "Reia-le pe cele marcate „de repetat”."}</div>
        <div class="actions">
          <button class="btn primary" id="restart">🔁 De la capăt</button>
          <a class="btn" href="#/quiz/${o.id}">✅ Dă quiz pe asta</a>
          <a class="btn ghost" href="#/flashcards">Altă operă</a>
        </div>
      </div>`));
      stage.querySelector("#restart").addEventListener("click", () => { idx = 0; render(); });
    }

    render();
    return root;
  }

  window.Flashcards = { run };
})();
