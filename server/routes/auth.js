const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, updateUserPassword } = require('../models/User');
const { createUserProfile } = require('../models/UserProfile'); // 仅创建 user_profiles，不修改 profile_completed
const crypto = require('crypto');
const { sendMail, sendVerificationCode } = require('../config/mailer');

const verificationCodes = {};
const router = express.Router();

// ✅ 用户注册
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // ✅ 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // ✅ 验证密码复杂性
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message:
                'Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.',
        });
    }

    try {
        // ✅ 检查邮箱是否已存在
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // ✅ 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(username, email, hashedPassword);
        

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ✅ 用户登录
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token,user: { id: user.id, email: user.email, username: user.username }  });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ✅ 发送邮箱验证码
router.post('/send-verification-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        verificationCodes[email] = { code: verificationCode, expires: Date.now() + 5 * 60 * 1000 };

        await sendMail(email, 'Your Verification Code', `Your verification code is: ${verificationCode}`);

        res.status(200).json({ message: 'Verification code sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending verification code' });
    }
});

// ✅ 验证邮箱验证码
router.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
    }

    const record = verificationCodes[email];

    if (!record || record.code !== code) {
        return res.status(400).json({ message: 'Invalid or expired code' });
    }

    if (Date.now() > record.expires) {
        return res.status(400).json({ message: 'Code has expired' });
    }

    delete verificationCodes[email];
    res.status(200).json({ message: 'Verification successful' });
});

// ✅ 发送密码重置验证码
router.post('/send-reset-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Email not found.' });
        }

        const verificationCode = crypto.randomInt(100000, 999999).toString();

        verificationCodes[email] = {
            code: verificationCode,
            expires: Date.now() + 5 * 60 * 1000,
        };

        await sendVerificationCode(email, verificationCode);
        res.status(200).json({ message: 'Verification code sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send verification code.' });
    }
});

// ✅ 重置密码
router.post('/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const record = verificationCodes[email];
    if (!record || record.code !== code) {
        return res.status(400).json({ message: 'Invalid or expired code' });
    }

    if (Date.now() > record.expires) {
        return res.status(400).json({ message: 'Code has expired' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(email, hashedPassword);
        delete verificationCodes[email];
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
