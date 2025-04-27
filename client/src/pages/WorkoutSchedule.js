// src/pages/WorkoutSchedule.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import {
  Container, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  CardActionArea,
  Stack
} from "@mui/material";
import {
  FitnessCenter as FitnessCenterIcon,
  CalendarToday as CalendarIcon
} from "@mui/icons-material";

// 为不同肌群定义图片
const muscleGroupImages = {
  'chest': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1740',
  'back': 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=1740',
  'shoulders': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1740',
  'legs': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=1740',
  'arms': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1740',
  'core': 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1740',
  'default': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1740'
};

const WorkoutSchedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // 首先更新训练天数
        await API.get("/workouts/update-day");
        
        // 然后获取训练计划
        const res = await API.get("/workouts/schedule");
        setSchedule(res.data.days || []);
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      }
    };
    fetchSchedule();
  }, []);

  const handleTabChange = (_, newValue) => {
    setSelectedDateIndex(newValue);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      dayName: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()]
    };
  };

  const getImageForMuscleGroups = (muscleGroups) => {
    if (!muscleGroups || muscleGroups.length === 0) return muscleGroupImages.default;
    const primaryMuscle = muscleGroups[0].toLowerCase();
    return muscleGroupImages[primaryMuscle] || muscleGroupImages.default;
  };

  const handleCardClick = (date) => {
    navigate(`/workout-detail/${date}`);
  };

  const renderDayContent = () => {
    if (!schedule.length) return null;
    const today = schedule[selectedDateIndex];
    
    return (
      <Card 
        elevation={2}
        sx={{ 
          mt: 4,
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
            cursor: 'pointer'
          }
        }}
      >
        <CardActionArea onClick={() => handleCardClick(today.date)}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              py: 2,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CalendarIcon />
            <Typography variant="h6" fontWeight={600}>
              {today.date} · Training Day {today.dayIndex}
            </Typography>
          </Box>

          <Grid container>
            <Grid item xs={12} md={4}>
              <CardMedia
                component="img"
                height="300"
                image={getImageForMuscleGroups(today.muscleGroups)}
                alt="Workout"
                sx={{
                  objectFit: 'cover',
                  borderRight: { md: 1 },
                  borderColor: { md: 'divider' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <FitnessCenterIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Today's Focus
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {today.muscleGroups.map((group, index) => (
                    <Chip 
                      key={index}
                      label={group}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        borderRadius: 1,
                        fontSize: '1rem',
                        py: 0.5
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </CardActionArea>
      </Card>
    );
  };

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
          Weekly Workout Schedule
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
          Stay on track with your fitness goals by following your personalized training plan
        </Typography>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Tabs
          value={selectedDateIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 'auto',
            '& .MuiTabs-flexContainer': {
              gap: 0
            },
            '& .MuiTab-root': {
              minHeight: 'auto',
              py: 2,
              px: 1
            }
          }}
        >
          {schedule.map((day, idx) => {
            const { dayName, date, month } = formatDate(day.date);
            const isSelected = selectedDateIndex === idx;
            const isToday = idx === 0;
            
            return (
              <Tab 
                key={day.date}
                sx={{
                  opacity: 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&::after': isSelected ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    bgcolor: 'primary.main'
                  } : {},
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                label={
                  <Stack 
                    spacing={0.5} 
                    alignItems="center"
                    sx={{
                      color: isSelected ? 'primary.main' : 'text.primary'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: isToday ? 'primary.main' : 'text.secondary',
                        fontWeight: isToday ? 600 : 400
                      }}
                    >
                      {dayName}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: '1.25rem',
                        lineHeight: 1
                      }}
                    >
                      {date}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: isSelected ? 'primary.main' : 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    >
                      {month}
                    </Typography>
                  </Stack>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {renderDayContent()}
    </Container>
  );
};

export default WorkoutSchedule;
