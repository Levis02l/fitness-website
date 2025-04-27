const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// 内存缓存，防止重复请求 API（可选：可以用 Redis 做持久化）
const exerciseCache = new Map();

// 获取所有动作
router.get("/", async (req, res) => {
    try {
        const response = await axios.get("https://exercisedb.p.rapidapi.com/exercises", {
            headers: {
                "X-RapidAPI-Key": process.env.EXERCISE_API_KEY,
                "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
            },
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching exercise data:", error);
        res.status(500).json({ message: "Failed to fetch exercises" });
    }
});

// 获取某个部位的动作
router.get("/bodyPart/:bodyPart", async (req, res) => {
    const { bodyPart } = req.params;
    const limit = 50; // 设置返回 30 个结果
    const cacheKey = `bodyPart_${bodyPart}`;

    if (exerciseCache.has(cacheKey)) {
        return res.json(exerciseCache.get(cacheKey)); // 直接返回缓存数据
    }

    try {
        const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`, {
            params: { limit }, // 添加 limit 参数
            headers: {
                "X-RapidAPI-Key": process.env.EXERCISE_API_KEY,
                "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
            },
            
        });

        exerciseCache.set(cacheKey, response.data); // 缓存数据
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error fetching exercises for body part ${bodyPart}:`, error);
        res.status(500).json({ message: "Failed to fetch exercises" });
    }
});

// 获取某个器械的动作
router.get("/equipment/:equipment", async (req, res) => {
    const { equipment } = req.params;
    const cacheKey = `equipment_${equipment}`;

    if (exerciseCache.has(cacheKey)) {
        return res.json(exerciseCache.get(cacheKey)); // 直接返回缓存数据
    }

    try {
        const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/equipment/${equipment}`, {
            headers: {
                "X-RapidAPI-Key": process.env.EXERCISE_API_KEY,
                "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
            },
        });

        exerciseCache.set(cacheKey, response.data); // 缓存数据
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error fetching exercises for equipment ${equipment}:`, error);
        res.status(500).json({ message: "Failed to fetch exercises" });
    }
});

// 获取单个动作详情
router.get("/exercise/:id", async (req, res) => {
    const { id } = req.params;
    const cacheKey = `exercise_${id}`;

    if (exerciseCache.has(cacheKey)) {
        return res.json(exerciseCache.get(cacheKey)); // 直接返回缓存数据
    }

    try {
        const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`, {
            headers: {
                "X-RapidAPI-Key": process.env.EXERCISE_API_KEY,
                "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
            },
        });

        exerciseCache.set(cacheKey, response.data); // 缓存数据
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching exercise details for ID ${id}:`, error);
        res.status(500).json({ message: "Failed to fetch exercise details" });
    }
});

module.exports = router;
