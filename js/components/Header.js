import { closeMenu } from './Navigation.js'; // Importujeme funkciu na zatvorenie

const header = document.getElementById('main-header');
let lastScrollTop = 0;

function handleScroll() {
    if (!header) return;
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > header.offsetHeight) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

    // Zatvorenie mobilného menu pri skrolovaní
    const nav = document.getElementById('main-nav');
    if (nav?.classList.contains('active')) {
        closeMenu(); // Použijeme importovanú funkciu
    }
}

export function initHeaderScroll() {
    if (!header) {
        console.error("Header element not found for scroll handling!");
        return;
    }
    window.addEventListener('scroll', handleScroll, false);
}