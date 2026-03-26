const fs = require('fs');
const path = require('path');

const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn',
    'stim-learn', 'mdma-learn', 'kratom-learn', 'benzo-learn'
];

const NEW_TAG = '1.1'; // Update this for new versions

const ROOT = path.join(__dirname, '..');

MODULES.forEach(mod => {
    const workflowPath = path.join(ROOT, mod, '.github', 'workflows', 'docker-build.yml');
    if (!fs.existsSync(workflowPath)) {
        console.warn(`Workflow not found for ${mod}`);
        return;
    }

    let yaml = fs.readFileSync(workflowPath, 'utf8');
    // Replace :1.0 with :1.1 (or whatever NEW_TAG is)
    const oldTagRegex = /:[0-9.]+/g;
    yaml = yaml.replace(oldTagRegex, `:${NEW_TAG}`);
    
    fs.writeFileSync(workflowPath, yaml);
    console.log(`Updated ${mod} image tag to ${NEW_TAG}`);
});
