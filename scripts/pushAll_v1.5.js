const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn',
    'stim-learn', 'mdma-learn', 'kratom-learn', 'benzo-learn'
];

const ROOT = path.join(__dirname, '..');

function push(dir, msg) {
    if (!fs.existsSync(dir)) return;
    const gitDir = path.join(dir, '.git');
    if (!fs.existsSync(gitDir)) {
        console.warn(`Skipping ${dir}: No .git folder found.`);
        return;
    }

    console.log(`\n--- Processing ${path.basename(dir)} ---`);
    try {
        execSync('git add .', { cwd: dir });
        try {
            execSync(`git commit -m "${msg}"`, { cwd: dir });
        } catch (e) {
            console.log(`No changes to commit for ${path.basename(dir)}`);
        }
        execSync('git push origin main', { cwd: dir });
        console.log(`Successfully pushed ${path.basename(dir)}`);
    } catch (err) {
        console.error(`Failed to push ${path.basename(dir)}: ${err.message}`);
    }
}

// Push all modules
MODULES.forEach(mod => {
    push(path.join(ROOT, mod), "Simplified UI: removed progress tracking, completion buttons and feedback forms. Triggering v1.5 build.");
});

// Push root
push(ROOT, "Update root Docker tag to 1.5 and push substance module changes.");
