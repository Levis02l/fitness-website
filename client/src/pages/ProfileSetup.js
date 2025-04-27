import React, { useState } from "react";
import {
  Container,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Tooltip,
  Zoom,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Male,
  Female,
  Cake,
  Height,
  FitnessCenter,
  DirectionsRun,
  School,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";
import API from "../api"; // API request handler

const steps = [
  "Select Gender",
  "Enter Age",
  "Enter Height & Weight",
  "Choose Goal",
  "Select Activity Level",
  "Select Experience Level",
  "Confirm & Submit",
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    height: "",
    weight: "",
    goal: "",
    activityLevel: "",
    experienceLevel: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await API.post("/profile", formData);
      alert("Profile created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Profile creation failed:", error);
      alert("Submission failed, please try again!");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const { gender, age, height, weight, goal, activityLevel, experienceLevel } = formData;
    switch (activeStep) {
      case 0:
        return gender === "male" || gender === "female";
      case 1:
        return age > 0 && Number.isInteger(Number(age));
      case 2:
        return height > 0 && weight > 0;
      case 3:
        return ["gain", "lose", "maintain"].includes(goal);
      case 4:
        return ["sedentary", "light", "moderate", "active", "very active"].includes(activityLevel);
      case 5:
        return ["beginner", "intermediate", "advanced"].includes(experienceLevel);
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    return (
      <Box sx={{ width: "100%", textAlign: "center", mt: 3 }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>
            {steps[activeStep]}
          </Typography>
        </Zoom>
        
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Tooltip title="Male" arrow>
              <Button
                variant={formData.gender === "male" ? "contained" : "outlined"}
                onClick={() => handleChange({ target: { name: "gender", value: "male" } })}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Male sx={{ fontSize: 48 }} />
              </Button>
            </Tooltip>
            <Tooltip title="Female" arrow>
              <Button
                variant={formData.gender === "female" ? "contained" : "outlined"}
                onClick={() => handleChange({ target: { name: "gender", value: "female" } })}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Female sx={{ fontSize: 48 }} />
              </Button>
            </Tooltip>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ maxWidth: 300, mx: 'auto' }}>
            <TextField
              label="Enter Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <Cake sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ maxWidth: 300, mx: 'auto' }}>
            <TextField
              label="Height (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <Height sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <FitnessCenter sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        )}

        {activeStep === 3 && (
          <Box sx={{ maxWidth: 300, mx: 'auto' }}>
            <TextField
              select
              label="Choose Goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="gain">Gain Muscle</MenuItem>
              <MenuItem value="lose">Lose Fat</MenuItem>
              <MenuItem value="maintain">Maintain Weight</MenuItem>
            </TextField>
          </Box>
        )}

        {activeStep === 4 && (
          <Box sx={{ maxWidth: 300, mx: 'auto' }}>
            <TextField
              select
              label="Activity Level"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <DirectionsRun sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="sedentary">Sedentary</MenuItem>
              <MenuItem value="light">Light Activity</MenuItem>
              <MenuItem value="moderate">Moderate Activity</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="very active">Very Active</MenuItem>
            </TextField>
          </Box>
        )}

        {activeStep === 5 && (
          <Box sx={{ maxWidth: 300, mx: 'auto' }}>
            <TextField
              select
              label="Experience Level"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <School sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </TextField>
          </Box>
        )}

        {activeStep === 6 && (
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Profile Summary</Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Typography>Gender: {formData.gender}</Typography>
                <Typography>Age: {formData.age}</Typography>
                <Typography>Height: {formData.height} cm</Typography>
                <Typography>Weight: {formData.weight} kg</Typography>
                <Typography>Goal: {formData.goal}</Typography>
                <Typography>Activity Level: {formData.activityLevel}</Typography>
                <Typography>Experience Level: {formData.experienceLevel}</Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            sx={{ 
              width: "100%", 
              mb: 4,
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'success.main',
              },
              '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                color: 'text.primary',
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              mt: 4,
              px: { xs: 1, sm: 4 },
            }}
          >
            {activeStep > 0 && (
              <Button
                startIcon={<NavigateBefore />}
                onClick={handleBack}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Back
              </Button>
            )}
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                onClick={handleNext}
                disabled={!validateStep()}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                {loading ? 'Submitting...' : 'Complete Setup'}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfileSetup;
