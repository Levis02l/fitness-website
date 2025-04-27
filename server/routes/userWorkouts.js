const express = require("express");
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

// ✅ 确保用户只有一个训练计划
const checkExistingWorkout = (userId) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT id FROM user_workouts WHERE user_id = ? AND is_active = TRUE", [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0].id : null);
        });
    });
};

const copyWorkoutExercises = (userWorkoutId, templateId, squatWeight, benchWeight, deadliftWeight) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT exercise_id, sets, reps, rest_time, muscle_group
            FROM workout_template_exercises
            WHERE template_id = ?
        `;

        db.query(sql, [templateId], (err, exercises) => {
            if (err) return reject(err);

            const insertValues = exercises.map(ex => {
                let weight = 0;

                if (ex.muscle_group === "legs") {
                    weight = squatWeight * 0.7;
                } else if (["chest", "back", "shoulders"].includes(ex.muscle_group)) {
                    weight = benchWeight * 0.6;
                } else if (["arms", "biceps", "triceps"].includes(ex.muscle_group)) {
                    weight = benchWeight * 0.5;
                } else {
                    weight = deadliftWeight * 0.6;
                }

                return [
                    userWorkoutId,
                    ex.exercise_id,
                    ex.sets,
                    ex.reps,
                    weight.toFixed(2),
                    ex.rest_time,
                    ex.muscle_group   // ✅ 去掉了 completed
                ];
            });

            if (insertValues.length === 0) return resolve();

            const insertSql = `
                INSERT INTO user_workout_exercises 
                    (user_workout_id, exercise_id, sets, reps, weight, rest_time, muscle_group)
                VALUES ?
            `;

            db.query(insertSql, [insertValues], (insertErr, result) => {
                if (insertErr) return reject(insertErr);
                resolve(result);
            });
        });
    });
};


router.post("/", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { template_id, start_date, squat_weight, bench_weight, deadlift_weight } = req.body;

    if (!template_id || !start_date || !squat_weight || !bench_weight || !deadlift_weight) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingWorkoutId = await checkExistingWorkout(userId);
        if (existingWorkoutId) {
            return res.status(400).json({ message: "You already have an active workout plan." });
        }

        const insertWorkoutSql = `
            INSERT INTO user_workouts (user_id, template_id, start_date, squat_weight, bench_weight, deadlift_weight, current_day_index)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `;

        db.query(insertWorkoutSql, [userId, template_id, start_date, squat_weight, bench_weight, deadlift_weight], async (err, result) => {
            if (err) {
                console.error("Insert workout error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            const userWorkoutId = result.insertId;

            try {
                await copyWorkoutExercises(userWorkoutId, template_id, squat_weight, bench_weight, deadlift_weight);
                res.status(201).json({ message: "Workout plan created successfully!", userWorkoutId });
            } catch (copyErr) {
                console.error("Copy workout exercises error:", copyErr); // ⬅️ 加这一行！！
                return res.status(500).json({ message: "Error copying exercises", error: copyErr });
            }
        });

    } catch (error) {
        console.error("Unexpected server error:", error); // ⬅️ 加这一行！！
        res.status(500).json({ message: "Database error", error });
    }
});

router.delete("/cancel", authenticateToken, (req, res) => {
    const userId = req.user.id;
  
    // 检查是否存在 active 的计划
    const checkSql = `SELECT id FROM user_workouts WHERE user_id = ? AND is_active = TRUE`;
  
    db.query(checkSql, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error", details: err });
      if (results.length === 0) return res.status(404).json({ error: "No active workout plan found" });
  
      const workoutId = results[0].id;
  
      // 撤销计划（设置为不活跃）
      const updateSql = `UPDATE user_workouts SET is_active = FALSE WHERE id = ?`;
  
      db.query(updateSql, [workoutId], (updateErr) => {
        if (updateErr) return res.status(500).json({ error: "Failed to cancel plan", details: updateErr });
  
        return res.json({ message: "Workout plan cancelled successfully", cancelled_workout_id: workoutId });
      });
    });
});
  


module.exports = router;
