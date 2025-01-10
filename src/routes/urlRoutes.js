const express = require('express');
const router = express.Router();
const {
    createShortUrl,
    redirectToOriginalUrl,
    getUrlInfo,
    deleteShortUrl,
    getUrlAnalytics
} = require('../controllers/urlController');

// Создание короткой ссылки
router.post('/', createShortUrl);

// Переадресация на оригинальный URL
router.get('/:shortUrl', redirectToOriginalUrl);

// Получение информации о ссылке
router.get('/info/:shortUrl', getUrlInfo);

// Получение аналитики по переходам
router.get('/analytics/:shortUrl', (req, res, next) => {
    console.log('analytics route handler called');
    next();
}, getUrlAnalytics);

// Удаление короткой ссылки
router.delete('/:shortUrl', deleteShortUrl);

module.exports = router;
