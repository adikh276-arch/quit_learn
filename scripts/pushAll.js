const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn',
    'stim-learn', 'mdma-learn', 'kratom-learn', 'benzo-learn'
];

const ROOT = path.join(__dirname, '..');

MODULES.forEach(mod => {
    const modPath = path.join(ROOT, mod);
    if (!fs.existsSync(modPath)) return;

    console.log(`\n--- Pushing ${mod} ---`);
    try {
        // Change dir, add, commit, push
        // We use absolute paths to Avoid 'cd' issues
        execSync('git add .', { cwd: modPath });
        try {
            execSync('git commit -m "Restore Premium UI and fix i18n hooks"', { cwd: modPath });
        } catch (e) {
            console.log(`No changes to commit for ${mod}`);
            return;
        }
        execSync('git push origin main', { cwd: modPath });
        console.log(`Successfully pushed ${mod}`);
    } catch (err) {
        console.error(`Failed to push ${mod}: ${err.message}`);
    }
});
