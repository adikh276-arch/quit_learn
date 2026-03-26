const fs = require('fs');
const path = require('path');

const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn',
    'stim-learn', 'mdma-learn', 'kratom-learn', 'benzo-learn'
];

const sharedLoader = path.join(__dirname, '..', 'i18n', 'loader.js');

MODULES.forEach(mod => {
    const modDir = path.join(__dirname, '..', mod);
    if (!fs.existsSync(modDir)) return;

    const i18nDir = path.join(modDir, 'i18n');
    if (!fs.existsSync(i18nDir)) fs.mkdirSync(i18nDir);

    // Copy loader
    fs.copyFileSync(sharedLoader, path.join(i18nDir, 'loader.js'));

    // Update index.html to use LOCAL path instead of absolute /i18n/
    const indexPath = path.join(modDir, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.replace('src="/i18n/loader.js"', 'src="./i18n/loader.js"');
    fs.writeFileSync(indexPath, html);

    console.log(`Made ${mod} fully independent.`);
});
