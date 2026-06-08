/* Registrul global de opere. Fiecare fișier din data/ face window.OPERE.push({...}). */
window.OPERE = [];

/* Etichete pentru tipul operei (folosite la badge-uri și filtre). */
window.TIPURI = {
  poezie:       { label: "Poezie",      cls: "tip-poezie" },
  proza:        { label: "Proză",       cls: "tip-proza" },
  dramaturgie:  { label: "Dramaturgie", cls: "tip-dramaturgie" }
};
