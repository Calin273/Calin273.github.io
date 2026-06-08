/* ===========================================================
   Opere BAC — utilitare DOM/text (window.AppUtils)
   =========================================================== */
(function () {
  "use strict";

  // Construiește un element din HTML.
  function h(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // Escape pentru text inserat în HTML.
  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // Găsește o operă după id în registrul global.
  function byId(id) { return (window.OPERE || []).find(o => o.id === id); }

  window.AppUtils = { h, esc, byId };
})();
