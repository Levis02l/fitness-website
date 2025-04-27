const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const { createUserProfile, getUserProfile, updateUserProfile } = require('../models/UserProfile')

router.get("/", authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
      SELECT 
        u.username,
        u.profile_completed,
        up.age, up.gender, up.height, up.weight,
        up.activityLevel, up.goal, up.experienceLevel
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.userId
      WHERE u.id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user profile:", err);
            return res.status(500).json({ error: "Failed to fetch profile" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Profile not found" });
        }

        const {
            username,
            profile_completed,
            ...profile
        } = results[0];

        res.json({
            success: true,
            username,
            profile_completed: !!profile_completed,
            profile,
        });
    });
});


router.put("/", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const {
      username, // 👈 前端传入的新字段
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      experienceLevel,
    } = req.body;

    // ✅ 简单校验
    if (
      age && (isNaN(age) || age <= 0) ||
      height && (isNaN(height) || height <= 0) ||
      weight && (isNaN(weight) || weight <= 0)
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const updateProfileSql = `
      UPDATE user_profiles 
      SET 
        age = ?, gender = ?, height = ?, weight = ?, 
        activityLevel = ?, goal = ?, experienceLevel = ?, updated_at = NOW()
      WHERE userId = ?
    `;

    const profileParams = [
      age, gender, height, weight,
      activityLevel, goal, experienceLevel,
      userId,
    ];

    db.query(updateProfileSql, profileParams, (profileErr) => {
        if (profileErr) {
            console.error("Error updating user profile:", profileErr);
            return res.status(500).json({ error: "Failed to update profile" });
        }

        if (username) {
            const updateUsernameSql = `UPDATE users SET username = ? WHERE id = ?`;
            db.query(updateUsernameSql, [username, userId], (userErr) => {
                if (userErr) {
                    console.error("Error updating username:", userErr);
                    return res.status(500).json({ error: "Failed to update username" });
                }

                res.json({ success: true, message: "Profile and username updated successfully" });
            });
        } else {
            res.json({ success: true, message: "Profile updated successfully" });
        }
    });
});


router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { age, gender, height, weight, activityLevel, goal, experienceLevel } = req.body;

    if (!age || !gender || !height || !weight || !activityLevel || !goal || !experienceLevel) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingProfile = await getUserProfile(userId);

        if (!existingProfile) {
            await createUserProfile(userId, age, gender, height, weight, activityLevel, goal, experienceLevel);

            // ✅ 设置 users 表中 profile_completed = 1
            const updateUserSql = `UPDATE users SET profile_completed = true WHERE id = ?`;
            db.query(updateUserSql, [userId], (err) => {
                if (err) {
                    console.error("Failed to update profile_completed:", err);
                    return res.status(500).json({ message: 'Profile created, but failed to mark as completed' });
                }

                return res.status(201).json({ message: 'Profile created and marked as completed' });
            });
        } else {
            await updateUserProfile(userId, age, gender, height, weight, activityLevel, goal, experienceLevel);
            return res.status(200).json({ message: 'Profile updated successfully' });
        }
    } catch (error) {
        console.error("Error in POST /profile:", error);
        res.status(500).json({ message: 'Database error', error });
    }
});


// ✅ 确保模块正确导出
module.exports = router;
