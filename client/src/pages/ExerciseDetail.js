import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Box, Chip, Card, CardMedia, List, ListItem, ListItemText } from "@mui/material";
import API from "../api"; // ✅ 替换 axios

const ExerciseDetail = () => {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      try {
        const response = await API.get(`/exercises/exercise/${id}`);
        setExercise(response.data);
      } catch (error) {
        console.error("Error fetching exercise details:", error);
      }
    };

    fetchExerciseDetail();
  }, [id]);

  if (!exercise) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box display="flex" gap={4} flexWrap="wrap">
        <Card sx={{ maxWidth: 400, flex: 1, boxShadow: 3, borderRadius: 3 }}>
          <CardMedia component="img" image={exercise.gifUrl} alt={exercise.name} sx={{ borderRadius: 3 }} />
        </Card>

        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>{exercise.name}</Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            <strong>Equipment:</strong> {exercise.equipment} &nbsp; | &nbsp;
            <strong>Target:</strong> {exercise.target}
          </Typography>

          <Box mt={2}>
            <Typography variant="h6" fontWeight="bold">Primary Muscles</Typography>
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              {exercise.secondaryMuscles.map((muscle, index) => (
                <Chip key={index} label={muscle} color="primary" variant="outlined" sx={{ fontSize: "14px" }} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box mt={4} p={3} boxShadow={2} borderRadius={2} bgcolor="white">
        <Typography variant="h5" fontWeight="bold" gutterBottom>Instructions</Typography>
        <List>
          {exercise.instructions.map((step, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={<Typography variant="body1"><strong>Step {index + 1}:</strong> {step}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default ExerciseDetail;
