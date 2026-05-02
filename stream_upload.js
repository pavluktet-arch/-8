const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    // 1. Перевіряємо шлях та метод
    if (req.method === 'POST' && req.url === '/upload') {
        
        // 2. Створюємо Writable Stream для файлу upload.txt
        const filePath = path.join(process.cwd(), 'upload.txt');
        const writeStream = fs.createWriteStream(filePath);

        // 3. Переспрямовуємо потік запиту (req) у потік файлу (writeStream)
        req.pipe(writeStream);

        // 4. Коли запис у файл успішно завершено
        writeStream.on('finish', () => {
            res.statusCode = 200;
            res.end('File uploaded successfully');
        });

        // 5. Обробка помилок (наприклад, якщо немає доступу до диска)
        writeStream.on('error', (err) => {
            res.statusCode = 500;
            res.end('Error writing file');
        });

    } else {
        // 6. Будь-який невідомий роут повертає 404
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}. Send POST to /upload`);
});