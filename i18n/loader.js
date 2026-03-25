document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    const savedLang = localStorage.getItem('language');
    const defaultLang = 'en';

    let lang = urlLang || savedLang || defaultLang;
    
    // Normalize language codes
    const availableLangs = ['en', 'es', 'fr', 'de', 'hi', 'ja', 'zh-CN', 'ko', 'ru', 'it', 'pt', 'ar', 'tr', 'nl', 'pl', 'vi', 'th', 'id', 'sv', 'cs'];
    if (!availableLangs.includes(lang)) lang = defaultLang;

    localStorage.setItem('language', lang);
    applyLanguage(lang);
    setupLanguageSelector(lang);
});

async function applyLanguage(lang) {
    if (lang === 'en' && !document.querySelector("[data-translated='true']")) {
        // Source is en, the browser will render it naturally.
        return;
    }

    try {
        const response = await fetch(`./i18n/locales/${lang}.json`);
        if (!response.ok) throw new Error("Translation file not found");
        const data = await response.json();
        
        // Update substance label
        if (data.substance_name) {
            const pill = document.querySelector('.substance-pill');
            if (pill) pill.textContent = data.substance_name;
        }

        // Standard replacements for data-i18n
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (data[key]) el.innerHTML = data[key];
        });

        // Update module global DATA
        if (window.initModule) {
            window.initModule(data);
        }

        document.documentElement.lang = lang;
        document.body.setAttribute('data-translated', 'true');

    } catch (err) {
        console.error("Translation load error:", err);
    }
}

function setupLanguageSelector(currentLang) {
    // We check for the selector every few ms because some modules might load it differently
    const interval = setInterval(() => {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = currentLang;
            selector.addEventListener('change', (e) => {
                const lang = e.target.value;
                localStorage.setItem('language', lang);
                // Reload with the new lang param
                const url = new URL(window.location.href);
                url.searchParams.set('lang', lang);
                window.location.href = url.href;
            });
            clearInterval(interval);
        }
    }, 100);
}
