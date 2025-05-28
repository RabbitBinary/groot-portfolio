// js/components/ContactForm.js

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');

    if (!form || !statusDiv) {
        // console.log("Contact form or status div not found.");
        return; // Ak formulár na stránke nie je, nerobíme nič
    }

    async function handleSubmit(event) {
        event.preventDefault(); // Zastavíme predvolené odoslanie formulára
        statusDiv.style.display = 'block'; // Zobrazíme status
        statusDiv.className = 'form-status sending'; // Odstránime staré triedy, pridáme 'sending'
        statusDiv.textContent = 'Odosielam správu...';

        const formData = new FormData(event.target);

        try {
            const response = await fetch(event.target.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json' // Formspree takto vráti JSON odpoveď
                }
            });

            if (response.ok) {
                // Úspešne odoslané
                statusDiv.className = 'form-status success';
                statusDiv.textContent = 'Ďakujeme! Vaša správa bola úspešne odoslaná.';
                form.reset(); // Vymaže formulár
                // Môžeme skryť status po chvíli
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                    statusDiv.textContent = '';
                    statusDiv.className = 'form-status';
                }, 5000); // Skryje po 5 sekundách
            } else {
                // Chyba pri odosielaní (napr. problém na strane Formspree)
                response.json().then(data => {
                     statusDiv.className = 'form-status error';
                    if (data.errors && data.errors.length > 0) {
                        // Skúsime zobraziť konkrétnejšiu chybu od Formspree
                         statusDiv.textContent = "Chyba: " + data.errors.map(error => error.message).join(', ');
                    } else {
                        statusDiv.textContent = 'Nastala chyba pri odosielaní správy. Skúste to prosím znova.';
                    }
                }).catch(() => {
                    // Ak sa nepodarí získať JSON odpoveď
                     statusDiv.className = 'form-status error';
                     statusDiv.textContent = 'Nastala chyba pri odosielaní správy. Skúste to prosím znova.';
                });
            }
        } catch (error) {
            // Chyba siete alebo iná neočakávaná chyba
             statusDiv.className = 'form-status error';
            statusDiv.textContent = 'Nastala chyba v sieti. Skontrolujte pripojenie a skúste to znova.';
            console.error('Form submission error:', error);
        }
    }

    form.addEventListener("submit", handleSubmit);
    console.log("Contact form AJAX handling initialized.");
}