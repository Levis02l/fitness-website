const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 封装 Promise 风格的 query
function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// 配置 multer 上传图片
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/posts');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValid = allowedTypes.test(file.mimetype);
        cb(isValid ? null : new Error('Only images are allowed'), isValid);
    }
});

// ==============================
// 1. 发布动态（文字+图片）
// POST /api/community
// ==============================
router.post('/', authenticateToken, upload.array('images', 9), async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ message: 'Content or images are required' });
    }

    try {
        await queryAsync('START TRANSACTION');

        const result = await queryAsync(
            `INSERT INTO posts (user_id, content) VALUES (?, ?)`,
            [userId, content || ""]
        );
        const postId = result.insertId;

        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [postId, `/uploads/posts/${file.filename}`]);
            await queryAsync(
                `INSERT INTO post_images (post_id, image_url) VALUES ?`,
                [imageValues]
            );
        }

        await queryAsync('COMMIT');
        res.status(201).json({ message: 'Post created successfully', postId });

    } catch (error) {
        await queryAsync('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Failed to create post' });
    }
});

// ==============================
// 2. 获取动态列表
// GET /api/community?page=1
// ==============================
router.get('/', authenticateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        const posts = await queryAsync(`
            SELECT p.*, u.username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        if (posts.length === 0) return res.json({ posts: [] });

        const postIds = posts.map(post => post.id);
        const images = await queryAsync(`
            SELECT post_id, image_url 
            FROM post_images 
            WHERE post_id IN (?)
        `, [postIds]);

        const imageMap = {};
        images.forEach(img => {
            if (!imageMap[img.post_id]) imageMap[img.post_id] = [];
            imageMap[img.post_id].push(img.image_url);
        });

        posts.forEach(post => {
            post.images = imageMap[post.id] || [];
        });

        res.json({ posts });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});


// 3. 获取单条动态（含评论+点赞状态）
router.get('/:id', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id; // 当前登录的用户 ID

    try {
        const posts = await queryAsync(`
            SELECT p.*, u.username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [postId]);

        if (posts.length === 0) return res.status(404).json({ message: 'Post not found' });

        const post = posts[0];

        const images = await queryAsync(`
            SELECT image_url 
            FROM post_images 
            WHERE post_id = ?
        `, [postId]);
        post.images = images.map(img => img.image_url);

        const comments = await queryAsync(`
            SELECT pc.id, pc.comment_text, pc.created_at, u.username, u.id AS user_id
            FROM post_comments pc
            JOIN users u ON pc.user_id = u.id
            WHERE pc.post_id = ?
            ORDER BY pc.created_at ASC
        `, [postId]);
        post.comments = comments;

        // ⭐ 加这里：查询当前用户是否点赞过这条动态
        const liked = await queryAsync(`
            SELECT id
            FROM post_likes
            WHERE post_id = ? AND user_id = ?
        `, [postId, userId]);
        post.is_liked = liked.length > 0; // true 或 false

        res.json(post);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch post' });
    }
});


// ==============================
// 4. 点赞或取消点赞
// POST /api/community/:id/like
// ==============================
router.post('/:id/like', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const likes = await queryAsync(`
            SELECT id 
            FROM post_likes 
            WHERE post_id = ? AND user_id = ?
        `, [postId, userId]);

        if (likes.length > 0) {
            await queryAsync(`DELETE FROM post_likes WHERE id = ?`, [likes[0].id]);
            res.json({ liked: false });
        } else {
            await queryAsync(`INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`, [postId, userId]);
            res.json({ liked: true });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to like/unlike post' });
    }
});

// ==============================
// 5. 评论
// POST /api/community/:id/comment
// ==============================
router.post('/:id/comment', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const { comment_text } = req.body;
    const userId = req.user.id;

    if (!comment_text) {
        return res.status(400).json({ message: 'Comment text is required' });
    }

    try {
        await queryAsync(`
            INSERT INTO post_comments (post_id, user_id, comment_text) 
            VALUES (?, ?, ?)
        `, [postId, userId, comment_text]);

        res.status(201).json({ message: 'Comment added' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to comment' });
    }
});

// ==============================
// 6. 删除动态
// DELETE /api/community/:id
// ==============================
router.delete('/:id', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const posts = await queryAsync(`SELECT user_id FROM posts WHERE id = ?`, [postId]);
        if (posts.length === 0) return res.status(404).json({ message: 'Post not found' });

        if (posts[0].user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await queryAsync(`DELETE FROM posts WHERE id = ?`, [postId]);
        res.json({ message: 'Post deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
});

// ==============================
// 7. 删除评论
// DELETE /api/community/comment/:id
// ==============================
router.delete('/comment/:id', authenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;

    try {
        const comments = await queryAsync(`SELECT user_id FROM post_comments WHERE id = ?`, [commentId]);
        if (comments.length === 0) return res.status(404).json({ message: 'Comment not found' });

        if (comments[0].user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await queryAsync(`DELETE FROM post_comments WHERE id = ?`, [commentId]);
        res.json({ message: 'Comment deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});

module.exports = router;
