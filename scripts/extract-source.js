const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const subsMatch = html.match(/const SUBS=([\s\S]*?);/);
const currMatch = html.match(/const CURR=([\s\S]*?);/);
const articlesMatch = html.match(/const ARTICLES = ({[\s\S]*?});/);

const SUBS = eval(subsMatch[1]);
const CURR = eval(currMatch[1]);
const ARTICLES = eval(`(${articlesMatch[1]})`);

const en = {
    "navbar_quiz": "Quiz",
    "navbar_learn": "Learn",
    "toast_lesson_completed": "Lesson completed!",
    "crs_completed": "Completed ",
    "crs_lessons": " lessons",
    "btn_continue": "Continue",
    "btn_back": "Back",
    "art_min_read": " min read",
    "btn_mark_complete": "Mark as Complete",
    "btn_completed": "Completed",
    "fb_q": "Was this lesson helpful?",
    "fb_yes": "Yes",
    "fb_no": "No",
    "fb_thanks": "Thank you for your feedback!",
    "quiz_title": "How Addicted Am I?",
    "quiz_desc_prefix": "Take the DSM-5 Clinical Self-Assessment for ",
    "quiz_desc_suffix": ". 11 questions, about 2 minutes.",
    "quiz_btn": "Take the Assessment",
    "subs": SUBS,
    "curr": CURR,
    "articles": ARTICLES
};

fs.writeFileSync('i18n/locales/en.json', JSON.stringify(en, null, 2));
console.log('en.json generated');
