const fs = require('fs');
const http = require('http');
const path = require('path');
const port = 80;
const pipeSkyfield = async (req, res) => {
    const cliReq = http.request('http://skilltrek.com:8080' + req.url, {
        method: 'POST',
        headers: req.headers,
    }, cliRes => {
        res.writeHead(cliRes.statusCode, cliRes.headers);
        cliRes.on('data', data => res.write(data));
        cliRes.on('end', () => res.end());
    });
    req.on('data', data => cliReq.write(data));
    req.on('end', () => cliReq.end());
};
const mimeMap = {
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'png': 'image/png',
};
const loadFile = (req, res) => {
    const urlPath = req.url.replace(/[?#].*/, '').replace(/\/$/, '/index.html');
    const pathname = path.join(__dirname, urlPath);
    let buffer;
    try {
        buffer = fs.readFileSync(pathname);
    } catch {
        res.writeHead(404);
        res.end();
        return;
    }
    const ext = pathname.replace(/.*\.(\w+)$/, '$1').toLowerCase();
    res.writeHead(200, {
        'content-length': buffer.length,
        'content-type': mimeMap[ext] ?? 'application/octet-stream',
    });
    res.write(buffer);
    res.end();
};
http.createServer((req, res) => {
    if (req.method === 'POST') {
        pipeSkyfield(req, res);
    } else {
        loadFile(req, res);
    }
}).listen(port, () => console.log(`Server started at http://localhost:${port}`));
