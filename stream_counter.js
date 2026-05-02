const http = require('http');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    // Маємо обробляти тільки POST /count
    if (req.method === 'POST' && req.url === '/count') {
        let bytes = 0;
        let chunks = 0;

        req.on('data', (chunk) => {
            bytes += chunk.length;
            chunks++;
        });

        req.on('end', () => {
            // Формуємо відповідь точно за вимогами: bytes та chunks
            const result = JSON.stringify({
                bytes: bytes,
                chunks: chunks
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(result); // Важливо: завершуємо відповідь тут
        });

        req.on('error', () => {
            res.statusCode = 500;
            res.end();
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(port);