const fs = require('fs');
const path = require('path');

const MODULES = [
    { id: 'alcohol-learn', dir: 'alcohol-learn' },
    { id: 'nic-learn', dir: 'nic-learn' },
    { id: 'opi-learn', dir: 'opi-learn' },
    { id: 'can-learn', dir: 'can-learn' },
    { id: 'stim-learn', dir: 'stim-learn' },
    { id: 'mdma-learn', dir: 'mdma-learn' },
    { id: 'kratom-learn', dir: 'kratom-learn' },
    { id: 'benzo-learn', dir: 'benzo-learn' }
];

const ROOT = path.join(__dirname, '..');

function transform(module) {
    const indexPath = path.join(ROOT, module.dir, 'index.html');
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf8');
    const dataMatch = content.match(/let DATA = (\{[\s\S]*?\});/);
    if (!dataMatch) {
        console.error(`Could not find DATA in ${module.id}`);
        return;
    }
    const dataObj = JSON.parse(dataMatch[1]);

    const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dataObj.substance} Learn - QuitMantra</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --blue: #4F46E5;
            --blue-d: #4338CA;
            --blue-l: #EEF2FF;
            --blue-xl: #F5F3FF;
            --ink: #0F172A;
            --ink-2: #334155;
            --ink-3: #64748B;
            --ink-4: #94A3B8;
            --border: #E2E8F0;
            --bg: #FFFFFF;
            --bg-2: #F8FAFC;
            --bg-3: #F1F5F9;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        
        body {
            font-family: 'DM Sans', system-ui, sans-serif;
            background: var(--bg);
            color: var(--ink);
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
        }

        #main-nav { 
            position: sticky; top: 0; z-index: 100; 
            height: 60px; background: rgba(255,255,255,0.9); 
            backdrop-filter: blur(10px); 
            border-bottom: 1px solid var(--border); 
            display: flex; align-items: center; 
            padding: 0 16px; 
        }

        .nav-left { display: flex; align-items: center; gap: 12px; }
        .nav-logo { font-size: 17px; font-weight: 700; color: var(--ink); letter-spacing: -.4px; cursor: pointer; }
        .nav-logo span { color: var(--blue); }

        .nav-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
        
        .nav-home-link { 
            display: flex; 
            align-items: center; 
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: var(--bg-3);
            color: var(--ink-2); 
            text-decoration: none;
            transition: all 0.2s;
        }
        .nav-home-link:hover { background: var(--blue-l); color: var(--blue); }

        .lang-wrapper { display: flex; align-items: center; }
        .lang-picker {
            appearance: none;
            background: var(--bg-3);
            border: 1px solid var(--border);
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            color: var(--ink-3);
        }

        #view-list { padding-bottom: 56px; }
        .page-wrap { max-width: 540px; margin: 0 auto; }

        .crs-card {
            margin: 24px 16px 22px;
            background: rgba(79, 70, 229, 0.05);
            border: 1px solid rgba(79, 70, 229, 0.1);
            border-radius: 20px;
            padding: 24px 22px;
            color: var(--ink);
        }

        .crs-title {
            font-family: 'DM Serif Display', serif;
            font-size: 22px;
            font-weight: 400;
            line-height: 1.25;
            letter-spacing: -.3px;
        }

        .phases { padding: 0 16px; position: relative; }
        .phase-blk { margin-bottom: 32px; }
        .phase-hd { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .phase-num { font-size: 11px; font-weight: 800; color: var(--blue); background: var(--blue-l); padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: .5px; }
        .phase-txt { font-size: 15px; font-weight: 600; color: var(--ink-2); letter-spacing: -.1px; }

        .lc-col { display: flex; flex-direction: column; gap: 12px; }
        .lc { 
            display: flex; align-items: center; gap: 16px; 
            padding: 16px; border: 1px solid var(--border); 
            border-radius: 16px; cursor: pointer; 
            background: var(--bg); transition: all 0.2s; 
        }
        .lc:hover { transform: scale(1.01); border-color: var(--blue); box-shadow: 0 8px 24px rgba(79,70,229,0.06); }
        .lc-ico { width: 32px; height: 32px; border-radius: 10px; background: var(--bg-2); display: flex; align-items: center; justify-content: center; }
        .lc-title { font-size: 16px; font-weight: 500; color: var(--ink); margin-bottom: 4px; line-height: 1.4; }
        .lc-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-3); font-weight: 400; }
        .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ink-4); }

        /* Article View */
        #view-art { 
            position: fixed; inset: 0; background: var(--bg); z-index: 500; 
            overflow-y: auto; display: none; opacity: 0; 
            transition: opacity 0.3s; 
        }
        #view-art.open { display: block; opacity: 1; }

        .art-bar { 
            position: sticky; top: 0; height: 56px; 
            background: rgba(255,255,255,0.9); 
            backdrop-filter: blur(12px); 
            display: flex; align-items: center; 
            padding: 0 16px; border-bottom: 1px solid var(--border); 
            z-index: 10;
        }
        .back-btn { 
            display: flex; align-items: center; gap: 8px; 
            background: none; border: none; cursor: pointer; 
            color: var(--ink); font-size: 15px; font-weight: 600; 
        }
        .back-btn svg { color: var(--blue); }

        .read-track { position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: var(--bg-3); }
        .read-fill { height: 100%; background: var(--blue); width: 0%; transition: width 0.1s linear; }

        .art-pg { max-width: 600px; margin: 0 auto; padding: 40px 20px 80px; }
        .art-eye { font-size: 12px; font-weight: 800; color: var(--blue); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .art-h1 { font-family: 'DM Serif Display', serif; font-size: 34px; font-weight: 400; line-height: 1.15; letter-spacing: -.5px; margin-bottom: 16px; }
        .art-meta-row { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--ink-3); margin-bottom: 40px; }
        
        .art-body { font-size: 17px; line-height: 1.8; color: var(--ink-2); }
        .art-body h2 { font-family: 'DM Serif Display', serif; font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -.3px; line-height: 1.3; margin: 32px 0 12px; }
        .art-body p { font-size: 16px; line-height: 1.85; color: var(--ink-2); margin-bottom: 15px; }
        .art-body ul { list-style: none; padding: 0; margin: 0 0 16px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .art-body ul li { font-size: 15.5px; line-height: 1.7; color: var(--ink-2); padding: 12px 16px 12px 42px; border-bottom: 1px solid var(--border); position: relative; }
        .art-body ul li::before { content: ''; position: absolute; left: 14px; top: 19px; width: 10px; height: 10px; background: var(--blue); border-radius: 50%; opacity: .45; }

        .quiz-card { text-align: center; padding: 28px 0; }
        .quiz-ico { width: 60px; height: 60px; border-radius: 18px; background: var(--blue-l); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
        .quiz-card h2 { font-family: 'DM Serif Display', serif; font-size: 23px; font-weight: 400; margin-bottom: 10px; }
        .quiz-card p { font-size: 15px; color: var(--ink-3); line-height: 1.7; margin-bottom: 22px; }
        .quiz-card-btn { background: var(--blue); color: white; border: none; border-radius: 12px; padding: 13px 32px; font-size: 15px; font-weight: 600; cursor: pointer; }

        .art-footer { margin-top: 40px; padding-top: 26px; border-top: 1px solid var(--border); }

        @media(max-width:480px){ 
            .crs-card { margin: 14px 12px 20px; } 
            .phases { padding: 0 12px; } 
            .art-pg { padding: 22px 16px 60px; } 
        }
    </style>
</head>
<body>
    <nav id="main-nav">
        <div class="nav-left">
            <a href="../" class="nav-home-link" title="Back to Courses">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </a>
            <div class="nav-logo" onclick="location.href='../'">Quit<span>Mantra</span> <small style="opacity:0.5;font-size:9px;font-weight:400;margin-left:4px">v2.1</small></div>
        </div>
        <div class="nav-right">
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
            </div>
        </div>
    </nav>


    <div id="view-list">
        <div class="page-wrap">
            <div class="crs-card">
                <div class="crs-title" id="crs-title">${dataObj.course}</div>
            </div>
            <div class="phases" id="phases"></div>
        </div>
    </div>

    <div id="view-art" onscroll="trackRead(this)">
        <div class="art-bar">
            <button class="back-btn" onclick="closeArt()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                <span class="back-txt">Back</span>
            </button>
            <div class="read-track">
                <div id="read-fill" class="read-fill"></div>
            </div>
        </div>
        <div class="art-pg">
            <div id="art-eye" class="art-eye">ARTICLE</div>
            <h1 id="art-h1" class="art-h1"></h1>
            <div class="art-meta-row">
                <div id="art-time">5 mins</div>
            </div>
            <div id="art-body" class="art-body"></div>
            <div class="art-footer">
                <div style="font-size: 13px; color: var(--ink-4); text-align: center;">End of Lesson</div>
            </div>
        </div>
    </div>

    <script>
        let DATA = ${JSON.stringify(dataObj, null, 4)};

        function init(data) {
            if (!data) return;
            const list = document.getElementById('phases');
            list.innerHTML = '';
            data.phases.forEach(p => {
                const phase = document.createElement('div');
                phase.className = 'phase-blk';
                phase.innerHTML = \`
                    <div class="phase-hd">
                        <div class="phase-num">\${p.num}</div>
                        <div class="phase-txt">\${p.phase}</div>
                    </div>
                    <div class="lc-col" id="p-\${p.num}"></div>
                \`;
                const col = phase.querySelector('.lc-col');
                p.lessons.forEach(ls => {
                    const item = document.createElement('div');
                    item.className = 'lc';
                    item.innerHTML = \`
                        <div class="lc-ico">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke="#94A3B8" stroke-width="1.2"/></svg>
                        </div>
                        <div class="lc-body">
                            <div class="lc-title">\${ls.title}</div>
                            <div class="lc-meta"><span>\${ls.type}</span><div class="meta-dot"></div><span>\${ls.mins} mins</span></div>
                        </div>
                    \`;
                    item.onclick = () => openArt(ls.id);
                    col.appendChild(item);
                });
                list.appendChild(phase);
            });
        }

        function openArt(id) {
            const ls = DATA.phases.flatMap(p => p.lessons).find(l => l.id === id);
            if (!ls) return;
            if(window.location.hash !== '#article-' + id) {
                window.location.hash = 'article-' + id;
            }
            document.getElementById('art-eye').innerText = ls.type;
            document.getElementById('art-h1').innerText = ls.title;
            document.getElementById('art-time').innerText = ls.mins + ' mins';
            document.getElementById('art-body').innerHTML = ls.content || '<div class="quiz-card"><div class="quiz-ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div><h2>Ready to check your progress?</h2><p>This assessment helps you understand your relationship with ' + DATA.substance + ' and identifies key areas for focus.</p><button class="quiz-card-btn" onclick="closeArt()">Close</button></div>';
            
            document.getElementById('view-art').classList.add('open');
            document.getElementById('view-art').scrollTop = 0;
            document.body.style.overflow = 'hidden';
            document.getElementById('read-fill').style.width = '0%';
        }

        function trackRead(el) {
            const pct = (el.scrollTop / (el.scrollHeight - el.offsetHeight)) * 100;
            const fill = document.getElementById('read-fill');
            if (fill) fill.style.width = pct + '%';
        }

        function closeArt() { 
            if (window.location.hash.startsWith('#article-')) {
                history.back();
            } else {
                _closeView();
            }
        }

        function _closeView() {
            document.body.style.overflow = '';
            document.getElementById('view-art').classList.remove('open'); 
        }

        window.addEventListener('hashchange', function() {
            if (!window.location.hash.startsWith('#article-')) {
                _closeView();
            } else {
                const id = window.location.hash.replace('#article-', '');
                openArt(id);
            }
        });

        window.addEventListener('load', function() {
            if (window.location.hash.startsWith('#article-')) {
                const id = window.location.hash.replace('#article-', '');
                openArt(id);
            }
        });

        // === SELF-CONTAINED i18n ===
        const _LANGS = ['en','es','fr','de','hi','ja','zh-CN','ko','ru','it','pt','ar','tr','nl','pl','vi','th','id','sv','cs'];
        (async function() {
            const params = new URLSearchParams(window.location.search);
            let lang = params.get('lang') || localStorage.getItem('qm_lang') || 'en';
            if (!_LANGS.includes(lang)) lang = 'en';
            localStorage.setItem('qm_lang', lang);

            function setSelector(lang) {
                const sel = document.getElementById('language-selector');
                if (sel) {
                    sel.value = lang;
                    sel.addEventListener('change', function(e) {
                        const newLang = e.target.value;
                        localStorage.setItem('qm_lang', newLang);
                        const u = new URL(window.location.href);
                        u.searchParams.set('lang', newLang);
                        window.location.href = u.href;
                    });
                }
            }

            if (lang !== 'en') {
                try {
                    const origin = window.location.origin;
                    const pathParts = window.location.pathname.split('/');
                    if (pathParts[pathParts.length - 1] === '') pathParts.pop();
                    const moduleBase = pathParts.join('/');
                    const jsonUrl = origin + moduleBase + '/i18n/locales/' + lang + '.json?v=20';

                    const resp = await fetch(jsonUrl);
                    if (!resp.ok) throw new Error('HTTP ' + resp.status + ' for ' + jsonUrl);
                    const t = await resp.json();

                    if (t.DATA) { DATA = t.DATA; }
                    if (t.course_title) {
                        const crsTitle = document.getElementById('crs-title');
                        if (crsTitle) {
                            crsTitle.innerText = t.course_title;
                        }
                    }
                    if (t.btn_back) document.querySelectorAll('.back-txt').forEach(el => el.innerText = t.btn_back);
                    document.documentElement.lang = lang;

                    init(DATA);
                    setSelector(lang);
                    return;
                } catch(e) {
                    console.error('[QM i18n] Translation load failed, using English:', e.message);
                }
            }

            init(DATA);
            setSelector(lang);
        })();
    </script>
</body>
</html>`;

    fs.writeFileSync(indexPath, finalHtml);
    console.log(`Propagated Deep-Link UI to ${module.id}`);
}

MODULES.forEach(transform);
