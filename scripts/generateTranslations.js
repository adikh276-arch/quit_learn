const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.TRANSLATE_API_KEY;
const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn', 'stim-learn', 'mdma-learn', 'kratom-learn'
];
const LANGUAGES = [
    'en', 'es', 'fr', 'de', 'hi', 'ja', 'zh-CN', 'ko', 'ru', 'it', 
    'pt', 'ar', 'tr', 'nl', 'pl', 'vi', 'th', 'id', 'sv', 'cs'
];

const STATIC_STRINGS = {
    'Learn Module': 'app_title',
    'Progress': 'progress_label',
    'Back': 'back_label',
    'min': 'minutes_label',
    'Article': 'type_article',
    'Assessment': 'type_assessment',
    'Activity': 'type_activity'
};

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function translateBulk(uniqueTexts, targetLang) {
    if (targetLang === 'en') return uniqueTexts.reduce((acc, t) => { acc[t] = t; return acc; }, {});
    const cache = {};
    const BATCH_SIZE = 50; 

    for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
        const batch = uniqueTexts.slice(i, i + BATCH_SIZE);
        try {
            const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({ q: batch, target: targetLang, format: 'html' }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            data.data.translations.forEach((t, idx) => {
                cache[batch[idx]] = t.translatedText;
            });
            // Small delay between batches to avoid rate limit
            await sleep(500);
        } catch (err) {
            console.error(`Bulk translate to ${targetLang} failed:`, err.message);
            // Wait longer if we hit rate limit
            if (err.message.includes('Rate Limit')) {
                await sleep(5000);
                i -= BATCH_SIZE; // Retry this batch
            } else {
                batch.forEach(t => cache[t] = t);
            }
        }
    }
    return cache;
}

function extractDataFromHtml(html) {
    const match = html.match(/const DATA = (\{[\s\S]*?\});/);
    if (!match) return null;
    try {
        const fn = new Function('return ' + match[1]);
        return fn();
    } catch (e) { return null; }
}

function extractSubstanceName(html) {
    const match = html.match(/<div class="substance-pill">(.*?)<\/div>/);
    return match ? match[1] : 'Module';
}

async function run() {
    console.log("Starting bulk translation generation for 20 languages with rate-limit handling...");
    
    const moduleMap = {};
    let allRawStrings = Object.keys(STATIC_STRINGS);

    for (const m of MODULES) {
        const indexPath = path.join(__dirname, '..', m, 'index.html');
        if (!fs.existsSync(indexPath)) continue;
        const html = fs.readFileSync(indexPath, 'utf8');
        const data = extractDataFromHtml(html);
        const name = extractSubstanceName(html);
        if (!data) continue;

        moduleMap[m] = { data, name };
        allRawStrings.push(name);
        data.sections.forEach(s => {
            allRawStrings.push(s.title);
            s.articles.forEach(a => {
                allRawStrings.push(a.title);
                allRawStrings.push(a.content);
                allRawStrings.push(a.type);
            });
        });
    }

    const uniqueStrings = [...new Set(allRawStrings.filter(t => t))];

    for (const lang of LANGUAGES) {
        console.log(`Translating all modules to: ${lang}...`);
        const langMap = await translateBulk(uniqueStrings, lang);
        
        for (const m in moduleMap) {
            const substanceName = langMap[moduleMap[m].name];
            const newData = JSON.parse(JSON.stringify(moduleMap[m].data));
            for (const section of newData.sections) {
                section.title = langMap[section.title];
                for (const article of section.articles) {
                    article.title = langMap[article.title];
                    article.content = langMap[article.content];
                    article.type = langMap[article.type];
                }
            }

            const output = {};
            for (const sourceText in STATIC_STRINGS) {
                output[STATIC_STRINGS[sourceText]] = langMap[sourceText];
            }
            output['substance_name'] = substanceName;
            output['DATA'] = newData;

            const localesPath = path.join(__dirname, '..', m, 'i18n', 'locales');
            if (!fs.existsSync(localesPath)) fs.mkdirSync(localesPath, { recursive: true });
            fs.writeFileSync(path.join(localesPath, `${lang}.json`), JSON.stringify(output, null, 2));
        }
        await sleep(200); // Small sleep between languages
    }
    console.log("Bulk translation complete!");
}

run();
