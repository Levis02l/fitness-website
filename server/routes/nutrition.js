const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");

// ✅ 获取所有官方模板
router.get("/official-templates", (req, res) => {
    const sql = "SELECT id, name, protein_ratio, carbs_ratio, fat_ratio, description FROM official_nutrition_templates";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching templates:", err);
            return res.status(500).json({ error: "Failed to fetch official templates" });
        }
        res.json({ templates: results });
    });
});

// ✅ 用户选择官方模板，生成 user 专属模板
router.post("/select-template", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { official_template_id } = req.body;

    if (!official_template_id) {
        return res.status(400).json({ error: "official_template_id is required" });
    }

    // 获取用户目标体重和选中模板
    const userSql = `SELECT weight FROM user_profiles WHERE userId = ?`;
    const templateSql = `SELECT * FROM official_nutrition_templates WHERE id = ?`;

    db.query(userSql, [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            return res.status(404).json({ error: "User profile not found" });
        }

        const currentWeight = userResults[0].weight;

        db.query(templateSql, [official_template_id], (err2, templateResults) => {
            if (err2 || templateResults.length === 0) {
                return res.status(404).json({ error: "Template not found" });
            }

            const template = templateResults[0];

            // 计算每日目标
            const protein = template.protein_ratio * currentWeight;
            const carbs = template.carbs_ratio * currentWeight;
            const fat = template.fat_ratio * currentWeight;
            const calories = (protein * 4) + (carbs * 4) + (fat * 9);

            const insertSql = `
            REPLACE INTO nutrition_templates 
              (user_id, template_name, protein_target, carbs_target, fat_target, calorie_target, is_active, source_template_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

            db.query(insertSql, [
                userId,           // ?
                template.name,    // ?
                protein,          // ?
                carbs,            // ?
                fat,              // ?
                calories,         // ?
                true,             // ?
                template.id       // ?
            ], (err3) => {
                if (err3) {
                    console.error("Insert nutrition template error:", err3);
                    return res.status(500).json({ error: "Failed to save user nutrition template" });
                }

                res.json({ message: "User nutrition template saved successfully" });
            });


        });
    });
});

// ✅ 获取当前用户的营养目标（用于每日摄入目标展示）
router.get("/targets", authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT 
            template_name,
            protein_target,
            carbs_target,
            fat_target,
            calorie_target
        FROM nutrition_templates
        WHERE user_id = ? AND is_active = TRUE
        LIMIT 1
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Failed to fetch nutrition targets:", err);
            return res.status(500).json({ error: "Failed to get nutrition targets" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No active nutrition template found for user" });
        }

        res.json({ target: results[0] });
    });
});

router.post("/log-meal", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const {
        food_id,
        food_name,
        food_url,
        meal_type,
        weight_in_grams,
        calories,    // 每100g的
        protein,     // 每100g的
        carbs,
        fat,
        date
    } = req.body;

    // 🔍 校验必填字段
    if (!food_id || !food_name || !meal_type || !weight_in_grams || !date) {
        console.error("Missing required fields:", { food_id, food_name, meal_type, weight_in_grams, date });
        return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔍 校验数值字段
    if (isNaN(weight_in_grams) || weight_in_grams <= 0) {
        console.error("Invalid weight value:", weight_in_grams);
        return res.status(400).json({ error: "Invalid weight value" });
    }

    if (isNaN(calories) || calories < 0 || isNaN(protein) || protein < 0 ||
        isNaN(carbs) || carbs < 0 || isNaN(fat) || fat < 0) {
        console.error("Invalid nutritional values:", { calories, protein, carbs, fat });
        return res.status(400).json({ error: "Invalid nutritional values" });
    }

    // ✅ 计算实际摄入值
    const ratio = weight_in_grams / 100.0;
    const actualCalories = (calories * ratio).toFixed(2);
    const actualProtein = (protein * ratio).toFixed(2);
    const actualCarbs = (carbs * ratio).toFixed(2);
    const actualFat = (fat * ratio).toFixed(2);

    // ✅ Step 1: 查重
    const checkSql = `
      SELECT id FROM user_meal_records 
      WHERE user_id = ? AND meal_type = ? AND date = ? AND food_id = ?
    `;

    db.query(checkSql, [userId, meal_type, date, food_id], (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Error checking existing record:", checkErr);
            return res.status(500).json({ error: "Internal error" });
        }

        if (checkResult.length > 0) {
            // ✅ Step 2: 更新已有记录
            const updateSql = `
          UPDATE user_meal_records
          SET 
            weight_in_grams = ?, 
            protein = ?, 
            carbs = ?, 
            fat = ?, 
            calories = ?, 
            food_url = ?, 
            food_name = ?
          WHERE id = ?
        `;

            const updateValues = [
                weight_in_grams,
                actualProtein,
                actualCarbs,
                actualFat,
                actualCalories,
                food_url || null,
                food_name,
                checkResult[0].id
            ];

            db.query(updateSql, updateValues, (updateErr) => {
                if (updateErr) {
                    console.error("Error updating record:", updateErr);
                    return res.status(500).json({ error: "Failed to update meal record" });
                }

                res.json({
                    message: "Meal record updated successfully",
                    data: {
                        id: checkResult[0].id,
                        calories: actualCalories,
                        protein: actualProtein,
                        carbs: actualCarbs,
                        fat: actualFat
                    }
                });
            });
        } else {
            // ✅ Step 3: 插入新记录
            const insertSql = `
          INSERT INTO user_meal_records 
            (user_id, food_id, food_name, food_url, meal_type, weight_in_grams, protein, carbs, fat, calories, date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

            const insertValues = [
                userId,
                food_id,
                food_name,
                food_url || null,
                meal_type,
                weight_in_grams,
                actualProtein,
                actualCarbs,
                actualFat,
                actualCalories,
                date
            ];

            db.query(insertSql, insertValues, (insertErr, insertResult) => {
                if (insertErr) {
                    console.error("Error inserting record:", insertErr);
                    return res.status(500).json({ error: "Failed to save meal record" });
                }

                res.json({
                    message: "Meal record saved successfully",
                    data: {
                        id: insertResult.insertId,
                        calories: actualCalories,
                        protein: actualProtein,
                        carbs: actualCarbs,
                        fat: actualFat
                    }
                });
            });
        }
    });
});


