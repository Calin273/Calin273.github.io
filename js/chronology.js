/* ===========================================================
   Opere BAC — Drawer Cronologie (window.Chronology)
   =========================================================== */
(function () {
  "use strict";

  const PERIOADE = [
    { id: "antebelic",   label: "Antebelic",   range: "înainte de 1918", cls: "chrono-era-antebelic",   test: an => an < 1918 },
    { id: "interbelic",  label: "Interbelic",  range: "1918 – 1944",     cls: "chrono-era-interbelic",  test: an => an >= 1918 && an <= 1944 },
    { id: "postbelic",   label: "Postbelic",   range: "după 1944",       cls: "chrono-era-postbelic",   test: an => an > 1944 }
  ];

  function build() {
    const { h, esc } = window.AppUtils;

    // ----- Overlay -----
    const overlay = document.createElement("div");
    overlay.className = "chrono-overlay";

    // ----- Drawer -----
    const drawer = document.createElement("div");
    drawer.className = "chrono-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Cronologie opere");

    // Header
    const header = document.createElement("div");
    header.className = "chrono-header";
    header.innerHTML = `
      <h3>📅 Cronologie</h3>
      <button class="chrono-close" aria-label="Închide cronologia" id="chronoClose">✕</button>`;
    drawer.appendChild(header);

    // Corp
    const body = document.createElement("div");
    body.className = "chrono-body";
    body.id = "chronoBody";
    drawer.appendChild(body);

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // ----- Funcții open/close -----
    function open() {
      renderContent();
      overlay.classList.add("open");
      drawer.classList.add("open");
      document.body.style.overflow = "hidden";
      drawer.querySelector("#chronoClose").focus();
    }

    function close() {
      overlay.classList.remove("open");
      drawer.classList.remove("open");
      document.body.style.overflow = "";
      // Redă focusul butonului trigger dacă există
      const trigger = document.getElementById("chronoTrigger");
      if (trigger) trigger.focus();
    }

    // ----- Randare conținut -----
    function renderContent() {
      const OPERE = window.OPERE || [];
      const sorted = OPERE.slice().sort((a, b) => (a.an || 9999) - (b.an || 9999));
      const TIPURI = window.TIPURI || {};

      body.innerHTML = "";

      PERIOADE.forEach(p => {
        const list = sorted.filter(o => o.an && p.test(o.an));
        if (!list.length) return;

        const group = document.createElement("div");
        group.className = "chrono-group";

        // Titlu grup
        const titleEl = document.createElement("div");
        titleEl.className = "chrono-group-title";
        titleEl.innerHTML = `
          <span class="chrono-era-label ${esc(p.cls)}">${esc(p.label)}</span>
          <span class="chrono-era-range">${esc(p.range)}</span>`;
        group.appendChild(titleEl);

        // Intrări
        list.forEach(o => {
          const tipInfo = TIPURI[o.tip] || { label: o.tip, cls: "" };
          const btn = document.createElement("button");
          btn.className = "chrono-item";
          btn.innerHTML = `
            <span class="chrono-year">${o.an}</span>
            <span class="chrono-line"><span class="chrono-dot"></span></span>
            <span class="chrono-content">
              <div class="chrono-titlu">${esc(o.titlu)}</div>
              <div class="chrono-autor">${esc(o.autor)}</div>
              <div class="chrono-meta">
                <span class="tip-badge ${esc(tipInfo.cls)}">${esc(tipInfo.label)}</span>
                <span>${esc(o.aparitie || "")}</span>
              </div>
            </span>`;
          btn.addEventListener("click", () => {
            close();
            location.hash = "#/opera/" + o.id;
          });
          group.appendChild(btn);
        });

        body.appendChild(group);
      });
    }

    // ----- Evenimente -----
    overlay.addEventListener("click", close);
    drawer.querySelector("#chronoClose").addEventListener("click", close);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && drawer.classList.contains("open")) close();
    });

    return { open };
  }

  // Singleton: construiește drawer-ul o singură dată, la prima deschidere.
  let instance = null;
  function getInstance() {
    if (!instance) instance = build();
    return instance;
  }

  // makeButton — returnează butonul trigger care deschide drawer-ul.
  function makeButton() {
    const btn = document.createElement("button");
    btn.id = "chronoTrigger";
    btn.className = "chrono-btn";
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.innerHTML = "📅 Cronologie";
    btn.addEventListener("click", () => getInstance().open());
    return btn;
  }

  window.Chronology = { makeButton };
})();
