import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  NavigateBefore,
  NavigateNext,
  Restaurant as RestaurantIcon,
  Fastfood as FastfoodIcon,
  DinnerDining as DinnerDiningIcon,
  LocalPizza as LocalPizzaIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Nutrition = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState(null);
  const [target, setTarget] = useState({
    template_name: '',
    protein_target: 0,
    carbs_target: 0,
    fat_target: 0,
    calorie_target: 0
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [error, setError] = useState('');

  const fetchDailyRecords = useCallback(async () => {
    try {
      setLoading(true);
      const date = selectedDate.toISOString().split('T')[0];
      const response = await API.get(`/nutrition/records?date=${date}`);
      setRecords(response.data);
    } catch (err) {
      console.error('Failed to fetch daily records:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchNutritionTarget();
    fetchDailyRecords();
  }, [selectedDate, fetchDailyRecords]);

  const fetchNutritionTarget = async () => {
    try {
      const response = await API.get('/nutrition/targets');
      setTarget(response.data.target);
    } catch (err) {
      console.error('Failed to fetch nutrition target:', err);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
    setCalendarOpen(false);
  };

  const formatDisplayDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const handleEditClick = (meal, event) => {
    event.stopPropagation();
    setSelectedMeal(meal);
    setNewWeight(meal.weight_in_grams.toString());
    setError('');
    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (meal, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this food?')) {
      try {
        await API.delete(`/nutrition/delete-meal/${meal.id}`);
        fetchDailyRecords(); // Refresh the records
      } catch (err) {
        console.error('Failed to delete meal:', err);
      }
    }
  };

  const handleSaveWeight = async () => {
    if (!newWeight || isNaN(newWeight) || parseFloat(newWeight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    try {
      await API.put(`/nutrition/update-meal/${selectedMeal.id}`, {
        weight_in_grams: parseFloat(newWeight)
      });
      setEditDialogOpen(false);
      fetchDailyRecords(); // Refresh the records
    } catch (err) {
      setError('Failed to update weight');
      console.error('Failed to update meal:', err);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: '#f5f5f5'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const summary = records?.summary || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: '100vh', 
      pt: 1,
      pb: 10,
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#000' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flex: 1 
          }}>
            <IconButton onClick={handlePrevDay} sx={{ color: '#000' }}>
              <NavigateBefore />
            </IconButton>
            <Button
              variant="contained"
              onClick={() => setCalendarOpen(true)}
              sx={{
                mx: 2,
                px: 4,
                py: 0.5,
                bgcolor: 'white',
                color: 'black',
                boxShadow: 'none',
                borderRadius: 3,
                '&:hover': {
                  bgcolor: 'white',
                  boxShadow: 'none',
                }
              }}
            >
              {formatDisplayDate(selectedDate)}
            </Button>
            <IconButton onClick={handleNextDay} sx={{ color: '#000' }}>
              <NavigateNext />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Calendar Dialog */}
      <Dialog 
        open={calendarOpen} 
        onClose={() => setCalendarOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Select Date
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& input': {
                  py: 1.5,
                  px: 2,
                  fontSize: '1rem'
                }
              }}
              InputProps={{
                sx: {
                  color: '#1976d2',
                  '&::-webkit-calendar-picker-indicator': {
                    cursor: 'pointer',
                    filter: 'invert(0.4) sepia(1) saturate(1.5) hue-rotate(190deg)',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1
                    }
                  }
                }
              }}
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setCalendarOpen(false)}
                sx={{ 
                  minWidth: 100,
                  color: '#666',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={() => setCalendarOpen(false)}
                sx={{ 
                  minWidth: 100,
                  borderRadius: 2,
                  bgcolor: '#1976d2',
                  '&:hover': {
                    bgcolor: '#1565c0'
                  }
                }}
              >
                OK
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <Box sx={{ 
        px: 2,
        maxWidth: '100%',
        overflowX: 'hidden',
        mb: 8
      }}>
        {/* Nutrition Summary Card */}
        <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 'none' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', mr: 1 }}>
                  {summary.calories}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  / Target {target.calorie_target} kcal
                </Typography>
              </Box>
              <Box>
                <Button 
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/nutrition/template')}
                  sx={{ 
                    mr: 1,
                    bgcolor: '#f0f0f0',
                    color: 'black',
                    boxShadow: 'none',
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Set Template
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: '#fff8f0',
                    textAlign: 'center',
                    borderRadius: 3,
                    boxShadow: 'none'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Protein (g)
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {summary.protein}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    / {target.protein_target}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {Math.round((summary.protein / target.protein_target) * 100)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: '#f0f8ff',
                    textAlign: 'center',
                    borderRadius: 3,
                    boxShadow: 'none'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Carbs (g)
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {summary.carbs}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    / {target.carbs_target}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {Math.round((summary.carbs / target.carbs_target) * 100)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: '#fff0f0',
                    textAlign: 'center',
                    borderRadius: 3,
                    boxShadow: 'none'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Fat (g)
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {summary.fat}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    / {target.fat_target}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {Math.round((summary.fat / target.fat_target) * 100)}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Meal Cards */}
        {records ? (
          <>
            {/* Only render meal sections that have records */}
            {Object.entries(records.meals).map(([mealType, meals]) => 
              meals.length > 0 ? (
                <Card 
                  key={mealType} 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 3, 
                    boxShadow: 'none',
                    bgcolor: 'white',
                    '&:hover': {
                      bgcolor: '#fafafa'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 2 
                    }}>
                      <Typography variant="h6" sx={{ 
                        textTransform: 'capitalize',
                        fontWeight: 500
                      }}>
                        {mealType}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'text.secondary',
                        '& > *': { fontSize: '0.875rem' }
                      }}>
                        <Typography sx={{ color: '#ff9800', mr: 1 }}>
                          {meals.reduce((sum, meal) => sum + parseFloat(meal.protein), 0).toFixed(1)}g
                        </Typography>
                        <Typography sx={{ color: '#2196f3', mr: 1 }}>
                          {meals.reduce((sum, meal) => sum + parseFloat(meal.carbs), 0).toFixed(1)}g
                        </Typography>
                        <Typography sx={{ color: '#f44336', mr: 1 }}>
                          {meals.reduce((sum, meal) => sum + parseFloat(meal.fat), 0).toFixed(1)}g
                        </Typography>
                        <Typography>
                          {meals.reduce((sum, meal) => sum + parseFloat(meal.calories), 0).toFixed(0)} kcal
                        </Typography>
                        <IconButton 
                          size="small" 
                          sx={{ 
                            ml: 1,
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.04)'
                            }
                          }}
                        >
                          <NavigateNext />
                        </IconButton>
                      </Box>
                    </Box>
                    {meals.map((meal, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: index < meals.length - 1 ? 2 : 0,
                          py: 1,
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            '& .action-buttons': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        <Box 
                          component="img"
                          src={meal.food_url || '/images/default-food.png'}
                          alt={meal.food_name}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: 2, 
                            mr: 2,
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 500 }}>
                            {meal.food_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {meal.weight_in_grams}g
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          '& > *': { fontSize: '0.875rem' }
                        }}>
                          <Typography sx={{ color: '#ff9800', mr: 1 }}>
                            {parseFloat(meal.protein).toFixed(1)}
                          </Typography>
                          <Typography sx={{ color: '#2196f3', mr: 1 }}>
                            {parseFloat(meal.carbs).toFixed(1)}
                          </Typography>
                          <Typography sx={{ color: '#f44336', mr: 1 }}>
                            {parseFloat(meal.fat).toFixed(1)}
                          </Typography>
                          <Typography color="text.secondary">
                            {parseFloat(meal.calories).toFixed(0)} kcal
                          </Typography>
                          <Box 
                            className="action-buttons"
                            sx={{ 
                              ml: 1,
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              display: 'flex'
                            }}
                          >
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleEditClick(meal, e)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleDeleteClick(meal, e)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ) : null
            )}
          </>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            color: '#999', 
            mt: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box 
              component="img" 
              src="/images/empty-plate.png" 
              alt="Empty plate"
              sx={{ 
                width: 120, 
                height: 120, 
                opacity: 0.5,
                mb: 2
              }}
            />
            <Typography variant="body1" gutterBottom>
              No records yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Click the buttons below to add
            </Typography>
          </Box>
        )}

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Edit Weight</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Weight (g)"
              type="number"
              fullWidth
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              variant="outlined"
            />
            {selectedMeal && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nutrition for {newWeight}g:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="body2">
                    {((selectedMeal.calories * parseFloat(newWeight || 0)) / selectedMeal.weight_in_grams).toFixed(0)} kcal
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ff9800' }}>
                    P: {((selectedMeal.protein * parseFloat(newWeight || 0)) / selectedMeal.weight_in_grams).toFixed(1)}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2196f3' }}>
                    C: {((selectedMeal.carbs * parseFloat(newWeight || 0)) / selectedMeal.weight_in_grams).toFixed(1)}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    F: {((selectedMeal.fat * parseFloat(newWeight || 0)) / selectedMeal.weight_in_grams).toFixed(1)}g
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveWeight} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Bottom Navigation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          borderTop: '1px solid #eee',
          p: 1,
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Grid container sx={{ 
          justifyContent: 'space-around',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <Grid item>
            <Button
              onClick={() => navigate('/food-search', { 
                state: { 
                  mealType: 'breakfast',
                  selectedDate: selectedDate.toISOString().split('T')[0]
                } 
              })}
              sx={{ 
                color: 'black',
                flexDirection: 'column',
                minWidth: 'auto',
                px: 2,
                py: 0.5
              }}
            >
              <RestaurantIcon sx={{ mb: 0.5, fontSize: '1.5rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Breakfast
              </Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => navigate('/food-search', { 
                state: { 
                  mealType: 'lunch',
                  selectedDate: selectedDate.toISOString().split('T')[0]
                } 
              })}
              sx={{ 
                color: 'black',
                flexDirection: 'column',
                minWidth: 'auto',
                px: 2,
                py: 0.5
              }}
            >
              <FastfoodIcon sx={{ mb: 0.5, fontSize: '1.5rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Lunch
              </Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => navigate('/food-search', { 
                state: { 
                  mealType: 'dinner',
                  selectedDate: selectedDate.toISOString().split('T')[0]
                } 
              })}
              sx={{ 
                color: 'black',
                flexDirection: 'column',
                minWidth: 'auto',
                px: 2,
                py: 0.5
              }}
            >
              <DinnerDiningIcon sx={{ mb: 0.5, fontSize: '1.5rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Dinner
              </Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => navigate('/food-search', { 
                state: { 
                  mealType: 'snack',
                  selectedDate: selectedDate.toISOString().split('T')[0]
                } 
              })}
              sx={{ 
                color: 'black',
                flexDirection: 'column',
                minWidth: 'auto',
                px: 2,
                py: 0.5
              }}
            >
              <LocalPizzaIcon sx={{ mb: 0.5, fontSize: '1.5rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Snack
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Nutrition; 