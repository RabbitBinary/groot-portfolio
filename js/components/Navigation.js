const hamburgerBtn = document.getElementById("hamburger-btn");
const mobileNavPanel = document.getElementById("mobile-nav-panel");
const hamburgerIconEl = hamburgerBtn?.querySelector(".icon-hamburger"); // Selektor pre hamburger ikonu
const closeIconEl = hamburgerBtn?.querySelector(".icon-close"); // Selektor pre close ikonu

// === GSAP Timeline pre animáciu ikon ===
// Vytvoríme timeline mimo funkcií, aby bola dostupná pre obe (toggle/close)
let iconTl = null; // Inicializujeme ako null

function createIconTimeline() {
  if (!hamburgerIconEl || !closeIconEl) return null;

  const tl = gsap.timeline({
    paused: true, // Začína pozastavená
    defaults: { duration: 0.3, ease: "power2.inOut" }, // Predvolené nastavenia
  });

  // Definícia animácie PRECHODU Z Hamburgeru NA Close (X)
  tl.to(hamburgerIconEl, { rotate: 90, opacity: 0, scale: 0.6 }, 0) // Otočí, zmenší a skryje hamburger (čas 0)
    .to(closeIconEl, { rotate: 0, opacity: 1, scale: 1 }, 0); // Súčasne otočí (späť), zväčší a odkryje close (čas 0)

  return tl;
}

// Funkcia na prepnutie menu (OTVORENIE / ZATVORENIE)
function toggleMenu() {
  if (!mobileNavPanel) return; // Kontrola

  // Získame alebo vytvoríme timeline pri prvom volaní
  if (!iconTl) {
    iconTl = createIconTimeline();
    if (!iconTl) {
      // Ak sa nepodarilo vytvoriť (elementy chýbajú)
      console.error("Could not create icon animation timeline.");
      mobileNavPanel.classList.toggle("active"); // Urobíme aspoň základné prepnutie panelu
      return;
    }
  }

  const isActive = mobileNavPanel.classList.contains("active");

  if (!isActive) {
    // Menu sa OTVÁRA
    mobileNavPanel.classList.add("active");
    iconTl.play(); // Prehrať animáciu dopredu (hamburger -> close)
  } else {
    // Menu sa ZATVÁRA
    mobileNavPanel.classList.remove("active");
    iconTl.reverse(); // Prehrať animáciu dozadu (close -> hamburger)
  }
}

// Funkcia na explicitné ZATVORENIE menu (napr. po kliknutí na odkaz)
export function closeMenu() {
  if (!mobileNavPanel) return;

  // Získame timeline (ak ešte neexistuje, hoci by už mala po prvom otvorení)
  if (!iconTl) {
    iconTl = createIconTimeline();
  }

  mobileNavPanel.classList.remove("active");
  iconTl?.reverse(); // Vždy prehráme animáciu dozadu pri zatváraní
}

// Inicializácia (zostáva rovnaká)
export function initMobileMenu() {
  if (!hamburgerBtn || !mobileNavPanel) {
    console.error("Hamburger button or mobile nav panel not found!");
    return;
  }

  const navLinks = mobileNavPanel.querySelectorAll("a");

  hamburgerBtn.addEventListener("click", toggleMenu);

  if (navLinks && navLinks.length > 0) {
    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }
}

export function highlightActiveLink() {
  const currentPath = window.location.pathname; // Získa cestu aktuálnej URL (napr. "/projekty.html" alebo "/")
  const navLinksDesktop = document.querySelectorAll(".main-nav ul li a");
  const navLinksMobile = document.querySelectorAll(".mobile-nav-panel ul li a");
  const allNavLinks = [...navLinksDesktop, ...navLinksMobile]; // Spojíme oba zoznamy

  console.log("Current Path:", currentPath); // Pomocný výpis pre debug

  allNavLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");

    // Odstránime prípadné úvodné '/' z oboch ciest pre konzistentné porovnanie
    // A tiež odstránime prípadný '.html', ak ho používate len niekde
    const cleanCurrentPath = currentPath.replace(/^\/|\.html$/g, ""); // Odstráni '/' na začiatku a '.html' na konci
    const cleanLinkPath = linkPath?.replace(/^\/|\.html$/g, ""); // Otáznik pre prípad, že href chýba

    // Špeciálny prípad pre domovskú stránku (index.html alebo len "/")
    // Ak sme na "/" a link je tiež "/", alebo ak je linkPath "index.html" a sme na "/"
    const isHomePage =
      cleanCurrentPath === "" &&
      (cleanLinkPath === "" || cleanLinkPath === "index");
    const isLinkHomePage = cleanLinkPath === "" || cleanLinkPath === "index";

    console.log(
      `Comparing: cleanCurrentPath='${cleanCurrentPath}', cleanLinkPath='${cleanLinkPath}', isHomePage=${isHomePage}, isLinkHomePage=${isLinkHomePage}`
    );

    link.classList.remove("active"); // Najprv odstránime triedu zo všetkých

    if (isHomePage && isLinkHomePage) {
      link.classList.add("active");
    } else if (
      cleanLinkPath !== "" &&
      cleanLinkPath !== "index" &&
      cleanCurrentPath === cleanLinkPath
    ) {
      // Ak cesty (bez index/prázdnych) presne zodpovedajú
      link.classList.add("active");
    }
  });
  console.log("Active link highlighting attempted.");
}
