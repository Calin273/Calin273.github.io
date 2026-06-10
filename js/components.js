/* ===========================================================
   Opere BAC — componente UI reutilizabile (window.Components)
   badge · operaCard · pickerGrid
   =========================================================== */
(function () {
  "use strict";

  // Badge pentru tipul operei (poezie/proză/dramaturgie).
  function badge(tip) {
    const t = (window.TIPURI || {})[tip] || { label: tip, cls: "" };
    return `<span class="tip-badge ${t.cls}">${t.label}</span>`;
  }

  // Cardul unei opere din grilă (Acasă / Opere).
  function operaCard(o) {
    const { esc } = window.AppUtils;
    const q = window.Store.getQuiz(o.id);
    const done = q ? "quizzed" : "";
    const star = o.bacProb ? `<span class="bac-star" title="Șanse mari să pice la BAC">★</span>` : "";
    return `
      <a class="opera-card ${done}" href="#/opera/${o.id}">
        <span class="done-dot" title="Quiz dat: ${q ? q.best + "/" + q.total : ""}">✓</span>
        ${star}
        ${badge(o.tip)}
        <h3>${esc(o.titlu)}</h3>
        <div class="autor">${esc(o.autor)}</div>
        <div class="curent">${esc(o.curent || "")}</div>
      </a>`;
  }

  // Grila de selectare a operei pentru quiz/flashcards (cu opțiunea „mixt” pentru quiz).
  function pickerGrid(routePrefix, withMix) {
    const { esc } = window.AppUtils;
    const cards = (window.OPERE || []).map(o => `
      <a class="pick" href="#/${routePrefix}/${o.id}">
        ${badge(o.tip)}
        <h4>${esc(o.titlu)}</h4>
        <div class="autor">${esc(o.autor)}</div>
        <div class="meta">${routePrefix === "quiz" ? (o.quiz ? o.quiz.length + " întrebări" : "") : (o.flashcards ? o.flashcards.length + " carduri" : "")}</div>
      </a>`).join("");
    const mix = withMix ? `
      <a class="pick mix" href="#/quiz/mix">
        <span class="tip-badge" style="background:rgba(255,255,255,.2);color:#fff">MIXT</span>
        <h4>Quiz mixt 🎲</h4>
        <div class="autor">întrebări din toate operele</div>
        <div class="meta">20 de întrebări la întâmplare</div>
      </a>` : "";
    return mix + cards;
  }

  window.Components = { badge, operaCard, pickerGrid };
})();
