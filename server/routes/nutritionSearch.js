const express = require("express");
const router = express.Router();
const OAuth = require("oauth").OAuth;
const authenticateToken = require("../middleware/auth");
require("dotenv").config(); // 若你使用 .env 管理 key

// OAuth 1.0 凭证（填你的 FatSecret Consumer Key & Secret）
const consumerKey = process.env.FATSECRET_CONSUMER_KEY ;
const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET ;

// 创建 OAuth 实例
const oauth = new OAuth(
  null,
  null,
  consumerKey,
  consumerSecret,
  "1.0",
  null,
  "HMAC-SHA1"
);

// 工具函数：从 description 中提取营养素
function parseNutrition(description) {
  const result = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  const calorieMatch = description.match(/Calories:\s*([\d.]+)kcal/i);
  const fatMatch = description.match(/Fat:\s*([\d.]+)g/i);
  const carbsMatch = description.match(/Carbs:\s*([\d.]+)g/i);
  const proteinMatch = description.match(/Protein:\s*([\d.]+)g/i);

  if (calorieMatch) result.calories = parseFloat(calorieMatch[1]);
  if (fatMatch) result.fat = parseFloat(fatMatch[1]);
  if (carbsMatch) result.carbs = parseFloat(carbsMatch[1]);
  if (proteinMatch) result.protein = parseFloat(proteinMatch[1]);

  return result;
}

// 路由：搜索食物
router.get("/search", authenticateToken, (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

  const url = "https://platform.fatsecret.com/rest/server.api";
  const params = {
    method: "foods.search",
    search_expression: query,
    format: "json",
  };

  const paramString = Object.entries(params)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join("&");

  const requestUrl = `${url}?${paramString}`;

  oauth.get(
    requestUrl,
    null,
    null,
    (error, data, response) => {
      if (error) {
        console.error("FatSecret API error:", error);
        return res.status(500).json({ error: "Failed to fetch from FatSecret" });
      }

      const result = JSON.parse(data);
      const rawFoods = result.foods?.food || [];

      const foods = rawFoods.map((item) => {
        const nutrients = parseNutrition(item.food_description || "");

        return {
          food_id: item.food_id,
          food_name: item.food_name,
          brand_name: item.brand_name || null,
          food_type: item.food_type,
          food_url: item.food_url,
          description: item.food_description,
          ...nutrients,
        };
      });

      res.json({ foods });
    }
  );
});

module.exports = router;
