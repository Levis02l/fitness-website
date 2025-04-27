const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");
const axios = require("axios");

// 获取所有训练模板
router.get("/", (req, res) => {
    const sql = "SELECT id, name, description, difficulty, cycle_days, image_url FROM workout_templates"; 

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database query error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(200).json({
            success: true,
            templates: results
        });
    });
});

// 更新 current_day_index（从开始日期计算到今天，不做模运算）
router.get("/update-day", authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT u.id AS user_workout_id, u.start_date, u.current_day_index
        FROM user_workouts u
        WHERE u.user_id = ? AND u.is_active = TRUE
        LIMIT 1
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "No active workout found" });

        const row = results[0];
        const startDate = new Date(row.start_date);
        const today = new Date();
        const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

        if (row.current_day_index !== daysPassed) {
            const updateSql = `UPDATE user_workouts SET current_day_index = ? WHERE id = ?`;
            db.query(updateSql, [daysPassed, row.user_workout_id], () => {
                return res.json({ updated: true, current_day_index: daysPassed });
            });
        } else {
            return res.json({ updated: false, current_day_index: daysPassed });
        }
    });
});

router.get("/today", authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT 
            u.current_day_index,
            t.id AS template_id,
            t.cycle_days
        FROM user_workouts u
        JOIN workout_templates t ON u.template_id = t.id
        WHERE u.user_id = ? AND u.is_active = TRUE
        LIMIT 1
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "No active workout plan found" });

        const row = results[0];
        const cycleDays = row.cycle_days;
        const todayIndex = ((row.current_day_index - 1) % cycleDays) + 1;
        const tomorrowIndex = ((row.current_day_index) % cycleDays) + 1;

        // 查询 today
        const todaySql = `
            SELECT day_index, muscle_groups
            FROM workout_template_days
            WHERE template_id = ? AND day_index = ?
            LIMIT 1
        `;

        // 查询 tomorrow
        const tomorrowSql = `
            SELECT day_index, muscle_groups
            FROM workout_template_days
            WHERE template_id = ? AND day_index = ?
            LIMIT 1
        `;

        db.query(todaySql, [row.template_id, todayIndex], (err1, todayResults) => {
            if (err1) return res.status(500).json({ message: "Today lookup error", error: err1 });

            db.query(tomorrowSql, [row.template_id, tomorrowIndex], (err2, tomorrowResults) => {
                if (err2) return res.status(500).json({ message: "Tomorrow lookup error", error: err2 });

                const todayRow = todayResults[0];
                const tomorrowRow = tomorrowResults[0];

                const today = todayRow
                    ? {
                          name: `Day ${todayRow.day_index}`,
                          muscleGroups: todayRow.muscle_groups.split(",")
                      }
                    : {
                          name: `Day ${todayIndex}`,
                          muscleGroups: ["Rest"]
                      };

                const upcoming = tomorrowRow
                    ? {
                          name: `Day ${tomorrowRow.day_index}`,
                          muscleGroups: tomorrowRow.muscle_groups.split(",")
                      }
                    : {
                          name: `Day ${tomorrowIndex}`,
                          muscleGroups: ["Rest"]
                      };

                res.json({ today, upcoming });
            });
        });
    });
});

// 获取一周安排
router.get("/schedule", authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT 
            u.start_date,
            u.current_day_index,
            t.id AS template_id,
            t.cycle_days,
            d.day_index,
            d.muscle_groups
        FROM user_workouts u
        JOIN workout_templates t ON u.template_id = t.id
        JOIN workout_template_days d ON t.id = d.template_id
        WHERE u.user_id = ? AND u.is_active = TRUE
        ORDER BY d.day_index ASC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "No active workout plan found" });

        const baseDayIndex = results[0].current_day_index;
        const cycleDays = results[0].cycle_days;

        const dayMap = {};
        results.forEach(row => {
            dayMap[row.day_index] = row.muscle_groups;
        });

        const days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);

            const dayIndex = ((baseDayIndex - 1 + i) % cycleDays) + 1;
            const muscleGroups = dayMap[dayIndex];

            return {
                date: date.toISOString().split("T")[0],
                dayIndex,
                muscleGroups: muscleGroups ? muscleGroups.split(",") : ["Rest"]
            };
        });

        res.json({ days });
    });
});

