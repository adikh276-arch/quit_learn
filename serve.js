const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3510;
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    if (url === '/') url = '/index.html';
    
    let filePath = path.join(ROOT, url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end(`<h1>404 Not Found: ${url}</h1>`);
            return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, {'Content-Type': MIME[ext] || 'text/plain'});
        res.end(content);
    });
}).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
