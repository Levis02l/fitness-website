import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    IconButton,
    Grid,
    Paper,
    Dialog,
    DialogContent,
    DialogTitle
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import API from '../api';

const WorkoutHistory = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [workoutData, setWorkoutData] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const fetchMonthData = useCallback(async () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const response = await API.get(`/workouts/history?year=${year}&month=${month}`);
            setWorkoutData(response.data || {});
        } catch (error) {
            console.error('Error fetching workout history:', error);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchMonthData();
    }, [fetchMonthData]);

    const fetchDayDetail = async (date) => {
        try {
            const response = await API.get(`/workouts/history/${date}`);
            setSelectedWorkout(response.data);
            setDialogOpen(true);
        } catch (error) {
            console.error('Error fetching workout detail:', error);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        const firstDayWeek = firstDay.getDay() || 7;
        for (let i = firstDayWeek - 1; i > 0; i--) {
            const prevDate = new Date(year, month, 1 - i);
            days.push({
                date: prevDate,
                isCurrentMonth: false
            });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        const lastDayWeek = lastDay.getDay() || 7;
        for (let i = 1; i <= 7 - lastDayWeek; i++) {
            const nextDate = new Date(year, month + 1, i);
            days.push({
                date: nextDate,
                isCurrentMonth: false
            });
        }

        return days;
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const hasWorkout = (date) => {
        const dateStr = formatDate(date);
        return !!workoutData[dateStr];
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                Workout History
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={handlePrevMonth}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h5">
                        {currentDate.toLocaleString('en-US', { year: 'numeric', month: 'long' })}
                    </Typography>
                    <IconButton onClick={handleNextMonth}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>

                <Grid container spacing={1}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <Grid item xs={12 / 7} key={day}>
                            <Typography
                                align="center"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {day}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={1} sx={{ mt: 1 }}>
                    {getDaysInMonth(currentDate).map((day, index) => (
                        <Grid item xs={12 / 7} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    position: 'relative',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: hasWorkout(day.date)
                                        ? 'primary.light'
                                        : day.isCurrentMonth
                                            ? 'background.paper'
                                            : 'action.hover',
                                    borderRadius: 1,
                                    cursor: hasWorkout(day.date) ? 'pointer' : 'default',
                                    '&:hover': hasWorkout(day.date) ? {
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                    } : {}
                                }}
                                onClick={() => {
                                    console.log('Clicked day:', day.date);
                                    console.log('Formatted date (sent to backend):', formatDate(day.date));
                                    if (hasWorkout(day.date)) {
                                        fetchDayDetail(formatDate(day.date));
                                    }
                                }}
                            >
                                <Typography
                                    align="center"
                                    sx={{
                                        color: hasWorkout(day.date)
                                            ? 'white'
                                            : day.isCurrentMonth
                                                ? 'text.primary'
                                                : 'text.disabled'
                                    }}
                                >
                                    {day.date.getDate()}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6" fontWeight={600}>
                        Workout Details
                    </Typography>
                    <IconButton edge="end" color="inherit" onClick={() => setDialogOpen(false)} aria-label="close">
                        <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>×</Box>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {selectedWorkout ? (
                        <Box>
                            <Box sx={{ 
                                bgcolor: 'primary.light', 
                                color: 'white', 
                                py: 2, 
                                px: 3, 
                                textAlign: 'center'
                            }}>
                                <Typography variant="h5" fontWeight={600} gutterBottom>
                                    {selectedWorkout.name}
                                </Typography>
                                {selectedWorkout.duration && (
                                    <Typography variant="body2">
                                        Duration: {Math.floor(selectedWorkout.duration / 60)} min
                                    </Typography>
                                )}
                            </Box>
                            
                            <Box sx={{ p: 3 }}>
                                {selectedWorkout.exercises.map((exercise, index) => (
                                    <Box 
                                        key={index} 
                                        sx={{ 
                                            mb: 4,
                                            pb: 3,
                                            borderBottom: index < selectedWorkout.exercises.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2,
                                            mb: 2
                                        }}>
                                            {/* 显示图片 */}
                                            {exercise.image && (
                                                <Box sx={{ 
                                                    width: 80, 
                                                    height: 80, 
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}>
                                                    <img
                                                        src={exercise.image}
                                                        alt={exercise.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            )}
                                            
                                            <Box sx={{ flex: 1 }}>
                                                {/* 显示名字 */}
                                                <Typography variant="h6" fontWeight={600}>
                                                    {exercise.name}
                                                </Typography>
                                                {exercise.muscleGroup && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {exercise.muscleGroup}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        
                                        {/* 组集表格标题 */}
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '1fr 1fr 1fr 2fr', 
                                            gap: 1,
                                            mb: 1,
                                            py: 1,
                                            px: 2,
                                            bgcolor: 'action.hover',
                                            borderRadius: 1
                                        }}>
                                            <Typography variant="caption" fontWeight={600}>SET</Typography>
                                            <Typography variant="caption" fontWeight={600}>WEIGHT</Typography>
                                            <Typography variant="caption" fontWeight={600}>REPS</Typography>
                                            <Typography variant="caption" fontWeight={600}>RPE</Typography>
                                        </Box>
                                        
                                        {/* 显示每一组 set */}
                                        {exercise.sets.map((set, setIndex) => (
                                            <Box
                                                key={setIndex}
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr 1fr 2fr',
                                                    gap: 1,
                                                    py: 1,
                                                    px: 2,
                                                    borderRadius: 1,
                                                    bgcolor: set.completed ? 'success.light' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover'
                                                    },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <Typography fontWeight={500}>{set.set_number}</Typography>
                                                <Typography>{set.weight} kg</Typography>
                                                <Typography>{set.reps}</Typography>
                                                <Typography>{set.rpe || 'normal'}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No workout record found
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default WorkoutHistory; 