router.get("/records", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const date = req.query.date;

    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }

    const sql = `
    SELECT 
      id,
      meal_type,
      food_name,
      food_url,
      weight_in_grams,
      protein,
      carbs,
      fat,
      calories
    FROM user_meal_records
    WHERE user_id = ? AND date = ?
  `;

    db.query(sql, [userId, date], (err, results) => {
        if (err) {
            console.error("Error fetching meal records:", err);
            return res.status(500).json({ error: "Failed to fetch meal records" });
        }

        const grouped = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
        };

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        results.forEach((record) => {
            grouped[record.meal_type].push(record);
            totalCalories += parseFloat(record.calories || 0);
            totalProtein += parseFloat(record.protein || 0);
            totalCarbs += parseFloat(record.carbs || 0);
            totalFat += parseFloat(record.fat || 0);
        });

        res.json({
            summary: {
                calories: parseFloat(totalCalories.toFixed(2)),
                protein: parseFloat(totalProtein.toFixed(2)),
                carbs: parseFloat(totalCarbs.toFixed(2)),
                fat: parseFloat(totalFat.toFixed(2)),
            },
            meals: grouped,
        });
    });
});

router.delete("/delete-meal/:id", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const mealId = req.params.id;

    const sql = `
      DELETE FROM user_meal_records 
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [mealId, userId], (err, result) => {
        if (err) {
            console.error("Error deleting meal:", err);
            return res.status(500).json({ error: "Failed to delete meal" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Meal not found or not owned by user" });
        }

        res.json({ message: "Meal deleted successfully" });
    });
});

router.put("/update-meal/:id", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const mealId = req.params.id;
    const { weight_in_grams } = req.body;

    if (!weight_in_grams || isNaN(weight_in_grams) || weight_in_grams <= 0) {
        return res.status(400).json({ error: "Invalid weight value" });
    }

    // 查询旧记录（需要拿到每100g的营养信息）
    const getSql = `
      SELECT calories, protein, carbs, fat, weight_in_grams 
      FROM user_meal_records
      WHERE id = ? AND user_id = ?
    `;

    db.query(getSql, [mealId, userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: "Meal not found" });
        }

        const record = results[0];
        const ratio = weight_in_grams / record.weight_in_grams;

        const updatedCalories = (record.calories * ratio).toFixed(2);
        const updatedProtein = (record.protein * ratio).toFixed(2);
        const updatedCarbs = (record.carbs * ratio).toFixed(2);
        const updatedFat = (record.fat * ratio).toFixed(2);

        const updateSql = `
        UPDATE user_meal_records
        SET 
          weight_in_grams = ?, 
          calories = ?, 
          protein = ?, 
          carbs = ?, 
          fat = ?
        WHERE id = ? AND user_id = ?
      `;

        const updateValues = [
            weight_in_grams,
            updatedCalories,
            updatedProtein,
            updatedCarbs,
            updatedFat,
            mealId,
            userId
        ];

        db.query(updateSql, updateValues, (updateErr) => {
            if (updateErr) {
                console.error("Error updating meal:", updateErr);
                return res.status(500).json({ error: "Failed to update meal" });
            }

            res.json({
                message: "Meal updated successfully",
                data: {
                    id: mealId,
                    weight_in_grams,
                    calories: updatedCalories,
                    protein: updatedProtein,
                    carbs: updatedCarbs,
                    fat: updatedFat
                }
            });
        });
    });
});


module.exports = router;
