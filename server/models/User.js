const db = require('../config/db');

const createUser = (username, email, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (username, email, password, profile_completed) VALUES (?, ?, ?, false)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        });
    });
};

const updateUserPassword = (email, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET password = ? WHERE email = ?';
        db.query(sql, [hashedPassword, email], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// ✅ 新增：更新 profile_completed 状态
const updateProfileCompleted = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET profile_completed = true WHERE id = ?';
        db.query(sql, [userId], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

module.exports = { createUser, findUserByEmail, updateUserPassword, updateProfileCompleted };
