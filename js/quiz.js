/* ===========================================================
   Motorul de quiz grilă
   =========================================================== */
(function () {
  "use strict";

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Pregătește o întrebare cu variante amestecate, recalculând indexul corect.
  function prep(q) {
    const opts = q.variante.map((t, i) => ({ t, correct: i === q.corect }));
    const mixed = shuffle(opts);
    return {
      intrebare: q.intrebare,
      variante: mixed.map(o => o.t),
      corect: mixed.findIndex(o => o.correct),
      explicatie: q.explicatie || "",
      _src: q._src || null
    };
  }

  /* ---------- Normalizare afișaj opțiuni ----------
     Elimină paranteziace și trunchează opțiunile lungi
     în faza de întrebare, pentru a nu trăda prin lungime
     răspunsul corect. Textul complet se afișează după alegere.
  ------------------------------------------------- */
  function normalizeOption(text) {
    // Elimină conținut din paranteze: "X (detaliu)" → "X"
    let t = text.replace(/\s*\([^)]+\)/g, '').trim();
    // Taie după punct-virgulă dacă e lung
    if (t.length > 65) {
      const semi = t.indexOf(';');
      if (semi > 20) t = t.substring(0, semi).trim();
    }
    // Taie după ultimul „/" sau „—" urmat de text explicativ dacă e lung
    if (t.length > 65) {
      const slash = t.lastIndexOf(' / ', 65);
      if (slash > 25) t = t.substring(0, slash).trim();
    }
    // Taie după ultima virgulă dacă e încă lung
    if (t.length > 65) {
      const lastComma = t.lastIndexOf(',', 65);
      if (lastComma > 25) t = t.substring(0, lastComma).trim();
    }
    // Dacă tot e lung, trunchează dur
    if (t.length > 70) t = t.substring(0, 68).trimEnd() + '…';
    return t;
  }

  function run(target) {
    const { h, esc, byId } = window.AppUtils;
    const Store = window.Store;
    let titlu, questions, operaId = null;
    if (target === "mix") {
      titlu = "Quiz mixt 🎲";
      const all = [];
      (window.OPERE || []).forEach(o => (o.quiz || []).forEach(q => all.push({ ...q, _src: o.titlu })));
      questions = shuffle(all).slice(0, 20).map(prep);
    } else {
      const o = byId(target);
      if (!o || !o.quiz || !o.quiz.length)
        return h(`<div class="view empty"><h2>Nu există întrebări pentru asta 🤔</h2><a class="btn" href="#/quiz">← Alege altă operă</a></div>`);
      operaId = o.id; titlu = o.titlu;
      questions = shuffle(o.quiz).map(prep);
    }

    const total = questions.length;
    let idx = 0, score = 0, answered = false;

    const root = h(`<div class="view quiz-wrap">
      <a class="back-link" href="#/quiz">← Toate quiz-urile</a>
      <div class="quiz-top"><strong>${esc(titlu)}</strong><span id="qScore">Scor: 0</span></div>
      <div class="progress-bar"><i id="qBar"></i></div>
      <div id="qBody"></div>
    </div>`);

    const body = root.querySelector("#qBody");
    const bar = root.querySelector("#qBar");
    const scoreEl = root.querySelector("#qScore");

    function renderQuestion() {
      answered = false;
      const q = questions[idx];
      bar.style.width = (idx / total * 100) + "%";
      scoreEl.textContent = "Scor: " + score;

      // Construiește opțiunile ca elemente DOM pentru a stoca textul complet
      const card = h(`<div class="view">
        <div class="q-num">ÎNTREBAREA ${idx + 1} / ${total}</div>
        ${q._src ? `<div class="q-src">📖 ${esc(q._src)}</div>` : ""}
        <div class="q-text">${esc(q.intrebare)}</div>
        <div class="options" id="opts"></div>
        <div class="explica" id="exp"></div>
        <div class="quiz-nav"><button class="btn primary" id="next" disabled>Continuă →</button></div>
      </div>`);

      const optsEl = card.querySelector("#opts");
      q.variante.forEach((t, i) => {
        const btn = document.createElement("button");
        btn.className = "opt";
        btn.dataset.i = i;
        const key = String.fromCharCode(65 + i);
        // Afișează versiunea normalizată; atribut data-full stochează textul complet
        btn.innerHTML = `<span class="key">${key}</span><span class="opt-txt">${esc(normalizeOption(t))}</span>`;
        btn.dataset.full = t;
        optsEl.appendChild(btn);
      });

      body.innerHTML = "";
      body.appendChild(card);

      const optEls = Array.from(card.querySelectorAll(".opt"));
      const exp = card.querySelector("#exp");
      const next = card.querySelector("#next");

      optEls.forEach(btn => btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const chosen = +btn.dataset.i;
        const correct = q.corect;

        optEls.forEach((b, i) => {
          b.classList.add("locked");
          // Reveleaza textul complet al fiecarei optiuni dupa alegere
          const txtEl = b.querySelector(".opt-txt");
          if (txtEl) txtEl.textContent = b.dataset.full;
          if (i === correct) b.classList.add("correct");
          else if (i === chosen) b.classList.add("wrong");
          else b.classList.add("dim");
        });

        if (chosen === correct) score++;
        scoreEl.textContent = "Scor: " + score;
        if (q.explicatie) {
          exp.innerHTML = `<b>${chosen === correct ? "Corect! ✅" : "Explicație:"}</b> ${esc(q.explicatie)}`;
          exp.classList.add("show");
        }
        next.disabled = false;
        next.focus();
      }));

      next.addEventListener("click", () => {
        idx++;
        if (idx < total) renderQuestion();
        else renderResult();
      });
    }

    function renderResult() {
      bar.style.width = "100%";
      const pct = Math.round(score / total * 100);
      if (operaId) Store.quizResult(operaId, score, total);
      let msg;
      if (pct === 100) msg = "Perfect! Ești pregătit. 🏆";
      else if (pct >= 80) msg = "Foarte bine! Aproape stăpân pe ea. 💪";
      else if (pct >= 50) msg = "Bun început — mai repetă analiza și flashcard-urile. 📖";
      else msg = "Recitește analiza și încearcă din nou. Reușești! 🙂";

      const retryHref = operaId ? `#/quiz/${operaId}` : "#/quiz/mix";
      const res = h(`<div class="view result">
        <div class="ring" style="--p:${pct}%"><div class="inner"><div class="pct">${pct}%</div></div></div>
        <h2>${score} din ${total} corecte</h2>
        <div class="msg">${msg}</div>
        <div class="actions">
          <a class="btn primary" href="${retryHref}">🔁 Mai încearcă o dată</a>
          <a class="btn" href="#/quiz">Altă operă</a>
          <a class="btn ghost" href="#/acasa">Acasă</a>
        </div>
      </div>`);
      res.querySelector(".btn.primary").addEventListener("click", e => {
        e.preventDefault();
        idx = 0; score = 0;
        questions = shuffle(questions);
        renderQuestion();
      });
      body.innerHTML = "";
      body.appendChild(res);
    }

    renderQuestion();
    return root;
  }

  window.Quiz = { run };
})();
