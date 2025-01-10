const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./urls.db');

// Создание таблиц, если они не существуют
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='urls'", (err, row) => {
    if (err) {
        console.error('Error checking table existence:', err);
    } else if (row) {
        console.log('Table "urls" already exists.');
    } else {
        const sql = `CREATE TABLE urls (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           originalUrl TEXT NOT NULL,
                                           shortUrl TEXT NOT NULL UNIQUE,
                                           createdAt TEXT NOT NULL,
                                           clickCount INTEGER DEFAULT 0,
                                           expiresAt TEXT
                     )`;
        db.run(sql, (err) => {
            if (err) console.error('Error creating table:', err);
            else console.log('Table "urls" is ready.');
        });
    }
});

// Создание таблицы кликов
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='clicks'", (err, row) => {
    if (err) console.error('Error checking table existence:', err);
    else if (row) console.log('Table "clicks" already exists.');
    else {
        const sql = `CREATE TABLE clicks (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             shortUrl TEXT NOT NULL,
                                             ipAddress TEXT NOT NULL,
                                             clickedAt TEXT NOT NULL
                     )`;
        db.run(sql, (err) => {
            if (err) console.error('Error creating table:', err);
            else console.log('Table "clicks" is ready.');
        });
    }
});

// Функции работы с данными
const create = (url) => {
    const { originalUrl, shortUrl, createdAt, clickCount, expiresAt } = url;
    const sql = `INSERT INTO urls (originalUrl, shortUrl, createdAt, clickCount, expiresAt)
                 VALUES (?, ?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [originalUrl, shortUrl, createdAt, clickCount || 0, expiresAt || null], function (err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
    });
};

const findByShortUrl = (shortUrl) => {
    const sql = `SELECT * FROM urls WHERE shortUrl = ?`;
    return new Promise((resolve, reject) => {
        db.get(sql, [shortUrl], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

const get = (shortUrl) => {
    const sql = `SELECT * FROM urls WHERE shortUrl = ?`;
    return new Promise((resolve, reject) => {
        db.get(sql, [shortUrl], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

const update = (shortUrl, data) => {
    const { clickCount, expiresAt } = data;
    const sql = `UPDATE urls SET clickCount = ?, expiresAt = ? WHERE shortUrl = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [clickCount, expiresAt, shortUrl], function (err) {
            if (err) reject(err);
            resolve(this.changes);
        });
    });
};

const deleteUrl = (shortUrl) => {
    const sql = `DELETE FROM urls WHERE shortUrl = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [shortUrl], function (err) {
            if (err) reject(err);
            resolve(this); // Возвращаем объект this для доступа к changes
        });
    });
};

// Запись клика
const recordClick = (shortUrl, ipAddress) => {
    const sql = `INSERT INTO clicks (shortUrl, ipAddress, clickedAt) VALUES (?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [shortUrl, ipAddress, new Date().toISOString()], function (err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
    });
};

module.exports = {
    create,
    findByShortUrl,
    get,
    update,
    deleteUrl,
    recordClick,
    db
};
