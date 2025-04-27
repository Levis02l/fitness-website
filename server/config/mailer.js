require('dotenv').config();
const nodemailer = require('nodemailer');

// 创建 nodemailer 传输器
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // 如果是587端口则为false
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 封装发送邮件的函数
const sendMail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"Fitness App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// 新增：发送验证码的封装
const sendVerificationCode = async (to, code) => {
    const subject = 'Your Password Reset Code';
    const text = `Your verification code is: ${code}\nThis code is valid for 5 minutes.`;
    await sendMail(to, subject, text);
};

module.exports = { sendMail, sendVerificationCode };

