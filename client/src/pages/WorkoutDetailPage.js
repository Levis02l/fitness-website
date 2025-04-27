import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Container, Typography, CircularProgress, Box, Button } from "@mui/material";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import API from "../api";
import MuscleGroupSection from "../components/Workout/MuscleGroupSection";

const WorkoutDetailPage = () => {
    const { date } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ dayIndex: 0, exercises: {} });

    // 判断是否是今天的日期
    const isToday = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return date === today;
    }, [date]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await API.get(`/workouts/detail?date=${date}`);
            setData(res.data || {});
        } catch (error) {
            console.error("Error fetching workout detail:", error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchData();
    }, [fetchData, location.key]);

    const handleExerciseChange = (group, updatedExercises) => {
        setData((prevData) => ({
            ...prevData,
            exercises: {
                ...prevData.exercises,
                [group]: updatedExercises
            }
        }));
    };

    const handleCompleteWorkout = async () => {
        try {
            const exercisesToSave = [];

            Object.values(data.exercises).forEach(group => {
                group.forEach(ex => {
                    if (!ex.sets || ex.sets.length === 0) return;

                    ex.sets.forEach((set, index) => {
                        exercisesToSave.push({
                            exercise_id: ex.exercise_id,
                            set_number: index + 1,
                            weight: set.weight,
                            reps: set.reps,
                            rpe: "normal",
                            completed: set.completed || false
                        });
                    });
                });
            });

            await API.post("/workouts/save-log", {
                date,
                exercises: exercisesToSave
            });

            alert("Workout saved successfully!");
        } catch (error) {
            console.error("Error saving workout:", error);
            alert("Failed to save workout log!");
        }
    };

    if (loading) {
        return (
            <Container sx={{ mt: 8, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading workout for {date}...
                </Typography>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="md" sx={{ mt: 6, mb: 10 }}>
                <Typography variant="h4" sx={{ mb: 4 }}>
                    Day {data.dayIndex} · {date}
                </Typography>

                {Object.keys(data.exercises).length === 0 ? (
                    <Typography variant="h6" color="text.secondary">
                        Rest day! No exercises scheduled.
                    </Typography>
                ) : (
                    Object.entries(data.exercises).map(([group, exList]) => (
                        <MuscleGroupSection 
                            key={group} 
                            group={group} 
                            exercises={exList}
                            onExerciseChange={handleExerciseChange}
                        />
                    ))
                )}
            </Container>

            {isToday() && Object.keys(data.exercises).length > 0 && (
                <Box 
                    sx={{ 
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        py: 2,
                        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
                    }}
                >
                    <Container maxWidth="md">
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<FitnessCenterIcon />}
                            onClick={handleCompleteWorkout}
                            sx={{
                                py: 1.5,
                                borderRadius: 8,
                                fontSize: '1rem',
                                bgcolor: '#2196f3',
                                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                                '&:hover': {
                                    bgcolor: '#1976d2',
                                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            Complete Workout
                        </Button>
                    </Container>
                </Box>
            )}
        </>
    );
};

export default WorkoutDetailPage;

