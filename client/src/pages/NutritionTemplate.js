import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, FitnessCenter as FitnessCenterIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const NutritionTemplate = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [officialTemplates, setOfficialTemplates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOfficialTemplates();
  }, []);

  const fetchOfficialTemplates = async () => {
    try {
      setLoading(true);
      const response = await API.get('/nutrition/official-templates');
      setOfficialTemplates(response.data.templates);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleUseTemplate = async () => {
    try {
      await API.post('/nutrition/select-template', {
        official_template_id: selectedTemplate.id
      });
      navigate('/nutrition');
    } catch (err) {
      console.error('Failed to use template:', err);
      setError('Failed to apply template');
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

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        p: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
            Nutrition Template
          </Typography>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem'
            }
          }}
        >
          <Tab label="Custom" />
          <Tab label="Official" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                borderRadius: 2,
                px: 3,
                py: 1,
                '&:hover': {
                  bgcolor: '#1565c0',
                }
              }}
            >
              New Template
            </Button>
          </Box>
        )}
        {tabValue === 1 && (
          <>
            {error && (
              <Typography color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}

            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#1976d2', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Fat Loss Templates
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {officialTemplates
                    .filter(template => !template.name.includes('Muscle Gain'))
                    .map((template) => (
                      <Button
                        key={template.id}
                        variant="outlined"
                        onClick={() => handleTemplateClick(template)}
                        sx={{
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          borderRadius: 2,
                          p: 2,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                            borderColor: '#1565c0',
                          }
                        }}
                      >
                        {template.name}
                      </Button>
                    ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FitnessCenterIcon sx={{ color: '#1976d2', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Muscle Gain Templates
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {officialTemplates
                    .filter(template => template.name.includes('Muscle Gain'))
                    .map((template) => (
                      <Button
                        key={template.id}
                        variant="outlined"
                        onClick={() => handleTemplateClick(template)}
                        sx={{
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          borderRadius: 2,
                          p: 2,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                            borderColor: '#1565c0',
                          }
                        }}
                      >
                        {template.name}
                      </Button>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* Template Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedTemplate?.description}
          </DialogContentText>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Macronutrient Ratios (per kg of body weight)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#1976d2', borderRadius: '50%', mr: 1 }} />
                Protein: {selectedTemplate?.protein_ratio}g/kg
              </Typography>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', mr: 1 }} />
                Carbs: {selectedTemplate?.carbs_ratio}g/kg
              </Typography>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#f44336', borderRadius: '50%', mr: 1 }} />
                Fat: {selectedTemplate?.fat_ratio}g/kg
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ 
              color: '#666',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUseTemplate}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NutritionTemplate; 