const crypto = require('crypto');
const { create, findByShortUrl, get, update, deleteUrl, db } = require('../models/urlModel');

// Создание короткой ссылки
exports.createShortUrl = async (req, res) => {
    const { originalUrl, alias, expiresAt } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'originalUrl is required' });
    }

    if (alias && alias.length > 20) {
        return res.status(400).json({ error: 'Alias must be less than or equal to 20 characters' });
    }

    let shortUrl;

    if (alias) {
        const existingAlias = await findByShortUrl(alias);
        if (existingAlias) {
            return res.status(400).json({ error: 'Alias already taken' });
        }
        shortUrl = alias;
    } else {
        let uniqueShortUrl = false;
        while (!uniqueShortUrl) {
            shortUrl = crypto.randomBytes(3).toString('hex');
            const existingShortUrl = await findByShortUrl(shortUrl);
            if (!existingShortUrl) {
                uniqueShortUrl = true;
            }
        }
    }

    const createdAt = new Date().toISOString();

    // Преобразуем expiresAt в дату
    const expiresAtDate = expiresAt ? new Date(expiresAt).toISOString() : null;

    try {
        await create({ originalUrl, shortUrl, createdAt, clickCount: 0, expiresAt: expiresAtDate });
        res.status(201).json({
            originalUrl,
            shortUrl: `/${shortUrl}`,
        });
    } catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).json({ error: 'Failed to create short URL' });
    }
};

// Переадресация на оригинальный URL
exports.redirectToOriginalUrl = async (req, res) => {
    const { shortUrl } = req.params;
    const ipAddress = req.ip;

    try {
        const row = await get(shortUrl);
        if (!row) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        // Проверка срока действия
        if (row.expiresAt && new Date(row.expiresAt) < new Date()) {
            return res.status(410).json({ error: 'This link has expired' });
        }

        const sql = `INSERT INTO clicks (shortUrl, ipAddress, clickedAt) VALUES (?, ?, ?)`;
        await new Promise((resolve, reject) => {
            db.run(sql, [shortUrl, ipAddress, new Date().toISOString()], function (err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });

        await update(shortUrl, { clickCount: row.clickCount + 1 });

        res.redirect(row.originalUrl);
    } catch (error) {
        console.error('Error redirecting to original URL:', error);
        res.status(500).json({ error: 'Failed to redirect' });
    }
};

// Получение информации о ссылке
exports.getUrlInfo = async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const row = await get(shortUrl);
        if (!row) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.status(200).json({
            originalUrl: row.originalUrl,
            createdAt: row.createdAt,
            clickCount: row.clickCount,
        });
    } catch (error) {
        console.error('Error getting URL info:', error);
        res.status(500).json({ error: 'Failed to get URL info' });
    }
};

// Получение аналитики по переходам
exports.getUrlAnalytics = async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const row = await get(shortUrl);
        if (!row) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const clicks = await new Promise((resolve, reject) => {
            const sql = `SELECT ipAddress, clickedAt FROM clicks WHERE shortUrl = ? ORDER BY clickedAt DESC LIMIT 5`;
            db.all(sql, [shortUrl], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        res.status(200).json({
            shortUrl: `/${shortUrl}`,
            clickCount: row.clickCount,
            latestClicks: clicks,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

// Удаление короткой ссылки
exports.deleteShortUrl = async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const result = await deleteUrl(shortUrl);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        res.status(200).json({ message: 'Short URL deleted successfully' });
    } catch (error) {
        console.error('Error deleting short URL:', error);
        res.status(500).json({ error: 'Failed to delete short URL' });
    }
};
