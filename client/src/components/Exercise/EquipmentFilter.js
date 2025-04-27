import React from "react";
import { Paper, Chip, Box } from "@mui/material";

const equipmentList = [
  "Barbell", "Dumbbell", "Smith Machine", "Cable", "Bodyweight",
  "Resistance Band", "Kettlebell", "Others"
];

const EquipmentFilter = ({ equipmentRefs }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        right: 20,
        top: 120,
        padding: "12px",
        borderRadius: "10px",
        backgroundColor: "white",
        zIndex: 1000,
      }}
    >
      <Box display="flex" flexDirection="column">
        {equipmentList.map((equip) => (
          <Chip
            key={equip}
            label={equip}
            clickable
            onClick={() => equipmentRefs.current[equip.toLowerCase()]?.scrollIntoView({ behavior: "smooth" })}
            sx={{ marginBottom: "8px", fontWeight: "bold", backgroundColor: "#f0f0f0" }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default EquipmentFilter;
