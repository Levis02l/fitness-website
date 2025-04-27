const db = require('../config/db');

const createUserProfile = (userId, age, gender, height, weight, activityLevel, goal, experienceLevel) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO user_profiles (userId, age, gender, height, weight, activityLevel, goal, experienceLevel)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [userId, age, gender, height, weight, activityLevel, goal, experienceLevel], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

const getUserProfile = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM user_profiles WHERE userId = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        });
    });
};

const updateUserProfile = (userId, age, gender, height, weight, activityLevel, goal, experienceLevel) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE user_profiles 
            SET age = ?, gender = ?, height = ?, weight = ?, activityLevel = ?, goal = ?, experienceLevel = ?
            WHERE userId = ?
        `;
        db.query(sql, [age, gender, height, weight, activityLevel, goal, experienceLevel, userId], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

module.exports = { createUserProfile, getUserProfile, updateUserProfile };
