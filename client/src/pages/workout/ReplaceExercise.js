import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import API from '../../api';

// 肌肉组到 bodyPart 的映射（全部使用小写）
const muscleGroupToBodyPart = {
  'chest': 'chest',
  'back': 'back',
  'shoulders': 'shoulders',
  'legs': 'upper legs',
  'arms': 'upper arms',
  'biceps': 'upper arms',
  'triceps': 'upper arms',
  'core': 'waist',
  'pectorals': 'chest'
};

const ReplaceExercise = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { muscle_group, originalExercise, date } = location.state || {};

  useEffect(() => {
    const fetchExercises = async () => {
      if (!muscle_group) {
        setLoading(false);
        return;
      }

      try {
        console.log('Original muscle_group:', muscle_group);
        const lowerMuscleGroup = muscle_group.toLowerCase();
        const bodyPart = muscleGroupToBodyPart[lowerMuscleGroup] || lowerMuscleGroup;
        console.log('Mapped bodyPart:', bodyPart);
        
        const response = await API.get(`/exercises/bodyPart/${bodyPart}`);
        if (response.data) {
          setExercises(response.data);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [muscle_group]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleOpenLibrary = () => {
    navigate('/exercise-library');
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleReplaceExercise = async () => {
    if (!selectedExercise || !originalExercise) {
      console.error('Missing required data:', { selectedExercise, originalExercise });
      return;
    }

    try {
      console.log('Selected exercise:', selectedExercise);
      console.log('Original exercise:', originalExercise);

      if (location.state?.isAdding) {
        // 添加新运动
        const response = await API.post("/workouts/exercise", {
          exercise_id: selectedExercise.id,
          muscle_group: originalExercise.muscle_group,
          sets: originalExercise.sets.length || originalExercise.sets,
          reps: originalExercise.reps,
          weight: originalExercise.weight,
          rest_time: originalExercise.rest_time
        });

        if (response.data) {
          console.log('Exercise added successfully:', response.data);
        }
      } else {
        // 替换现有运动
        if (!originalExercise.id) {
          console.error('Missing original exercise ID!');
          return;
        }

        const response = await API.put(`/workouts/exercise/${originalExercise.id}`, {
          exercise_id: selectedExercise.id,
          sets: originalExercise.sets.length,
          reps: originalExercise.reps,
          rest_time: originalExercise.rest_time,
          muscle_group: selectedExercise.bodyPart
        });

        if (response.data) {
          console.log('Exercise replaced successfully:', response.data);
        }
      }

      // 导航回详情页面
      if (date) {
        navigate(`/workout-detail/${date}`, { replace: true });
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error handling exercise:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  // 修改按钮文本
  const buttonText = location.state?.isAdding ? "Add Exercise" : "Replace Now";

  // 添加一个按钮点击事件处理函数
  const handleReplaceButtonClick = () => {
    if (!selectedExercise) {
      console.error('No exercise selected');
      return;
    }
    console.log('Replace button clicked with:', {
      selectedExercise,
      originalExercise
    });
    handleReplaceExercise();
  };

  if (!muscle_group) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3 }, mb: 4 }}>
        <Typography variant="h6" color="error">No muscle group specified</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3 }, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} sx={{ color: 'primary.main' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Back
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleOpenLibrary}
          sx={{ borderRadius: 2 }}
        >
          Exercise Library
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textTransform: 'capitalize' }}>
            {muscle_group} Exercises
          </Typography>

          <Grid container spacing={2}>
            {exercises.map((exercise) => (
              <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    border: selectedExercise?.id === exercise.id ? '2px solid #1976d2' : 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      transition: 'all 0.2s'
                    }
                  }}
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                      p: 2
                    }}
                  >
                    {exercise.gifUrl ? (
                      <Box
                        component="img"
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary">No image available</Typography>
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {exercise.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ 
            position: 'fixed', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '500px',
            zIndex: 1000
          }}>
            <Button
              variant="contained"
              fullWidth
              disabled={!selectedExercise}
              onClick={handleReplaceButtonClick}
              sx={{ 
                borderRadius: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ReplaceExercise; 