const fs = require('fs');
const path = require('path');

const MODULES = [
    'alcohol-learn', 'nic-learn', 'opi-learn', 'can-learn',
    'stim-learn', 'mdma-learn', 'kratom-learn', 'benzo-learn'
];

const ROOT = path.join(__dirname, '..');

// Nginx that works whether or not the proxy strips the prefix
// Strategy: serve from root AND from /slug/ via alias
const makeNginx = (slug) => `server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    # Serve JSON/JS/CSS directly (no SPA fallback for assets)
    location ~* \\.(?:json|js|css|png|jpg|svg|ico|woff2?)$ {
        try_files $uri $uri/ =404;
        add_header Cache-Control "no-cache, must-revalidate";
        add_header Access-Control-Allow-Origin "*";
    }

    # SPA fallback for HTML routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

// Dockerfile that copies files into BOTH / and /<slug>/ so requests work
// whether or not the proxy strips the prefix
const makeDockerfile = (slug) => `FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY . /usr/share/nginx/html/
# Also copy everything into /slug/ subfolder so proxy-with-no-strip works
RUN mkdir -p /usr/share/nginx/html/${slug} && cp -r /usr/share/nginx/html/i18n /usr/share/nginx/html/${slug}/
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/${slug}/index.html
RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

MODULES.forEach(slug => {
    const modDir = path.join(ROOT, slug);
    if (!fs.existsSync(modDir)) return;

    fs.writeFileSync(path.join(modDir, 'vite-nginx.conf'), makeNginx(slug));
    fs.writeFileSync(path.join(modDir, 'Dockerfile'), makeDockerfile(slug));
    console.log(`Fixed nginx + Dockerfile for ${slug}`);
});
