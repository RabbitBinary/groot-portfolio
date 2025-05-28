const popupOverlay = document.getElementById("project-popup");
const popupContent = popupOverlay?.querySelector(".popup-content");
const popupCloseBtn = document.getElementById("popup-close-btn");
const popupImage = document.getElementById("popup-image");
const popupTitle = document.getElementById("popup-title");
// const popupDescription = document.getElementById('popup-description'); // <<< Starý selektor pre <p>
const popupDescriptionContainer = document.getElementById(
  "popup-description-container"
); // <<< NOVÝ selektor pre <div>
const techStackContainer = popupOverlay?.querySelector(".popup-tech-stack");
const liveLink = document.getElementById("popup-live-link");
const codeLink = document.getElementById("popup-code-link");
const projectCards = document.querySelectorAll(".project-card");

// --- Dáta projektov (UŽ NEPOTREBUJEME) ---
// const projectData = { ... }; // <<< ODSTRÁNENÉ / ZAKOMENTOVANÉ

function openPopup(cardElement) {
  // <<< Funkcia teraz prijíma element karty
  // Získanie dát z data-* atribútov kliknutej karty
  const title = cardElement.dataset.title || "Neznámy projekt";
  const imageSrc = cardElement.dataset.imageDetail || ""; // Detailný obrázok
  const techString = cardElement.dataset.tech || "";
  const liveUrl = cardElement.dataset.liveUrl || "";
  const codeUrl = cardElement.dataset.codeUrl || "";

  // Získanie detailného popisu zo skrytého elementu
  const fullDescriptionElement = cardElement.querySelector(
    ".project-full-description"
  );
  const descriptionHtml = fullDescriptionElement
    ? fullDescriptionElement.innerHTML
    : "<p>Popis nie je k dispozícii.</p>";

  // Kontrola existencie popup elementov
  if (
    !popupImage ||
    !popupTitle ||
    !popupDescriptionContainer ||
    !techStackContainer ||
    !liveLink ||
    !codeLink ||
    !popupOverlay
  ) {
    console.error("Missing popup elements.");
    return;
  }

  // Nastavenie základných info
  popupImage.src = imageSrc;
  popupImage.alt = `Detail projektu ${title}`;
  popupTitle.textContent = title;

  // Nastavenie detailného popisu (ako HTML)
  popupDescriptionContainer.innerHTML = descriptionHtml; // <<< Vložíme HTML obsah

  // === Naplnenie Technologického Stacku z data-tech ===
  techStackContainer.innerHTML = ""; // Vymažeme predchádzajúci obsah
  if (techString) {
    const technologies = techString
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech); // Rozdelí string podľa čiarky
    if (technologies.length > 0) {
      technologies.forEach((techName) => {
        const techElement = document.createElement("span");
        techElement.classList.add("tech-item");
        // Tu potrebujeme spôsob, ako priradiť ikonu k názvu
        // Môžeme použiť jednoduchý switch alebo objekt na mapovanie
        let iconHtml = getTechIcon(techName); // <<< Zavoláme pomocnú funkciu

        techElement.innerHTML = `
                    ${iconHtml}
                    <span class="tech-name">${techName}</span>
                `;
        techStackContainer.appendChild(techElement);
      });
      techStackContainer.style.display = "flex";
    } else {
      techStackContainer.style.display = "none";
    }
  } else {
    techStackContainer.style.display = "none";
  }
  // ==================================================

  // === Nastavenie Odkazov ===
  const linksContainer = liveLink.parentElement; // Získame rodiča odkazov
  let hasLinks = false;
  if (liveUrl) {
    liveLink.href = liveUrl;
    liveLink.style.display = "inline-flex";
    hasLinks = true;
  } else {
    liveLink.style.display = "none";
    liveLink.href = "#";
  }
  if (codeUrl) {
    codeLink.href = codeUrl;
    codeLink.style.display = "inline-flex";
    hasLinks = true;
  } else {
    codeLink.style.display = "none";
  }
  // Zobrazíme/skryjeme kontajner odkazov
  linksContainer.style.display = hasLinks ? "flex" : "none";
  // =========================

  popupOverlay.classList.add("active");
  popupOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  popupCloseBtn?.focus();
}

// --- Pomocná funkcia na získanie ikony (prispôsobte si) ---
function getTechIcon(techName) {
  const nameLower = techName.toLowerCase();
  // Jednoduché mapovanie názvu na SVG súbor alebo Font Awesome triedu
  // Toto si musíte prispôsobiť podľa vašich ikon!
  const iconMap = {
    "three.js": "assets/images/threejs.svg", // Alebo 'fab fa-html5'
    vite: "assets/images/vite.svg", // Alebo 'fab fa-css3-alt'
    "gemini ai": "assets/images/gemini.svg", // Alebo 'fab fa-js-square'
  };

  const iconPathOrClass = iconMap[nameLower];

  if (iconPathOrClass && iconPathOrClass.endsWith(".svg")) {
    return `<img src="${iconPathOrClass}" class="tech-icon" alt="${techName} logo" loading="lazy" decoding="async">`;
  } else if (iconPathOrClass && iconPathOrClass.startsWith("fa")) {
    return `<i class="${iconPathOrClass} tech-icon"></i>`; // Ak by ste chceli kombinovať
  } else {
    return '<i class="fas fa-code tech-icon"></i>'; // Všeobecná ikona, ak sa nenájde
  }
}
// -----------------------------------------------------------

// Funkcia closePopup zostáva rovnaká
function closePopup() {
  if (!popupOverlay) return;
  popupOverlay.classList.remove("active");
  popupOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Funkcia initProjectPopup - UPRAVENÁ pre získavanie dát
export function initProjectPopup() {
  if (!popupOverlay || !popupCloseBtn || projectCards.length === 0) {
    console.warn(
      "Project popup elements not found or no project cards present."
    );
    return;
  }

  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      openPopup(card); // <<< Posielame celý element karty
    });
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPopup(card); // <<< Posielame celý element karty
      }
    });
  });

  popupCloseBtn.addEventListener("click", closePopup);
  popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
      closePopup();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popupOverlay.classList.contains("active")) {
      closePopup();
    }
  });

  console.log("Project popup initialized (data from HTML).");
}
