const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const fileName = parsedUrl.query.fileName;

    // 1. Перевірка наявності параметра fileName
    if (parsedUrl.pathname !== '/missing-file' || !fileName) {
        res.statusCode = 400;
        return res.end('Bad Request: Missing fileName');
    }

    const filePath = path.join(process.cwd(), fileName);

    // 2. Спробуємо створити стрім для читання
    const fileStream = fs.createReadStream(filePath);

    // 3. Обробка помилок стріму
    fileStream.on('error', (err) => {
        // Якщо сталася помилка (наприклад, файлу немає), повертаємо 500
        if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Internal Server Error'); // Безпечне повідомлення
        }
        console.error(`Помилка стріму для файлу ${fileName}: ${err.message}`);
    });

    // 4. Якщо все добре — пайпимо у відповідь
    fileStream.pipe(res);
});

server.listen(port, () => {
    console.log(`Error-handling server is running on port ${port}`);
});