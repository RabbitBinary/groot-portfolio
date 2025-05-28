import { initThemeToggle } from './components/ThemeToggle.js';
import { initHeaderScroll } from './components/Header.js';
import { initMobileMenu, highlightActiveLink } from './components/Navigation.js';
import { initGsap } from './animations/gsapAnimations.js';
import { setupHeroAnimation } from './animations/heroAnimations.js';
import { initProjectPopup } from './components/ProjectPopup.js';
import { initTabs } from './components/Tabs.js';
import { initContactForm } from './components/ContactForm.js';

// Spustí sa po načítaní celého DOMu
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed"); // Kontrolný výpis
    initThemeToggle();
    initHeaderScroll();
    initMobileMenu();
    initGsap();
    highlightActiveLink();
    setupHeroAnimation();
    initTabs();
    initProjectPopup();
    initContactForm();
    console.log("Modules initialized"); // Kontrolný výpis
});