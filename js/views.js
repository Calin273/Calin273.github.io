/* ===========================================================
   Opere BAC — pagini/randare (window.Views)
   acasa · opere · opera · quizPicker · flashPicker · notFound
   =========================================================== */
(function () {
  "use strict";

  function viewAcasa() {
    const { h } = window.AppUtils;
    const { badge, operaCard } = window.Components;
    const OPERE = window.OPERE || [];
    const Store = window.Store;

    const total = OPERE.length;
    const totalIntrebari = OPERE.reduce((s, o) => s + (o.quiz ? o.quiz.length : 0), 0);
    const totalCarduri = OPERE.reduce((s, o) => s + (o.flashcards ? o.flashcards.length : 0), 0);
    const date = Store.quizzedCount();

    return h(`<div class="view">
      <section class="hero">
        <h1>Învață operele de <span class="grad">BAC</span><br/>fără stres.</h1>
        <p>Toate analizele tale, transformate într-un loc curat: citește, dă quiz-uri grilă cu explicații și repetă cu flashcard-uri.</p>
        <div class="hero-cta">
          <a class="btn primary" href="#/opere">📖 Vezi operele</a>
          <a class="btn" href="#/quiz">✅ Începe un quiz</a>
          <a class="btn ghost" href="#/flashcards">🎴 Flashcards</a>
        </div>
        <div class="stats container" style="max-width:760px">
          <div class="stat"><div class="num accent">${total}</div><div class="lbl">opere</div></div>
          <div class="stat"><div class="num">${totalIntrebari}</div><div class="lbl">întrebări quiz</div></div>
          <div class="stat"><div class="num">${totalCarduri}</div><div class="lbl">flashcards</div></div>
          <div class="stat"><div class="num">${date}/${total}</div><div class="lbl">quiz-uri date</div></div>
        </div>
      </section>
      <section class="section">
        <div class="section-head"><h2>Operele tale</h2><span class="hint">apasă pe oricare ca să începi</span></div>
        <div class="grid">${OPERE.map(operaCard).join("")}</div>
      </section>
    </div>`);
  }

  function viewOpere() {
    const { h } = window.AppUtils;
    const { operaCard } = window.Components;
    const OPERE = window.OPERE || [];

    const wrap = h(`<div class="view section">
      <div class="section-head">
        <h2>Toate operele</h2>
        <span class="hint" id="count"></span>
        <span id="chronoBtnSlot"></span>
      </div>
      <div class="toolbar">
        <label class="search">🔎<input id="q" type="text" placeholder="Caută după titlu sau autor..." autocomplete="off"/></label>
        <div class="chips" id="chips">
          <button class="chip active" data-f="toate">Toate</button>
          <button class="chip" data-f="poezie">Poezie</button>
          <button class="chip" data-f="proza">Proză</button>
          <button class="chip" data-f="dramaturgie">Dramaturgie</button>
        </div>
      </div>
      <div class="grid" id="grid"></div>
    </div>`);

    // Inserează butonul de cronologie dacă modulul e disponibil.
    if (window.Chronology) {
      wrap.querySelector("#chronoBtnSlot").appendChild(window.Chronology.makeButton());
    }

    let filt = "toate", term = "";
    const grid = wrap.querySelector("#grid");
    const count = wrap.querySelector("#count");
    function render() {
      const list = OPERE.filter(o =>
        (filt === "toate" || o.tip === filt) &&
        (o.titlu.toLowerCase().includes(term) || o.autor.toLowerCase().includes(term)));
      grid.innerHTML = list.length ? list.map(operaCard).join("") : `<div class="empty">Nimic găsit. 🤔</div>`;
      count.textContent = list.length + " din " + OPERE.length;
    }
    wrap.querySelector("#q").addEventListener("input", e => { term = e.target.value.toLowerCase().trim(); render(); });
    wrap.querySelector("#chips").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      wrap.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      b.classList.add("active"); filt = b.dataset.f; render();
    });
    render();
    return wrap;
  }

  function viewOpera(id) {
    const { h, esc, byId } = window.AppUtils;
    const { badge } = window.Components;
    const Store = window.Store;

    const o = byId(id);
    if (!o) return notFound();
    const paras = (o.analiza || []).map(p => `<p>${esc(p)}</p>`).join("");
    const q = Store.getQuiz(o.id);
    return h(`<div class="view opera-page">
      <a class="back-link" href="#/opere">← Înapoi la opere</a>
      <div class="opera-head">
        ${badge(o.tip)}
        <h1>${esc(o.titlu)}</h1>
        <div class="autor">${esc(o.autor)} · <span class="pill">${esc(o.curent || o.tip)}</span></div>
      </div>
      <div class="opera-actions">
        <a class="btn primary" href="#/quiz/${o.id}">✅ Quiz pe această operă ${q ? "· record " + q.best + "/" + q.total : ""}</a>
        <a class="btn" href="#/flashcards/${o.id}">🎴 Flashcards (${o.flashcards ? o.flashcards.length : 0})</a>
      </div>
      <article class="analiza">${paras || "<p>(analiză indisponibilă)</p>"}</article>
    </div>`);
  }

  function viewQuizPicker() {
    const { h } = window.AppUtils;
    const { pickerGrid } = window.Components;
    return h(`<div class="view section">
      <div class="section-head"><h2>Quiz grilă</h2><span class="hint">alege o operă (sau mixt) — explicații după fiecare răspuns</span></div>
      <div class="picker-grid">${pickerGrid("quiz", true)}</div>
    </div>`);
  }

  function viewFlashPicker() {
    const { h } = window.AppUtils;
    const { pickerGrid } = window.Components;
    return h(`<div class="view section">
      <div class="section-head"><h2>Flashcards</h2><span class="hint">concepte cheie — apasă pe card ca să-l întorci</span></div>
      <div class="picker-grid">${pickerGrid("flashcards", false)}</div>
    </div>`);
  }

  function notFound() {
    const { h } = window.AppUtils;
    return h(`<div class="view empty"><h2>Hopa, n-am găsit pagina 🤷</h2><p><a class="btn" href="#/acasa">Acasă</a></p></div>`);
  }

  window.Views = {
    acasa: viewAcasa,
    opere: viewOpere,
    opera: viewOpera,
    quizPicker: viewQuizPicker,
    flashPicker: viewFlashPicker,
    notFound: notFound
  };
})();