router.get("/detail", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const targetDate = req.query.date;

    if (!targetDate) return res.status(400).json({ message: "Date is required" });

    try {
        const userWorkoutSql = `
            SELECT u.id AS user_workout_id, u.template_id, u.start_date, t.cycle_days
            FROM user_workouts u
            JOIN workout_templates t ON u.template_id = t.id
            WHERE u.user_id = ? AND u.is_active = TRUE
            LIMIT 1
        `;

        db.query(userWorkoutSql, [userId], async (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            if (results.length === 0) return res.status(404).json({ message: "No workout plan" });

            const { user_workout_id, template_id, start_date, cycle_days } = results[0];
            const daysPassed = Math.floor((new Date(targetDate) - new Date(start_date)) / (1000 * 60 * 60 * 24));
            if (daysPassed < 0) return res.status(400).json({ message: "Date is before workout start" });

            const dayIndex = ((daysPassed % cycle_days) + 1);

            // 查 muscle group
            const daySql = `
                SELECT muscle_groups
                FROM workout_template_days
                WHERE template_id = ? AND day_index = ?
            `;

            db.query(daySql, [template_id, dayIndex], async (err2, dayRows) => {
                if (err2) return res.status(500).json({ message: "Day query error", error: err2 });
                if (dayRows.length === 0) {
                    return res.json({ dayIndex, exercises: {}, message: "Rest day" });
                }

                const muscleGroups = dayRows[0].muscle_groups.split(",");

                // 查练习动作
                const exSql = `
                    SELECT *
                    FROM user_workout_exercises
                    WHERE user_workout_id = ?
                `;

                db.query(exSql, [user_workout_id], async (err3, exerciseRows) => {
                    if (err3) return res.status(500).json({ message: "Exercise fetch error", error: err3 });

                    const filtered = exerciseRows.filter(ex => muscleGroups.includes(ex.muscle_group));
                    const ids = filtered.map(ex => ex.exercise_id);
                    const exerciseDetails = {};

                    // 获取详情图等
                    await Promise.all(ids.map(async (id) => {
                        try {
                            const detailRes = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`, {
                                headers: {
                                    "X-RapidAPI-Key": process.env.EXERCISE_API_KEY,
                                    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
                                }
                            });
                            exerciseDetails[id] = detailRes.data;
                        } catch (e) {
                            console.warn("Failed to fetch", id);
                        }
                    }));

                    // ✅ 查当天是否有已保存的 log
                    const logSql = `
                        SELECT *
                        FROM user_exercise_logs
                        WHERE user_workout_id = ? AND log_date = ?
                    `;

                    db.query(logSql, [user_workout_id, targetDate], (logErr, logRows) => {
                        if (logErr) return res.status(500).json({ message: "Log query error", error: logErr });

                        // 将日志整理成：{ exercise_id: [ set1, set2, ... ] }
                        const logMap = {};
                        logRows.forEach(log => {
                            const exId = log.exercise_id;
                            if (!logMap[exId]) logMap[exId] = [];
                            logMap[exId].push({
                                set_number: log.set_number,
                                weight: log.weight,
                                reps: log.reps,
                                completed: !!log.completed,
                                rpe: log.rpe
                            });
                        });

                        // 组装返回结构
                        const grouped = {};
                        for (const ex of filtered) {
                            const group = ex.muscle_group;
                            if (!grouped[group]) grouped[group] = [];

                            // 有日志就用日志，否则按模板生成
                            const setsArray = logMap[ex.exercise_id]
                                ? logMap[ex.exercise_id]
                                : Array(ex.sets).fill().map(() => ({
                                      weight: ex.weight || 0,
                                      reps: ex.reps || 0,
                                      completed: false,
                                      rpe: 'normal'
                                  }));

                            // 按 set_number 排序
                            setsArray.sort((a, b) => a.set_number - b.set_number);

                            grouped[group].push({
                                id: ex.id,
                                exercise_id: ex.exercise_id,
                                sets: setsArray,
                                reps: ex.reps,
                                weight: ex.weight,
                                rest_time: ex.rest_time,
                                details: exerciseDetails[ex.exercise_id] || null
                            });
                        }

                        res.json({ dayIndex, exercises: grouped });
                    });
                });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err });
    }
});

// 删除用户训练动作
router.delete("/exercise/:exerciseId", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const exerciseId = req.params.exerciseId;

    // 首先验证这个动作是否属于该用户
    const checkSql = `
        SELECT uwe.id
        FROM user_workout_exercises uwe
        JOIN user_workouts uw ON uwe.user_workout_id = uw.id
        WHERE uw.user_id = ? AND uwe.id = ?
    `;

    db.query(checkSql, [userId, exerciseId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "Exercise not found or unauthorized" });

        // 删除动作
        const deleteSql = `DELETE FROM user_workout_exercises WHERE id = ?`;
        db.query(deleteSql, [exerciseId], (deleteErr) => {
            if (deleteErr) return res.status(500).json({ message: "Failed to delete exercise", error: deleteErr });
            res.json({ message: "Exercise deleted successfully" });
        });
    });
});

router.post(
    "/exercise",
    authenticateToken,
    (req, res) => {
      const userId = req.user.id;
      const {
        exercise_id,
        muscle_group,
        sets,
        reps,
        weight = 0,
        rest_time = 60
      } = req.body;
  
      // Validate required fields
      if (
        !exercise_id ||
        !muscle_group ||
        typeof sets !== "number" ||
        typeof reps !== "number"
      ) {
        return res
          .status(400)
          .json({ error: "exercise_id, muscle_group, sets and reps are required" });
      }
  
      // Find the currently active workout for this user
      const findWorkoutSql = `
        SELECT id
        FROM user_workouts
        WHERE user_id = ? AND is_active = TRUE
        LIMIT 1
      `;
      db.query(findWorkoutSql, [userId], (err, rows) => {
        if (err) {
          console.error("Error finding active workout:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (rows.length === 0) {
          return res
            .status(404)
            .json({ error: "No active workout found for this user" });
        }
  
        const user_workout_id = rows[0].id;
  
        // Insert the new exercise into user_workout_exercises
        const insertSql = `
          INSERT INTO user_workout_exercises
            (user_workout_id, exercise_id, sets, reps, weight, rest_time, muscle_group)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          user_workout_id,
          exercise_id,
          sets,
          reps,
          weight,
          rest_time,
          muscle_group
        ];
  
        db.query(insertSql, params, (insertErr, result) => {
          if (insertErr) {
            console.error("Error inserting new exercise:", insertErr);
            return res.status(500).json({ error: "Failed to add exercise" });
          }
  
          // Return the newly created record
          res.status(201).json({
            id: result.insertId,
            user_workout_id,
            exercise_id,
            sets,
            reps,
            weight,
            rest_time,
            muscle_group
          });
        });
      });
    }
  );

// 更新练习
router.put("/exercise/:id", authenticateToken, async (req, res) => {
    const exerciseId = req.params.id;
    const { exercise_id, sets, reps, rest_time } = req.body;
    const userId = req.user.id;

    // 首先验证这个练习是否属于当前用户
    const checkSql = `
        SELECT uwe.id 
        FROM user_workout_exercises uwe
        JOIN user_workouts uw ON uwe.user_workout_id = uw.id
        WHERE uwe.id = ? AND uw.user_id = ?
    `;

    db.query(checkSql, [exerciseId, userId], (checkErr, checkResults) => {
        if (checkErr) {
            console.error("Check ownership error:", checkErr);
            return res.status(500).json({ error: "Database error" });
        }

        if (checkResults.length === 0) {
            return res.status(403).json({ error: "Not authorized to update this exercise" });
        }

        // 更新练习
        const updateSql = `
            UPDATE user_workout_exercises 
            SET exercise_id = ?, sets = ?, reps = ?, rest_time = ?
            WHERE id = ?
        `;

        db.query(updateSql, [exercise_id, sets, reps, rest_time, exerciseId], (updateErr, updateResults) => {
            if (updateErr) {
                console.error("Update exercise error:", updateErr);
                return res.status(500).json({ error: "Failed to update exercise" });
            }

            res.json({ message: "Exercise updated successfully" });
        });
    });
});

// 保存训练日志
router.post("/save-log", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { date, exercises } = req.body;

    if (!date || !Array.isArray(exercises)) {
        return res.status(400).json({ message: "Invalid request body" });
    }

    const findWorkoutSql = `
        SELECT id FROM user_workouts WHERE user_id = ? AND is_active = TRUE
    `;

    db.query(findWorkoutSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "No active workout found" });

        const userWorkoutId = results[0].id;

        const checkSessionSql = `
            SELECT id FROM user_workout_sessions 
            WHERE user_workout_id = ? AND session_date = ?
            LIMIT 1
        `;

        db.query(checkSessionSql, [userWorkoutId, date], (err2, sessionRows) => {
            if (err2) return res.status(500).json({ message: "Failed to check session", error: err2 });

            if (sessionRows.length > 0) {
                const sessionId = sessionRows[0].id;
                insertLogs(userWorkoutId, sessionId, date, exercises, res);
            } else {
                const insertSessionSql = `
                    INSERT INTO user_workout_sessions (user_workout_id, session_date, day_index, completed)
                    VALUES (?, ?, 1, TRUE)
                `;

                db.query(insertSessionSql, [userWorkoutId, date], (err3, insertResult) => {
                    if (err3) return res.status(500).json({ message: "Failed to create session", error: err3 });

                    const sessionId = insertResult.insertId;
                    insertLogs(userWorkoutId, sessionId, date, exercises, res);
                });
            }
        });
    });
});

// 插入动作日志（改好了）
function insertLogs(userWorkoutId, sessionId, date, exercises, res) {
    const deleteLogSql = `
        DELETE FROM user_exercise_logs 
        WHERE session_id = ?
    `;

    db.query(deleteLogSql, [sessionId], (deleteErr) => {
        if (deleteErr) {
            return res.status(500).json({ message: "Failed to delete existing logs", error: deleteErr });
        }

        if (exercises.length === 0) {
            return res.json({ message: "Logs cleared successfully!" });  // exercises 空，直接返回
        }

        const logs = exercises.map(ex => [
            userWorkoutId,
            sessionId,
            ex.exercise_id,
            date,
            ex.set_number,
            ex.weight,
            ex.reps,
            ex.rpe || 'normal',
            ex.completed ? 1 : 0
        ]);

        const insertLogSql = `
            INSERT INTO user_exercise_logs 
            (user_workout_id, session_id, exercise_id, log_date, set_number, weight, reps, rpe, completed)
            VALUES ?
        `;

        db.query(insertLogSql, [logs], (insertErr) => {
            if (insertErr) {
                return res.status(500).json({ message: "Failed to save logs", error: insertErr });
            }

            res.json({ message: "Workout logged successfully!" });
        });
    });
}

// 1. 获取月度训练历史（修正版）
// ==========================
router.get('/history', authenticateToken, (req, res) => {
    const { year, month } = req.query;
    const userId = req.user.id;

    // 用 session 的主键 uws.id 做 GROUP BY，避免 ONLY_FULL_GROUP_BY 报错
    const query = `
        SELECT 
            uws.id AS session_id,
            uws.session_date,
            uws.completed,
            wt.name,
            COUNT(DISTINCT uel.exercise_id) AS exercise_count
        FROM user_workout_sessions uws
        JOIN user_workouts uw ON uws.user_workout_id = uw.id
        JOIN workout_templates wt ON uw.template_id = wt.id
        LEFT JOIN user_exercise_logs uel 
               ON uws.id = uel.session_id
        WHERE YEAR(uws.session_date) = ?
          AND MONTH(uws.session_date) = ?
          AND uw.user_id = ?
        GROUP BY uws.id  -- 按主键分组
    `;

    db.query(query, [year, month, userId], (err, results) => {
        if (err) {
            console.error('Error fetching workout history:', err);
            return res.status(500).json({ error: 'Failed to fetch workout history' });
        }

        // 整理成 { "yyyy-mm-dd": {...}, ... }
        const workoutData = {};
        results.forEach(row => {
            const dateObj = new Date(row.session_date);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
        
            workoutData[dateStr] = {
                name: row.name,
                completed: !!row.completed,
                exerciseCount: row.exercise_count
            };
        });

        res.json(workoutData);
    });
});


router.get('/history/:date', authenticateToken, async (req, res) => {
    const { date } = req.params;
    const userId = req.user.id;

    const sessionQuery = `
        SELECT 
            uws.id AS session_id,
            wt.name,
            uws.completed,
            uws.duration_seconds,
            uws.notes
        FROM user_workout_sessions uws
        JOIN user_workouts uw ON uws.user_workout_id = uw.id
        JOIN workout_templates wt ON uw.template_id = wt.id
        WHERE DATE(uws.session_date) = DATE(?)
          AND uw.user_id = ?
        LIMIT 1
    `;

    db.query(sessionQuery, [date, userId], (sessionErr, sessionRows) => {
        if (sessionErr) {
            console.error('Error fetching session:', sessionErr);
            return res.status(500).json({ error: 'Failed to fetch session' });
        }

        if (sessionRows.length === 0) {
            return res.json(null);
        }

        const session = sessionRows[0]; 

        const logsQuery = `
            SELECT 
                uwe.muscle_group,
                uel.exercise_id,
                uel.set_number,
                uel.weight,
                uel.reps,
                uel.rpe,
                uel.completed,
                uel.notes
            FROM user_exercise_logs uel
            JOIN user_workout_exercises uwe 
                ON  uel.exercise_id = uwe.exercise_id
                AND uel.user_workout_id = uwe.user_workout_id
            WHERE uel.session_id = ?
            ORDER BY uel.exercise_id, uel.set_number
        `;

        db.query(logsQuery, [session.session_id], async (logsErr, logs) => {
            if (logsErr) {
                console.error('Error fetching logs:', logsErr);
                return res.status(500).json({ error: 'Failed to fetch exercise logs' });
            }

            // 🔥 先按 exercise_id 分组
            const exercises = {};
            for (const log of logs) {
                if (!exercises[log.exercise_id]) {
                    exercises[log.exercise_id] = {
                        exerciseId: log.exercise_id,
                        muscleGroup: log.muscle_group,
                        sets: []
                    };
                }
                exercises[log.exercise_id].sets.push({
                    set_number: log.set_number,
                    weight: log.weight,
                    reps: log.reps,
                    rpe: log.rpe,
                    completed: !!log.completed,
                    notes: log.notes
                });
            }

            // 🔥 获取每个 exercise 的名称和图片
            const exerciseIds = Object.keys(exercises);

            await Promise.all(exerciseIds.map(async (id) => {
                try {
                    const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`, {
                        headers: {
                            'X-RapidAPI-Key': process.env.EXERCISE_API_KEY,
                            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
                        }
                    });
                    exercises[id].name = response.data.name;
                    exercises[id].image = response.data.gifUrl;
                } catch (error) {
                    console.warn(`Failed to fetch details for exercise ${id}`, error.message);
                    exercises[id].name = "Unknown Exercise";
                    exercises[id].image = "";
                }
            }));

            res.json({
                name: session.name,
                completed: !!session.completed,
                duration: session.duration_seconds,
                notes: session.notes,
                exercises: Object.values(exercises)
            });
        });
    });
});


module.exports = router;