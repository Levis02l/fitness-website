import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import API from '../api';

const FoodCard = ({ food, mealType, selectedDate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageClick = (e, url) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleCardClick = () => {
    setDialogOpen(true);
    setError('');
    setWeight('');
  };

  const handleClose = () => {
    setDialogOpen(false);
    setError('');
    setWeight('');
  };

  const handleSave = async () => {
    if (!weight || isNaN(weight) || weight <= 0) {
      setError('Please enter a valid weight in grams');
      return;
    }

    try {
      setLoading(true);
      await API.post('/nutrition/log-meal', {
        food_id: food.food_id,
        food_name: food.food_name,
        food_url: food.food_url,
        meal_type: mealType,
        weight_in_grams: parseFloat(weight),
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        date: selectedDate
      });
      
      setSuccessMessage('Food added successfully!');
      handleClose();
    } catch (err) {
      setError('Failed to save meal record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSuccessMessage('');
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 1,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#f5f5f5'
          }
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              component="img"
              src={food.food_url || '/images/default-food.png'}
              alt={food.food_name}
              onClick={(e) => handleImageClick(e, food.food_url)}
              sx={{ 
                width: 50,
                height: 50,
                borderRadius: '50%',
                mr: 2,
                objectFit: 'cover',
                cursor: food.food_url ? 'pointer' : 'default'
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {food.food_name}
              </Typography>
              <Typography 
                variant="body2" 
                color="error" 
                sx={{ fontSize: '0.9rem' }}
              >
                {food.calories} kcal/100g
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end'
            }}>
              <Box sx={{ display: 'flex', gap: 1, color: '#666' }}>
                <Typography variant="caption" sx={{ color: '#ff9800' }}>
                  {food.protein}
                </Typography>
                <Typography variant="caption" sx={{ color: '#2196f3' }}>
                  {food.carbs}
                </Typography>
                <Typography variant="caption" sx={{ color: '#f44336' }}>
                  {food.fat}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Add {food.food_name}</DialogTitle>
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
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Per {weight || 0}g:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="body2">
                Calories: {((food.calories * (weight || 0)) / 100).toFixed(2)} kcal
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff9800' }}>
                P: {((food.protein * (weight || 0)) / 100).toFixed(2)}g
              </Typography>
              <Typography variant="body2" sx={{ color: '#2196f3' }}>
                C: {((food.carbs * (weight || 0)) / 100).toFixed(2)}g
              </Typography>
              <Typography variant="body2" sx={{ color: '#f44336' }}>
                F: {((food.fat * (weight || 0)) / 100).toFixed(2)}g
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={successMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </>
  );
};

export default FoodCard; 