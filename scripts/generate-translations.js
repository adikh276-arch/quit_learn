require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.TRANSLATE_API_KEY;
const SOURCE_FILE = path.join(__dirname, '../i18n/locales/en.json');
const LOCALES_DIR = path.join(__dirname, '../i18n/locales');

const SUPPORTED_LANGS = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' }
];

if (!API_KEY) {
  console.error('Error: TRANSLATE_API_KEY not found in .env');
  process.exit(1);
}

async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string' || text.trim() === '' || !isNaN(text)) return text;
  
  // Skip if it looks like a key or already translated (very basic check)
  // Also preserve [S] placeholder
  
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'html' // Use html to preserve tags and placeholders better
      })
    });
    const data = await res.json();
    if (data.error) {
      console.error(`API Error (${targetLang}):`, data.error.message);
      return text;
    }
    return data.data.translations[0].translatedText;
  } catch (err) {
    console.error(`Fetch Error (${targetLang}):`, err.message);
    return text;
  }
}

async function translateObject(obj, targetLang) {
  const result = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang);
    } else if (typeof value === 'string') {
      // Don't translate slugs or IDs
      if (key === 'slug' || key === 'id' || key === 'num' || key === 'type') {
        result[key] = value;
      } else {
        console.log(`Translating [${targetLang}] ${key}...`);
        result[key] = await translateText(value, targetLang);
        // Throttle slightly to avoid rate limits if needed
        await new Promise(r => setTimeout(r, 50));
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function main() {
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));

  for (const lang of SUPPORTED_LANGS) {
    const targetFile = path.join(LOCALES_DIR, `${lang.code}.json`);
    if (fs.existsSync(targetFile)) {
      console.log(`Skipping ${lang.name} (${lang.code}), file already exists.`);
      continue;
    }

    console.log(`\n--- Generating ${lang.name} (${lang.code}) ---`);
    const translatedData = await translateObject(sourceData, lang.code);
    fs.writeFileSync(targetFile, JSON.stringify(translatedData, null, 2), 'utf8');
    console.log(`Saved ${targetFile}`);
  }
  console.log('\nAll translations completed!');
}

main().catch(console.error);
