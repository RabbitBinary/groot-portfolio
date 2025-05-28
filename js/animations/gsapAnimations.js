// ===============================================================
// KOMPLETNÝ OBSAH PRE: js/animations/gsapAnimations.js
// VERZIA: S AKTÍVNOU ANIMÁCIOU TEXTU V HERO SEKCII
// ===============================================================

// Predpokladáme, že GSAP je dostupný globálne (načítaný cez <script> v HTML)
// Ak používate import, odkomentujte:
// import { gsap } from '../libs/gsap/gsap.min.js'; // Upravte cestu podľa potreby

// --- Animácia pre prvky v Hlavičke (pri načítaní) ---
export function initIntroAnimations() {
  if (typeof gsap === "undefined") {
    console.error("GSAP not loaded! Cannot run intro animations.");
    return;
  }
  const logo = ".logo";
  const navItems = ".main-nav ul li"; // Desktopové menu položky
  const desktopSwitch = ".theme-switch-desktop";
  const mobileSwitchContainer = ".theme-switcher-mobile-container"; // Celý kontajner
  const hamburger = ".hamburger-btn";

  // Časová os pre hlavičku
  const tl = gsap.timeline({
    defaults: { duration: 0.6, ease: "power2.out", opacity: 0 }, // Štart neviditeľné
  });

  // Selektory môžu byť null, ak prvok nie je v DOMe (napr. desktop vs mobil)
  if (document.querySelector(logo)) tl.from(logo, { x: -30 }, 0);
  // Dôležité: overiť, či navItems naozaj existujú pred animáciou
  if (document.querySelectorAll(navItems).length > 0) {
    tl.from(navItems, { y: 20, stagger: 0.1 }, "-=0.3");
  }
  if (document.querySelector(desktopSwitch))
    tl.from(desktopSwitch, { x: 30 }, "-=0.4");
  if (document.querySelector(mobileSwitchContainer))
    tl.from(mobileSwitchContainer, { y: -20 }, "-=0.5");
  if (document.querySelector(hamburger)) tl.from(hamburger, { x: 30 }, "<"); // Začne spolu s mobilným prepínačom

  console.log("GSAP Header intro animations initialized.");
}

// --- Animácia pre Hover Efekt v Menu (len posun) ---
function initNavHoverAnimations() {
  if (typeof gsap === "undefined") return;

  const navLinks = document.querySelectorAll(".main-nav ul li a");
  navLinks.forEach((link) => {
    const hoverTween = gsap.to(link, {
      y: -3, // Jemný posun hore
      duration: 0.2,
      paused: true,
      ease: "power1.inOut",
    });
    link.addEventListener("mouseenter", () => hoverTween.play());
    link.addEventListener("mouseleave", () => hoverTween.reverse());
  });

  // Pre mobilné odkazy (ak chcete nejaký hover efekt)
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-panel ul li a");
  mobileNavLinks.forEach((link) => {
    // Tu môžete pridať inú hover animáciu pre mobil, ak chcete
    // Napr. jemné zväčšenie:
    /*
      const mobileHoverTween = gsap.to(link, {
           scale: 1.05,
           duration: 0.2,
           paused: true,
           ease: 'power1.inOut'
       });
       link.addEventListener('mouseenter', () => mobileHoverTween.play());
       link.addEventListener('mouseleave', () => mobileHoverTween.reverse());
      */
  });

  console.log("GSAP Nav hover animations initialized.");
}

// --- Animácia pre Text v Hero Sekcii ---
function animateHeroContent() {
  if (typeof gsap === "undefined") {
    console.error("GSAP is not defined. Cannot animate hero content.");
    return;
  }

  const heroTitle = "#hero-title";
  const heroSubtitle = "#hero-subtitle";
  const heroCta = ".cta-button"; // Selektor podľa triedy

  // Skontrolujeme, či prvky existujú v HTML
  const titleEl = document.querySelector(heroTitle);
  const subtitleEl = document.querySelector(heroSubtitle);
  const ctaEl = document.querySelector(heroCta); // Môže byť null

  if (!titleEl && !subtitleEl) {
    console.log(
      "Hero content elements (title/subtitle) not found for animation."
    );
    return; // Nič na animovanie
  }
  console.log("Animating hero content..."); // Log pre kontrolu

  // Časová os pre Hero text
  const tl = gsap.timeline({
    delay: 0.6, // Oneskorenie po animácii headeru (upravte podľa potreby)
    defaults: { duration: 0.8, ease: "power3.out" }, // Predvolené hodnoty
  });

  // Animujeme prvky, len ak existujú
  // Animácia Z počiatočného stavu (opacity: 0, y: 30px - definované v CSS)
  // DO finálneho stavu (opacity: 1, y: 0)
  if (titleEl) {
    tl.to(titleEl, { opacity: 1, y: 0 }, 0); // Začne na začiatku tejto timeline
  }
  if (subtitleEl) {
    tl.to(heroSubtitle, { opacity: 1, y: 0 }, "-=0.6"); // S miernym presahom nad titulkom
  }
  if (ctaEl) {
    // Ak existuje tlačidlo
    tl.to(heroCta, { opacity: 1, y: 0 }, "-=0.7"); // O niečo skôr ako podtitulok
  }

  console.log("GSAP Hero Content animation timeline created.");
}

// --- Funkcia pre Aktívny Link (ak ju používate) ---
// Ak nerobíte one-page, túto funkciu nepotrebujete a jej volanie v main.js by malo byť zakomentované
/*
export function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const navLinksDesktop = document.querySelectorAll('.main-nav ul li a');
  const navLinksMobile = document.querySelectorAll('.mobile-nav-panel ul li a');
  const allNavLinks = [...navLinksDesktop, ...navLinksMobile];
  console.log("Highlighting active link for path:", currentPath);

  allNavLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return; // Preskočiť, ak chýba href

      // Jednoduché porovnanie pre multi-page
       // Odstráni úvodné a koncové '/' a '.html'
      const cleanCurrentPath = currentPath.replace(/^\/|\/$/g, '').replace(/\.html$/, '');
      const cleanLinkPath = linkPath.replace(/^\/|\/$/g, '').replace(/\.html$/, '');

      // Špeciálne pre index
      const isCurrentIndex = (cleanCurrentPath === '' || cleanCurrentPath === 'index');
      const isLinkIndex = (cleanLinkPath === '' || cleanLinkPath === 'index');

      if ((isCurrentIndex && isLinkIndex) || (cleanLinkPath !== '' && cleanLinkPath !== 'index' && cleanCurrentPath === cleanLinkPath)) {
          link.classList.add('active');
          console.log(`Activating link: ${linkPath}`);
      } else {
          link.classList.remove('active');
      }
  });
}
*/

// --- Hlavná Exportovaná Funkcia na Inicializáciu Všetkých GSAP Animácií ---
export function initGsap() {
  console.log("Initializing GSAP animations...");
  initIntroAnimations(); // Animácia headeru
  initNavHoverAnimations(); // Hover efekty menu
  animateHeroContent(); // <<< ANIMÁCIA HERO TEXTU JE AKTÍVNA
  // highlightActiveLink(); // <<< ODKOMENTUJTE, LEN AK POUŽÍVATE PRE MULTI-PAGE
  console.log("GSAP Initialization complete.");
}

// ===============================================================
// KONIEC OBSAHU PRE: js/animations/gsapAnimations.js
// ===============================================================
