const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const port = process.env.PORT || 3002;


app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));

// Подключаем маршруты для сокращения URL
app.use('/', urlRoutes);

// Корневой маршрут для отправки index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));  // Убедитесь, что путь правильный
});

// Маршрут для обработки 404 ошибок
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;
