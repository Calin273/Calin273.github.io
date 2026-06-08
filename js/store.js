/* ===========================================================
   Opere BAC — stare persistentă în localStorage (window.Store)
   quiz: id -> {best, total}   |   fc: id -> { idx: "known"|"again" }
   =========================================================== */
(function () {
  "use strict";

  const Store = {
    key: "opereBAC.v1",
    data: null,
    load() {
      if (this.data) return this.data;
      try { this.data = JSON.parse(localStorage.getItem(this.key)) || {}; }
      catch (e) { this.data = {}; }
      if (!this.data.quiz) this.data.quiz = {};   // id -> {best, total}
      if (!this.data.fc) this.data.fc = {};       // id -> { "0": "known"|"again", ... }
      return this.data;
    },
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {} },
    quizResult(id, correct, total) {
      const d = this.load();
      const prev = d.quiz[id];
      if (!prev || correct / total >= prev.best / prev.total) d.quiz[id] = { best: correct, total };
      this.save();
    },
    getQuiz(id) { return this.load().quiz[id] || null; },
    setCard(id, idx, status) { const d = this.load(); (d.fc[id] = d.fc[id] || {})[idx] = status; this.save(); },
    getCards(id) { return this.load().fc[id] || {}; },
    quizzedCount() { return Object.keys(this.load().quiz).length; }
  };

  window.Store = Store;
})();
