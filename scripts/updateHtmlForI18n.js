const fs = require('fs');
const path = require('path');

const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn', 'stim-learn', 'mdma-learn', 'kratom-learn'
];

function updateHtml(module) {
    const indexPath = path.join(__dirname, '..', module, 'index.html');
    if (!fs.existsSync(indexPath)) return;
    let html = fs.readFileSync(indexPath, 'utf8');

    // Add Styles
    const styles = `
        .lang-wrapper {
            position: absolute;
            top: 24px;
            right: 0px;
            z-index: 100;
        }
        .lang-picker {
            appearance: none;
            background: #F0F0F0;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            color: #666;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .lang-picker:hover { background: #E5E5E5; }
    `;
    if (!html.includes('.lang-picker')) {
        html = html.replace('</style>', styles + '\n    </style>');
    }

    // Add UI components
    const langPicker = `
            <div class="lang-wrapper">
                <select id="language-selector" class="lang-picker">
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                    <option value="de">DE</option>
                    <option value="hi">HI</option>
                    <option value="ja">JA</option>
                    <option value="zh-CN">ZH</option>
                    <option value="ko">KO</option>
                    <option value="ru">RU</option>
                    <option value="it">IT</option>
                    <option value="pt">PT</option>
                    <option value="ar">AR</option>
                    <option value="tr">TR</option>
                    <option value="nl">NL</option>
                    <option value="pl">PL</option>
                    <option value="vi">VI</option>
                    <option value="th">TH</option>
                    <option value="id">ID</option>
                    <option value="sv">SV</option>
                    <option value="cs">CS</option>
                </select>
            </div>`;
    
    if (!html.includes('id="language-selector"')) {
       html = html.replace('<div class="top-module">', '<div class="top-module">' + langPicker);
    }

    // Tag substance pill
    html = html.replace('<div class="substance-pill">', '<div class="substance-pill" data-i18n="substance_name">');

    // Add Loader and modify init logic
    if (!html.includes('/i18n/loader.js')) {
        html = html.replace('</head>', '    <script src="/i18n/loader.js" defer></script>\n</head>');
    }

    if (!html.includes('window.initModule')) {
        html = html.replace('const DATA = {', 'let DATA = {');
        
        // Find end of renderList
        const renderListEndIdx = html.indexOf('listEl.innerHTML = html;', html.indexOf('function renderList()'));
        if (renderListEndIdx !== -1) {
             // Already has it? No.
        }

        html = html.replace('init();', `
        window.initModule = (t) => {
            if (t.DATA) DATA = t.DATA;
            if (t.substance_name) document.querySelector('.substance-pill').textContent = t.substance_name;
            renderList();
            updateProgress();
        };

        const currentLang = localStorage.getItem('language') || 'en';
        if (currentLang === 'en') {
           init();
        }
        `);
    }

    fs.writeFileSync(indexPath, html);
    console.log(`Updated ${module}.`);
}

MODULES.forEach(updateHtml);
console.log("All modules updated for i18n.");
