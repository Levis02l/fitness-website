import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import FoodCard from '../components/FoodCard';

const FoodSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mealType, selectedDate } = location.state || { 
    mealType: 'breakfast',
    selectedDate: new Date().toISOString().split('T')[0]  // 默认使用今天的日期
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState([]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await API.get('/nutrition-search/search', {
        params: { q: searchQuery }
      });
      setFoods(response.data.foods);
    } catch (error) {
      console.error('Failed to search foods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery('');
    setFoods([]);
  };

  // Get page title
  const getMealTitle = () => {
    const dateStr = new Date(selectedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    switch (mealType) {
      case 'breakfast':
        return `Breakfast (${dateStr})`;
      case 'lunch':
        return `Lunch (${dateStr})`;
      case 'dinner':
        return `Dinner (${dateStr})`;
      case 'snack':
        return `Snack (${dateStr})`;
      default:
        return `Meal (${dateStr})`;
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', p: 2, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {getMealTitle()}
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <IconButton sx={{ p: '10px' }}>
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search foods..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          {searchQuery && (
            <IconButton onClick={handleClear}>
              <ClearIcon />
            </IconButton>
          )}
        </Paper>
      </Box>

      {/* Search Results */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          foods.map((food) => (
            <FoodCard 
              key={food.food_id} 
              food={food} 
              mealType={mealType}
              selectedDate={selectedDate}  // 直接传递字符串格式的日期
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default FoodSearch; 