import React, { useState } from "react";
import { Typography, Paper, Divider, Stack, Chip, Button } from "@mui/material";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';
import ExerciseCard from "./ExerciseCard";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const MuscleGroupSection = ({ group, exercises, onExerciseChange }) => {
    const [exerciseList, setExerciseList] = useState(exercises);
    const navigate = useNavigate();

    const handleDeleteExercise = async (exerciseToDelete) => {
        try {
            // 调用后端 API 删除运动
            await API.delete(`/workouts/exercise/${exerciseToDelete.id}`);
            
            // 删除成功后更新前端状态
            const updatedList = exerciseList.filter(exercise => exercise !== exerciseToDelete);
            setExerciseList(updatedList);
            if (onExerciseChange) {
                onExerciseChange(group, updatedList);
            }
        } catch (error) {
            console.error('Error deleting exercise:', error);
            // 这里可以添加错误提示
            alert('Failed to delete exercise. Please try again.');
        }
    };

    const handleSetsChange = (exerciseIndex, newSets) => {
        const updatedList = [...exerciseList];
        updatedList[exerciseIndex] = {
            ...updatedList[exerciseIndex],
            sets: newSets,
        };
        setExerciseList(updatedList);
        if (onExerciseChange) {
            onExerciseChange(group, updatedList); // 👈 改动 sets 后同步
        }
    };

    const handleAddExercise = () => {
        // 从当前 URL 获取日期
        const dateMatch = window.location.pathname.match(/\/workout-detail\/(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : null;

        // 创建导航状态
        const navigationState = {
            muscle_group: group,
            originalExercise: {
                muscle_group: group,
                sets: 3,  // 默认值
                reps: 12, // 默认值
                weight: 0,
                rest_time: 60 // 默认值
            },
            date: date,
            isAdding: true  // 标记这是添加操作
        };

        navigate('/replace-exercise', { state: navigationState });
    };

    return (
        <Paper elevation={0} sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <FitnessCenterIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {group}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Chip label={`${exerciseList.length} Exercises`} sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, borderRadius: 2, '& .MuiChip-label': { px: 2 } }} />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddExercise}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >
                        Add Exercise
                    </Button>
                </Stack>
            </Stack>

            <Divider sx={{ mb: 3, opacity: 0.6 }} />

            <Stack spacing={2}>
                {exerciseList.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id || index}
                        exercise={exercise}
                        onDelete={() => handleDeleteExercise(exercise)}
                        onSetsChange={(newSets) => handleSetsChange(index, newSets)}
                    />
                ))}
            </Stack>
        </Paper>
    );
};

export default MuscleGroupSection;
