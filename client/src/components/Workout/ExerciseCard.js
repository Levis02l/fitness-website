import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  Typography, 
  Collapse, 
  IconButton, 
  Box,
  Grid,
  TextField,
  Button,
  Checkbox,
  Divider,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { styled } from "@mui/material/styles";

const StyledExpandIcon = styled(ExpandMoreIcon)(({ theme, expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.text.disabled,
  '&.Mui-checked': {
    color: theme.palette.success.main,
  },
}));

const ExerciseCard = ({ exercise, onDelete, onSetsChange }) => { // 👈 新增 onSetsChange
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [sets, setSets] = useState(
    Array.isArray(exercise.sets)
      ? exercise.sets
      : Array(exercise.sets || 1).fill().map(() => ({
          weight: exercise.weight || "",
          reps: exercise.reps,
          completed: false
        }))
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeSetIndex, setActiveSetIndex] = useState(null);
  const [editMenuAnchorEl, setEditMenuAnchorEl] = useState(null);
  const [difficulty, setDifficulty] = useState('normal');

  // 👉 关键补充：每次 sets 改变，都同步回 exercise.sets
  useEffect(() => {
    exercise.sets = sets;
  }, [sets, exercise]);

  const toggleExpand = () => setExpanded(!expanded);

  const handleSetChange = (index, field, value) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
    if (onSetsChange) {
      onSetsChange(newSets); // 👈 每次改set时同步到父组件
    }
  };

  const handleMenuOpen = (event, index) => {
    setActiveSetIndex(index);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveSetIndex(null);
  };

  const handleDeleteSet = () => {
    if (activeSetIndex !== null) {
      const newSets = sets.filter((_, index) => index !== activeSetIndex);
      setSets(newSets);
    }
    handleMenuClose();
  };

  const handleAddSet = () => {
    setSets([...sets, {
      weight: exercise.weight || "",
      reps: exercise.reps,
      completed: false
    }]);
  };

  const handleEditMenuOpen = (event) => {
    setEditMenuAnchorEl(event.currentTarget);
  };

  const handleEditMenuClose = () => {
    setEditMenuAnchorEl(null);
  };

  const handleDeleteExercise = () => {
    onDelete();
    handleEditMenuClose();
  };

  const handleReplaceExercise = () => {
    console.log('Exercise object:', exercise);

    // 使用 exercise_id 作为代替，如果 id 不存在
    const exerciseId = exercise.id || exercise.exercise_id;
    
    if (!exerciseId) {
      console.error('Missing exercise id and exercise_id:', exercise);
      return;
    }

    // 确定肌肉组
    // 从多个可能的来源获取肌肉组
    const muscleGroup = exercise.muscle_group || 
                       (exercise.details ? exercise.details.bodyPart : null) || 
                       (details ? details.bodyPart : null) ||
                       'upper legs'; // 提供一个默认值
    
    console.log('Using muscle group:', muscleGroup);

    // 修正 URL 匹配模式，从 /workout/detail/ 改为 /workout-detail/
    const dateMatch = window.location.pathname.match(/\/workout-detail\/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : null;
    
    console.log('Date from pathname:', date);

    const navigationState = {
      muscle_group: muscleGroup,
      originalExercise: {
        id: exerciseId,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_time: exercise.rest_time,
        muscle_group: muscleGroup
      },
      date: date
    };

    console.log('Navigation state:', navigationState);
    navigate('/replace-exercise', { state: navigationState });
    handleEditMenuClose();
  };

  const handleDifficultyChange = (event, newDifficulty) => {
    if (newDifficulty !== null) {
      setDifficulty(newDifficulty);
    }
  };

  const { details } = exercise;

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2,
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: 'none',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        py: 3,
        px: 3,
        '&:last-child': { pb: 3 }
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flex: 1 }}>
          <Box 
            component="img" 
            src={details?.gifUrl} 
            alt={details?.name} 
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              objectFit: 'cover',
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 700,
                mb: 0.5,
                color: 'text.primary'
              }}
            >
              {details?.name || "Unknown Exercise"}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {sets.length} Sets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exercise.reps} Reps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rest {exercise.rest_time}s
              </Typography>
            </Stack>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit exercise">
            <IconButton 
              size="small"
              onClick={handleEditMenuOpen}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={editMenuAnchorEl}
            open={Boolean(editMenuAnchorEl)}
            onClose={handleEditMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleReplaceExercise}>
              <FitnessCenterIcon fontSize="small" sx={{ mr: 1 }} />
              Replace Exercise
            </MenuItem>
            <MenuItem onClick={handleDeleteExercise} sx={{ color: 'error.main' }}>
              <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton 
              size="small" 
              onClick={toggleExpand}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <StyledExpandIcon expanded={expanded ? 1 : 0} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ opacity: 0.5 }} />
        <Box sx={{ p: 3, bgcolor: 'background.default' }}>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={1}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Set</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Weight(kg)</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Reps</Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Done</Typography>
            </Grid>
            <Grid item xs={1} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Action</Typography>
            </Grid>
          </Grid>
          
          {sets.map((set, index) => (
            <Grid 
              container 
              spacing={1} 
              key={index} 
              alignItems="center" 
              sx={{ 
                mb: 1,
                py: 1,
                px: 0.5,
                borderRadius: 2,
                bgcolor: set.completed ? 'success.light' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: set.completed ? 'success.light' : 'action.hover'
                }
              }}
            >
              <Grid item xs={1}>
                <Typography sx={{ fontWeight: 600, color: set.completed ? 'success.dark' : 'text.primary' }}>
                  {index + 1}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <StyledTextField
                  size="small"
                  value={set.weight}
                  onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                  fullWidth
                  inputProps={{ style: { textAlign: 'center' } }}
                />
              </Grid>
              <Grid item xs={4}>
                <StyledTextField
                  size="small"
                  value={set.reps}
                  onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                  fullWidth
                  inputProps={{ style: { textAlign: 'center' } }}
                />
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'center' }}>
                <Tooltip title={set.completed ? "Mark as incomplete" : "Mark as complete"}>
                  <StyledCheckbox
                    checked={set.completed}
                    onChange={(e) => handleSetChange(index, 'completed', e.target.checked)}
                    size="small"
                    icon={<CheckCircleIcon />}
                    checkedIcon={<CheckCircleIcon />}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={1} sx={{ textAlign: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={(e) => handleMenuOpen(e, index)}
                  sx={{ color: 'text.secondary' }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleDeleteSet} sx={{ color: 'error.main' }}>
              <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Set
            </MenuItem>
          </Menu>
          
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddSet}
            variant="outlined"
            fullWidth
            sx={{ 
              mt: 2,
              borderStyle: 'dashed',
              color: 'text.secondary'
            }}
          >
            Add New Set
          </Button>

          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center" 
            sx={{ mt: 4 }}
          >
            <ToggleButtonGroup
              value={difficulty}
              exclusive
              onChange={handleDifficultyChange}
              aria-label="exercise difficulty"
              size="small"
              sx={{
                width: '100%',
                '& .MuiToggleButton-root': {
                  flex: 1,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    '&.easy': {
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      borderColor: 'success.main',
                      '&:hover': { bgcolor: 'success.light' }
                    },
                    '&.normal': {
                      bgcolor: 'warning.light',
                      color: 'warning.dark',
                      borderColor: 'warning.main',
                      '&:hover': { bgcolor: 'warning.light' }
                    },
                    '&.hard': {
                      bgcolor: 'error.light',
                      color: 'error.dark',
                      borderColor: 'error.main',
                      '&:hover': { bgcolor: 'error.light' }
                    }
                  },
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }
              }}
            >
              <ToggleButton 
                value="easy" 
                className="easy"
                sx={{ 
                  borderTopLeftRadius: '20px',
                  borderBottomLeftRadius: '20px'
                }}
              >
                Easy
              </ToggleButton>
              <ToggleButton 
                value="normal" 
                className="normal"
              >
                Normal
              </ToggleButton>
              <ToggleButton 
                value="hard" 
                className="hard"
                sx={{ 
                  borderTopRightRadius: '20px',
                  borderBottomRightRadius: '20px'
                }}
              >
                Hard
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
};

export default ExerciseCard;
