/* ===========================================================
   Opere BAC — router pe hash + temă + bootstrap
   (se încarcă ultimul; leagă Views/Quiz/Flashcards)
   =========================================================== */
(function () {
  "use strict";

  const app = document.getElementById("app");

  /* ---------- Router ---------- */
  function setActive(route) {
    document.querySelectorAll("#navLinks a").forEach(a =>
      a.classList.toggle("active", a.dataset.route === route));
  }

  function router() {
    const Views = window.Views;
    const hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/").filter(Boolean);
    const route = parts[0] || "acasa";
    let node, navRoute = route;

    switch (route) {
      case "acasa":      node = Views.acasa(); break;
      case "opere":      node = Views.opere(); break;
      case "opera":      node = Views.opera(parts[1]); navRoute = "opere"; break;
      case "quiz":
        if (parts[1]) { node = window.Quiz.run(parts[1]); }
        else { node = Views.quizPicker(); }
        break;
      case "flashcards":
        if (parts[1]) { node = window.Flashcards.run(parts[1]); }
        else { node = Views.flashPicker(); }
        break;
      default: node = Views.notFound();
    }
    setActive(navRoute);
    app.innerHTML = "";
    app.appendChild(node || Views.notFound());
    window.scrollTo(0, 0);
  }

  /* ---------- Temă (light / dark) ---------- */
  function setupTheme() {
    const btn = document.getElementById("themeToggle");
    function sync() {
      const light = document.documentElement.getAttribute("data-theme") === "light";
      if (btn) { btn.textContent = light ? "☀️" : "🌙"; btn.setAttribute("aria-label", light ? "Treci pe mod întunecat" : "Treci pe mod luminos"); }
    }
    if (btn) btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("opereBAC.theme", next); } catch (e) {}
      sync();
    });
    sync();
  }

  /* ---------- Bootstrap ---------- */
  setupTheme();
  window.addEventListener("hashchange", router);
  window.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) location.hash = "#/acasa";
    router();
  });
  // dacă DOM deja gata (scripturile sunt la final de body)
  if (document.readyState !== "loading") {
    if (!location.hash) location.hash = "#/acasa";
    router();
  }
})();
