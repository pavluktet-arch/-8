const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    // 1. Отримуємо параметри з URL
    const parsedUrl = url.parse(req.url, true);
    const fileName = parsedUrl.query.fileName;

    // 2. Перевірка: чи це правильний шлях і чи є ім'я файлу
    if (parsedUrl.pathname !== '/file' || !fileName) {
        res.statusCode = 400;
        return res.end('Missing fileName parameter');
    }

    const filePath = path.join(process.cwd(), fileName);

    // 3. Перевірка існування файлу перед стрімінгом
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.statusCode = 400;
            return res.end('File not found');
        }

        // 4. Встановлюємо заголовки (успіх)
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8'
        });

        // 5. Створюємо Readable Stream і "пайпимо" його у відповідь
        const fileStream = fs.createReadStream(filePath);
        
        fileStream.pipe(res);

        // 6. Обробка помилок стріму (щоб сервер не впав, якщо файл зникне під час читання)
        fileStream.on('error', () => {
            res.statusCode = 500;
            res.end('Internal Server Error');
        });
    });
});

server.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});