
let currentLang = 'en';
let translations = {};

const SUPPORTED_LANGS = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'pt', name: 'Português' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'th', name: 'ไทย' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ta', name: 'தமிழ்' }
];

async function initI18n() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.split('-')[0];
    
    let lang = langParam || savedLang || browserLang || 'en';
    if (!SUPPORTED_LANGS.find(l => l.code === lang)) lang = 'en';
    
    await setLanguage(lang);
    createLanguageSelector();
}

async function setLanguage(lang) {
    if (lang === 'en' && Object.keys(translations).length === 0) {
        // Source is usually in the page or en.json
        // To be safe, always try to fetch
    }
    
    try {
        const response = await fetch(`./i18n/locales/${lang}.json`);
        if (!response.ok) throw new Error('Lang not found');
        translations = await response.json();
    } catch (err) {
        console.error('Failed to load language:', lang, err);
        if (lang !== 'en') return setLanguage('en');
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    applyTranslations();
    
    // Dispatch event for components to re-render
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[key];
            } else {
                el.innerHTML = translations[key];
            }
        }
    });
}

function t(key, defaultValue = '') {
    return translations[key] || defaultValue || key;
}

function createLanguageSelector() {
    if (document.getElementById('lang-selector')) return;
    
    const container = document.createElement('div');
    container.id = 'lang-selector';
    container.style.cssText = `
        position: fixed;
        top: 10px;
        right: 20px;
        z-index: 1000;
        font-family: 'DM Sans', sans-serif;
    `;
    
    const select = document.createElement('select');
    select.style.cssText = `
        padding: 5px 10px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: white;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    `;
    
    SUPPORTED_LANGS.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = lang.name;
        opt.selected = lang.code === currentLang;
        select.appendChild(opt);
    });
    
    select.onchange = (e) => setLanguage(e.target.value).then(() => {
        // Reload to ensure all scripts pick up the change if needed
        // Or just re-init the UI
        if (window.buildCourse) window.buildCourse();
        if (window.buildPills) window.buildPills();
    });
    
    container.appendChild(select);
    document.body.appendChild(container);
}

window.t = t;
window.setLanguage = setLanguage;
document.addEventListener('DOMContentLoaded', initI18n);
