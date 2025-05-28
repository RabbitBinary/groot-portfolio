const themeCheckboxMobile = document.getElementById("theme-checkbox");
const themeCheckboxDesktop = document.getElementById("theme-checkbox-desktop");
const body = document.body;

// Funkcia na aplikáciu témy
function applyTheme(theme, isInitialLoad = false) {
  body.dataset.theme = theme;
  // Synchronizujeme oba checkboxy, len ak nejde o prvotné načítanie spôsobené zmenou
  if (!isInitialLoad) {
    if (themeCheckboxMobile) themeCheckboxMobile.checked = theme === "light";
    if (themeCheckboxDesktop) themeCheckboxDesktop.checked = theme === "light";
  }
  localStorage.setItem("portfolioTheme", theme);
}

// Funkcia na inicializáciu
export function initThemeToggle() {
  if (!themeCheckboxMobile || !themeCheckboxDesktop) {
    console.warn("One or both theme checkboxes not found!");
    // Pokračujeme, ak aspoň jeden existuje (napr. len mobilné zobrazenie)
  }

  // Načítanie uloženej témy
  const savedTheme = localStorage.getItem("portfolioTheme") || "dark"; // Default dark

  // Nastavíme správny stav checkboxov pri načítaní
  if (themeCheckboxMobile) themeCheckboxMobile.checked = savedTheme === "light";
  if (themeCheckboxDesktop)
    themeCheckboxDesktop.checked = savedTheme === "light";

  // Aplikujeme tému (vizuálne)
  applyTheme(savedTheme, true); // true znamená, že je to prvotné načítanie

  // Listener pre mobilný checkbox
  if (themeCheckboxMobile) {
    themeCheckboxMobile.addEventListener("change", (event) => {
      const newTheme = event.target.checked ? "light" : "dark";
      applyTheme(newTheme);
    });
  }

  // Listener pre desktopový checkbox
  if (themeCheckboxDesktop) {
    themeCheckboxDesktop.addEventListener("change", (event) => {
      const newTheme = event.target.checked ? "light" : "dark";
      applyTheme(newTheme);
    });
  }
}
