const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const path = require('path');
const port = 80;
const cache = {};
const loadBody = (obj) => new Promise((done, fail) => {
    const chunks = [];
    obj.on('data', chunk => chunks.push(chunk));
    obj.on('end', () => {
        done(Buffer.concat(chunks));
    });
});
const hashBuffer = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest().toString('hex').substring(0, 8);
};
const pipeSkyfield = async (req, res) => {
    const body = await loadBody(req);
    const hash = hashBuffer(body);
    const item = cache[hash];
    if (item !== undefined) {
        res.writeHead(item.status, item.headers);
        res.write(item.body);
        res.end();
        return;
    }
    const cliReq = http.request('http://skilltrek.com:8080' + req.url, {
        method: req.method,
        headers: req.headers,
    }, async (cliRes) => {
        const body = await loadBody(cliRes);
        const status = cliRes.statusCode;
        const headers = { ...cliRes.headers };
        cache[hash] = {
            body,
            status,
            headers,
        };
        res.writeHead(status, headers);
        res.write(body);
        res.end();
    });
    cliReq.write(body);
    cliReq.end();
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
