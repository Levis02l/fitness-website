import React from "react";
import { useParams } from "react-router-dom";
import { 
    Container, 
    Typography, 
    Box, 
    Card, 
    CardMedia, 
    CardContent, 
    Button, 
    Grid,
    Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AccessTime, FitnessCenter, Grade } from "@mui/icons-material";

// 训练计划数据
const trainingPlans = {
    "1": {
        title: "Three-Day Split (三分化训练)",
        description: "The Three-Day Split is a classic workout program designed to optimize muscle recovery and growth. This approach divides your training into chest & triceps, back & biceps, and legs & shoulders, ensuring each muscle group gets adequate intensity and recovery. The train 3 days, rest 1 day cycle allows for efficient muscle repair and continuous progress.",
        imageUrl: "https://www.hevyapp.com/wp-content/uploads/2020/03/3daysplit-bodybuilder-1-1536x992.png",
        trainingCycle: "Train 3 Days, Rest 1 Day",
        bestFor: "Intermediate Lifters",
        benefits: [
            "✅ **Optimal Recovery**: Each muscle has at least 48 hours to recover before being trained again.",
            "✅ **Progressive Overload**: Focus on fewer muscle groups allows for heavier weights and higher intensity.",
            "✅ **Ideal Balance of Volume & Intensity**: Sufficient volume with high training intensity.",
            "✅ **Prevents Overtraining**: The 3:1 ratio (three days of training, one rest day) ensures optimal recovery."
        ],
        keyExercises: [
            { name: "Bench Press", img: "https://www.gymshark.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F8urtyqugdt2l%2F6wwaiNHx2VszPrqleSeb01%2Ffff4527f2395dc93c67f4a9947ecfc18%2Fmobile-bench-press.jpg&w=3840&q=85" },
            { name: "Deadlift", img: "https://images.ctfassets.net/8urtyqugdt2l/5ZN0GgcR2fSncFwnKuL1RP/e603ba111e193d35510142c7eff9aae4/desktop-deadlift.jpg" },
            { name: "Squat", img: "https://hips.hearstapps.com/hmg-prod/images/man-training-with-weights-royalty-free-image-1718637105.jpg?crop=0.670xw:1.00xh;0.138xw,0&resize=1200:*" }
        ]
    },
    "2": {
        title: "Four-Day Split (四分化训练)",
        description: "The Four-Day Split is designed for intermediate and advanced lifters who want to increase training volume while maintaining recovery. This program ensures each major muscle group receives dedicated attention, optimizing hypertrophy and strength.",
        imageUrl: "https://www.hevyapp.com/wp-content/uploads/2020/06/4-day-split-push-pull-1024x606.jpg",
        trainingCycle: "Train 4 Days, Rest 1 Day",
        bestFor: "Intermediate to Advanced Lifters",
        benefits: [
            "✅ **Increased Training Volume**: Each muscle group gets more exercises, leading to greater hypertrophy.",
            "✅ **Better Recovery Than a 5-Day Split**: One rest day prevents excessive fatigue accumulation.",
            "✅ **Balanced Strength & Aesthetic Gains**: Effective mix of compound and isolation movements."
        ],
        keyExercises: [
            { name: "Bench Press", img: "https://www.gymshark.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F8urtyqugdt2l%2F6wwaiNHx2VszPrqleSeb01%2Ffff4527f2395dc93c67f4a9947ecfc18%2Fmobile-bench-press.jpg&w=3840&q=85" },
            { name: "Deadlift", img: "https://images.ctfassets.net/8urtyqugdt2l/5ZN0GgcR2fSncFwnKuL1RP/e603ba111e193d35510142c7eff9aae4/desktop-deadlift.jpg" },
            { name: "Squat", img: "https://hips.hearstapps.com/hmg-prod/images/man-training-with-weights-royalty-free-image-1718637105.jpg?crop=0.670xw:1.00xh;0.138xw,0&resize=1200:*" }
        ]
    },
    "3": {
        title: "Five-Day Split (五分化训练)",
        description: "The Five-Day Split is a high-frequency program designed for advanced lifters who want to maximize muscle growth by dedicating separate training days to individual muscle groups. This approach ensures each muscle is trained with maximum intensity.",
        imageUrl: "https://www.hevyapp.com/wp-content/uploads/2020/09/bro-split-1024x518.jpg",
        trainingCycle: "Train 5 Days, Rest 2 Days",
        bestFor: "Advanced Lifters",
        benefits: [
            "✅ **Maximum Muscle Focus**: Each muscle group gets undivided attention for better activation.",
            "✅ **Ideal for Muscle Definition**: Enables high-intensity training with adequate volume.",
            "✅ **Highly Customizable**: Can be adapted for strength, hypertrophy, or endurance training."
        ],
        keyExercises: [
            { name: "Bench Press", img: "https://www.gymshark.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F8urtyqugdt2l%2F6wwaiNHx2VszPrqleSeb01%2Ffff4527f2395dc93c67f4a9947ecfc18%2Fmobile-bench-press.jpg&w=3840&q=85" },
            { name: "Deadlift", img: "https://images.ctfassets.net/8urtyqugdt2l/5ZN0GgcR2fSncFwnKuL1RP/e603ba111e193d35510142c7eff9aae4/desktop-deadlift.jpg" },
            { name: "Squat", img: "https://hips.hearstapps.com/hmg-prod/images/man-training-with-weights-royalty-free-image-1718637105.jpg?crop=0.670xw:1.00xh;0.138xw,0&resize=1200:*" }
        ]
    }
};

const TrainingPlan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const plan = trainingPlans[id] || trainingPlans["1"];

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
                    {plan.title}
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
                    {plan.description}
                </Typography>
            </Box>

            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    mb: 6,
                    overflow: "hidden"
                }}
            >
                <Box 
                    component="img"
                    src={plan.imageUrl}
                    alt={plan.title}
                    sx={{
                        width: "100%",
                        height: { xs: 200, sm: 300, md: 400 },
                        objectFit: "cover",
                        borderRadius: 2,
                        mb: 3
                    }}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <AccessTime color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Training Cycle
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {plan.trainingCycle}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Grade color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Best For
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {plan.bestFor}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <FitnessCenter color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Focus
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            Strength & Muscle Growth
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            height: "100%"
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                mb: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
                        >
                            Program Benefits
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {plan.benefits.map((benefit, index) => (
                                <Typography 
                                    key={index} 
                                    variant="body1"
                                    sx={{
                                        color: "text.secondary",
                                        lineHeight: 1.6
                                    }}
                                >
                                    {benefit}
                                </Typography>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: "background.paper"
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                mb: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
                        >
                            Key Exercises
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {plan.keyExercises.map((exercise, index) => (
                                <Card 
                                    key={index}
                                    sx={{ 
                                        display: "flex",
                                        alignItems: "center",
                                        overflow: "hidden",
                                        borderRadius: 2
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        sx={{ 
                                            width: 120,
                                            height: 80,
                                            objectFit: "cover"
                                        }}
                                        image={exercise.img}
                                        alt={exercise.name}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" fontWeight={500}>
                                            {exercise.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Box 
                sx={{ 
                    display: "flex", 
                    justifyContent: "center",
                    mt: 6
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate(`/setup-workout/${id}`)}
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
                    Start This Training Plan
                </Button>
            </Box>
        </Container>
    );
};

export default TrainingPlan;
