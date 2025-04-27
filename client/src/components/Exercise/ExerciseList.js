import React from "react";
import { Grid } from "@mui/material";
import ExerciseCard from "./ExerciseCard";

const ExerciseList = ({ exercises }) => {
  return (
    <Grid container spacing={3}>
      {exercises.map((exercise) => (
        <Grid item xs={12} sm={6} md={4} key={exercise.id}>
          <ExerciseCard exercise={exercise} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ExerciseList;
