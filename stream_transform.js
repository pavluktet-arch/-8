const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Transform } = require('stream');

const port = process.argv[2] || 3000;

// Створюємо стрім для трансформації в регістр
const uppercaseTransform = new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase());
        callback();
    }
});

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const fileName = parsedUrl.query.fileName;

    // 1. Перевірка шляху та наявності fileName
    if (parsedUrl.pathname !== '/upper' || !fileName) {
        res.statusCode = 400;
        return res.end('Bad Request: Missing fileName');
    }

    const filePath = path.join(process.cwd(), fileName);

    // 2. Перевірка існування файлу
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.statusCode = 400;
            return res.end('File not found');
        }

        // 3. Встановлюємо статус 200
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });

        // 4. Створюємо ланцюжок стрімів:
        // Читаємо файл -> Трансформуємо -> Відправляємо клієнту
        const fileReadStream = fs.createReadStream(filePath);
        
        fileReadStream
            .pipe(uppercaseTransform)
            .pipe(res, { end: false }); // end: false дозволяє уникнути передчасного закриття, якщо потрібно

        // 5. Важливо завершити відповідь, коли все передано
        fileReadStream.on('end', () => {
            res.end();
        });

        // Обробка помилок
        fileReadStream.on('error', () => {
            res.statusCode = 500;
            res.end('Internal Server Error');
        });
    });
});

server.listen(port);