import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Grid, Typography, TextField } from "@mui/material";
import API from "../api"; // ✅ 替换 axios
import ExerciseSidebar from "../components/Exercise/ExerciseSidebar";
import EquipmentFilter from "../components/Exercise/EquipmentFilter";
import ExerciseList from "../components/Exercise/ExerciseList";

const ExerciseLibrary = () => {
  const [bodyPart, setBodyPart] = useState("back");
  const [exercises, setExercises] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const equipmentRefs = useRef({});

  const equipmentOrder = [
    "barbell", "dumbbell", "smith machine", "cable",
    "body weight", "resistance band", "kettlebell"
  ];

  const fetchExercises = useCallback(async () => {
    try {
      const cachedData = localStorage.getItem(`exercises_${bodyPart}`);
      if (cachedData) {
        setExercises(JSON.parse(cachedData));
      } else {
        const response = await API.get(`/exercises/bodyPart/${bodyPart}`, {
          params: { limit: 50 },
        });
        setExercises(response.data);
        localStorage.setItem(`exercises_${bodyPart}`, JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  }, [bodyPart]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const filteredExercises = selectedTarget
    ? exercises.filter(ex => ex.target === selectedTarget)
    : exercises;

  const searchedExercises = searchQuery
    ? filteredExercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredExercises;

  // 处理器械分类，并确保未分类的归入 "others"
  const equipmentCategories = searchedExercises.reduce((acc, exercise) => {
    const equipmentType = equipmentOrder.includes(exercise.equipment)
      ? exercise.equipment
      : "others"; // 未匹配的归类到 "others"

    if (!acc[equipmentType]) acc[equipmentType] = [];
    acc[equipmentType].push(exercise);
    return acc;
  }, {});

  // 确保 "others" 出现在分类里
  if (equipmentCategories["others"] && equipmentCategories["others"].length > 0) {
    equipmentOrder.push("others");
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 8, sm: 9 }, // 为导航栏留出空间
        mb: 4,
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      <Grid container spacing={2}>
        <Grid 
          item 
          xs={3}
          sx={{
            position: { sm: 'sticky' },
            top: { sm: '88px' }, // 导航栏高度 + 一些间距
            height: { sm: 'calc(100vh - 88px)' },
            overflowY: 'auto'
          }}
        >
          <ExerciseSidebar setBodyPart={setBodyPart} setSelectedTarget={setSelectedTarget} />
        </Grid>
        <Grid item xs={9}>
          <TextField
            fullWidth
            placeholder="Search exercises..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Typography variant="h4" gutterBottom>{bodyPart.toUpperCase()} Exercises</Typography>

          {equipmentOrder
            .filter(equip => equipmentCategories[equip])
            .map(equipment => (
              <div key={equipment} ref={el => (equipmentRefs.current[equipment] = el)}>
                <Typography variant="h5" sx={{ marginTop: "20px", fontWeight: "bold" }}>
                  {equipment.toUpperCase()}
                </Typography>
                <ExerciseList exercises={equipmentCategories[equipment]} />
              </div>
            ))}
        </Grid>
      </Grid>
      <EquipmentFilter equipmentRefs={equipmentRefs} />
    </Container>
  );
};

export default ExerciseLibrary;
