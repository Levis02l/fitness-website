import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Container, 
    Typography, 
    Box, 
    TextField, 
    Button, 
    Grid, 
    Card, 
    CardMedia, 
    CardContent,
    Paper,
    InputAdornment,
    Tooltip,
    IconButton
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import API from "../../api"; // ✅ 确保 API 请求统一管理

const SetupWorkout = () => {
    const { id } = useParams(); // ✅ 获取 URL 中的 template_id
    const navigate = useNavigate();

    // ✅ 存储用户输入的三大项重量
    const [weights, setWeights] = useState({
        squat: "",
        bench: "",
        deadlift: "",
    });

    // ✅ 监听输入变化 & 进行校验
    const handleChange = (e) => {
        let value = e.target.value;
        if (value < 0) value = 0; // ❌ 不允许负数
        if (value > 300) value = 300; // ❌ 限制最大值
        setWeights({ ...weights, [e.target.name]: value });
    };

    // ✅ 提交训练计划
    const handleSubmit = async () => {
        if (!weights.squat || !weights.bench || !weights.deadlift) {
            alert("Please enter valid weights for all three exercises.");
            return;
        }

        try {
            const response = await API.post("/user-workouts", {
                template_id: id,  // ✅ 训练模板 ID 从 URL 获取
                start_date: new Date().toISOString().split("T")[0], // ✅ 获取当前日期
                squat_weight: parseFloat(weights.squat),
                bench_weight: parseFloat(weights.bench),
                deadlift_weight: parseFloat(weights.deadlift),
                current_day_index: 1, // ✅ 训练计划从第一天开始
            });

            if (response.status === 201) {
                navigate("/"); // ✅ 计划创建成功，跳转到 Dashboard
            } else {
                alert("Failed to create workout plan. Please try again.");
            }
        } catch (error) {
            console.error("Error creating workout plan:", error);
            alert("An error occurred while creating your workout plan.");
        }
    };

    const exercises = [
        {
            name: "squat",
            label: "Squat",
            img: "https://images.squarespace-cdn.com/content/v1/5160bb45e4b0e13a258812c8/1461710352505-SKT6BKQF6QX5T2NPHOWV/image-asset.jpeg",
            tooltip: "Enter your one-rep maximum weight for squats"
        },
        {
            name: "bench",
            label: "Bench Press",
            img: "https://www.bodybuilding.com/images/2016/june/bench-press-tips-for-max-strength-header-v2-830x467.jpg",
            tooltip: "Enter your one-rep maximum weight for bench press"
        },
        {
            name: "deadlift",
            label: "Deadlift",
            img: "https://www.bodybuilding.com/images/2017/march/deadlifts-should-you-train-them-with-back-or-legs-header-v2-830x467.jpg",
            tooltip: "Enter your one-rep maximum weight for deadlifts"
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 9 }, mb: 4 }}>
            <Box sx={{ mb: 6 }}>
                <Typography 
                    variant="h3" 
                    sx={{
                        fontWeight: 700,
                        textAlign: "center",
                        mb: 2,
                        color: "text.primary",
                        fontSize: { xs: "2rem", sm: "3rem" }
                    }}
                >
                    Set Up Your Workout Plan
                </Typography>
                <Typography 
                    variant="h6" 
                    sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        maxWidth: "800px",
                        mx: "auto",
                        lineHeight: 1.6
                    }}
                >
                    Enter your maximum weights for the three major lifts to help us customize your training program
                </Typography>
            </Box>

            <Paper
                elevation={2}
                sx={{
                    p: 4,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    mb: 4
                }}
            >
                <Grid container spacing={4}>
                    {exercises.map((exercise) => (
                        <Grid item xs={12} md={4} key={exercise.name}>
                            <Card 
                                sx={{ 
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height={240}
                                    image={exercise.img}
                                    alt={exercise.label}
                                    sx={{
                                        objectFit: "cover"
                                    }}
                                />
                                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontWeight: 600,
                                                mb: 0.5
                                            }}
                                        >
                                            {exercise.label}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                        >
                                            Enter your one-rep maximum
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        name={exercise.name}
                                        value={weights[exercise.name]}
                                        onChange={handleChange}
                                        type="number"
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography color="text.secondary">kg</Typography>
                                                    <Tooltip title={exercise.tooltip} arrow>
                                                        <IconButton size="small" sx={{ ml: 0.5 }}>
                                                            <InfoIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                            inputProps: { 
                                                min: 0, 
                                                max: 300,
                                                style: { 
                                                    textAlign: "center",
                                                    fontSize: "1.2rem",
                                                    padding: "12px"
                                                }
                                            }
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Box 
                sx={{ 
                    display: "flex", 
                    justifyContent: "center"
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    sx={{
                        py: 2,
                        px: 6,
                        borderRadius: 2,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        "&:hover": {
                            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                        }
                    }}
                >
                    Start Your Training Plan
                </Button>
            </Box>
        </Container>
    );
};

export default SetupWorkout;
