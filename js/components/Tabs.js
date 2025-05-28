// js/components/Tabs.js

export function initTabs() {
    const tabsNav = document.querySelector('.tabs-nav');
    if (!tabsNav) {
        // Ak na stránke nie sú záložky, nerobíme nič
        // console.log("Tabs navigation not found, skipping initialization.");
        return;
    }

    const tabLinks = tabsNav.querySelectorAll('.tab-link');
    const tabPanes = document.querySelectorAll('.tabs-content .tab-pane');

    if (tabLinks.length === 0 || tabPanes.length === 0) {
        console.warn("Tab links or panes not found inside tabs navigation/content.");
        return;
    }

    tabsNav.addEventListener('click', (event) => {
        const clickedTab = event.target.closest('.tab-link'); // Nájde tlačidlo, aj keď sa klikne na vnútorný element

        if (!clickedTab) return; // Kliknuté mimo tlačidla

        event.preventDefault(); // Zabráni prípadnému defaultnému správaniu tlačidla

        const targetTabId = clickedTab.dataset.tab; // Získa ID cieľového obsahu (napr. "tab-webapps")
        const targetPane = document.getElementById(targetTabId);

        if (!targetPane) {
            console.error(`Target tab pane with ID "${targetTabId}" not found.`);
            return;
        }

        // 1. Deaktivujeme všetky linky a panely
        tabLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-selected', 'false');
            link.setAttribute('tabindex', '-1'); // Odstránime z poradia tabulátora
        });
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            // pane.setAttribute('hidden', ''); // Alternatíva k display:none
        });

        // 2. Aktivujeme kliknutý link a cieľový panel
        clickedTab.classList.add('active');
        clickedTab.setAttribute('aria-selected', 'true');
        clickedTab.setAttribute('tabindex', '0'); // Pridáme do poradia tabulátora

        targetPane.classList.add('active');
        // targetPane.removeAttribute('hidden');

        console.log(`Tab activated: ${targetTabId}`);
    });

    // Nastavenie počiatočného tabindexu pre prístupnosť
    tabLinks.forEach((link, index) => {
         if (!link.classList.contains('active')) {
              link.setAttribute('tabindex', '-1');
         } else {
              link.setAttribute('tabindex', '0');
         }
    });

     // Pridanie ovládania klávesnicou (šípky)
     tabsNav.addEventListener('keydown', (e) => {
        const currentTab = document.activeElement;
        if (!currentTab || !currentTab.classList.contains('tab-link')) return;

        let newTab;
        if (e.key === 'ArrowRight') {
            newTab = currentTab.nextElementSibling;
            if (!newTab) newTab = tabsNav.firstElementChild; // Skočí na začiatok
        } else if (e.key === 'ArrowLeft') {
             newTab = currentTab.previousElementSibling;
             if (!newTab) newTab = tabsNav.lastElementChild; // Skočí na koniec
        }

        if (newTab && newTab.classList.contains('tab-link')) {
            e.preventDefault(); // Zabráni skrolovaniu stránky
            newTab.focus(); // Presunie focus
            // Voliteľne môžeme hneď aj prepnúť tab:
            // newTab.click();
        }
    });


    console.log("Tabs functionality initialized.");
}