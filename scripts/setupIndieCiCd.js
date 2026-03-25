const fs = require('fs');
const path = require('path');

const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn', 'stim-learn', 'mdma-learn', 'kratom-learn'
];

const nginxConf = `server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
`;

const dockerFile = `FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY . /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

const getWorkflow = (moduleName) => `name: Build and Push Docker Image

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: bunker.mantracare.com
          username: \${{ secrets.USERNAME }}
          password: \${{ secrets.PASSWORD }}

      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          platforms: linux/amd64
          tags: bunker.mantracare.com/lovable/${moduleName}:1.0
`;

MODULES.forEach(m => {
    const dir = path.join(__dirname, '..', m);
    if (!fs.existsSync(dir)) return;

    fs.writeFileSync(path.join(dir, 'vite-nginx.conf'), nginxConf);
    fs.writeFileSync(path.join(dir, 'Dockerfile'), dockerFile);
    
    const githubDir = path.join(dir, '.github');
    const workflowsDir = path.join(githubDir, 'workflows');
    if (!fs.existsSync(githubDir)) fs.mkdirSync(githubDir);
    if (!fs.existsSync(workflowsDir)) fs.mkdirSync(workflowsDir);
    
    fs.writeFileSync(path.join(workflowsDir, 'docker-build.yml'), getWorkflow(m));
    console.log(`Set up CI/CD for ${m}.`);
});
