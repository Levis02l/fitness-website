import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { 
    Container, 
    Grid, 
    Typography, 
    Box, 
    Card,
    CardContent,
    CardActionArea,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";
import { 
    Today as TodayIcon,
    Update as UpdateIcon,
    FitnessCenter as FitnessCenterIcon,
    History as HistoryIcon,
    Cancel as CancelIcon
} from "@mui/icons-material";
import WorkoutTemplateCard from "../components/Workout/WorkoutTemplateCard";

const Workouts = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [userWorkout, setUserWorkout] = useState({
        today: null,
        upcoming: null
    });
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await API.get("/workouts");
                setTemplates(response.data.templates || []);
            } catch (error) {
                console.error("Error fetching templates:", error);
                setTemplates([]);
            }
        };

        const fetchUserWorkout = async () => {
            try {
                // 首先更新训练天数
                await API.get("/workouts/update-day");
                
                // 然后获取今天的训练计划
                const response = await API.get("/workouts/today");
                if (response.data) {
                    setUserWorkout({
                        today: response.data.today || null,
                        upcoming: response.data.upcoming || null
                    });
                }
            } catch (error) {
                console.error("No active workout plan or error:", error);
                setUserWorkout({
                    today: null,
                    upcoming: null
                });
            }
        };

        fetchTemplates();
        fetchUserWorkout();
    }, []);

    const handleWorkoutClick = () => {
        navigate("/schedule");
    };

    const handleCancelPlan = async () => {
        if (confirmText !== 'I want to cancel') {
            return;
        }
        try {
            await API.delete('/user-workouts/cancel');
            setUserWorkout({
                today: null,
                upcoming: null
            });
            setOpenCancelDialog(false);
            setConfirmText('');
        } catch (error) {
            console.error('Error canceling workout plan:', error);
        }
    };

    const WorkoutCard = ({ title, workout, icon }) => (
        <Card 
            sx={{ 
                height: '100%',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer'
                }
            }}
        >
            <CardActionArea onClick={handleWorkoutClick} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        {icon}
                        <Typography variant="h5" fontWeight={600}>
                            {title}
                        </Typography>
                    </Box>
                    
                    {workout ? (
                        <>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 2,
                                    fontWeight: 700,
                                    color: 'primary.main'
                                }}
                            >
                                {workout.name}
                            </Typography>
                            <Typography 
                                variant="body1" 
                                color="text.secondary"
                                sx={{
                                    bgcolor: 'grey.50',
                                    p: 2,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'grey.200'
                                }}
                            >
                                {workout.muscleGroups?.join(" · ") || "No muscle groups specified"}
                            </Typography>
                        </>
                    ) : (
                        <Box 
                            sx={{ 
                                textAlign: 'center', 
                                py: 4,
                                bgcolor: 'grey.50',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                No workout scheduled
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Choose a template below to get started!
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 9 }, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton onClick={() => navigate('/history')} title="Training History">
                        <HistoryIcon />
                    </IconButton>
                </Box>
                {userWorkout.today && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => setOpenCancelDialog(true)}
                    >
                        Cancel Plan
                    </Button>
                )}
            </Box>

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
                    Your Workout Journey
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
                    Track your progress and stay motivated with personalized workout plans
                </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={6}>
                    <WorkoutCard 
                        title="Today's Workout"
                        workout={userWorkout.today}
                        icon={<TodayIcon color="primary" />}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <WorkoutCard 
                        title="Upcoming Workout"
                        workout={userWorkout.upcoming}
                        icon={<UpdateIcon color="primary" />}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
                <Box 
                    sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        mb: 4
                    }}
                >
                    <FitnessCenterIcon color="primary" fontSize="large" />
                    <Typography 
                        variant="h4" 
                        sx={{
                            fontWeight: 600,
                            color: "text.primary"
                        }}
                    >
                        Training Templates
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    {templates.map(template => (
                        <Grid item xs={12} sm={6} md={4} key={template.id}>
                            <WorkoutTemplateCard template={template} />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
                <DialogTitle>Cancel Workout Plan</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Are you sure you want to cancel your current workout plan? This action cannot be undone.
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                        To confirm, please type "I want to cancel" in the field below:
                    </Typography>
                    <TextField
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="I want to cancel"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenCancelDialog(false);
                        setConfirmText('');
                    }}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancelPlan}
                        disabled={confirmText !== 'I want to cancel'}
                    >
                        Confirm Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Workouts;
