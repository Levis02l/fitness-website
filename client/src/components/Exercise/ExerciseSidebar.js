import React, { useState } from "react";
import { List, ListItem, ListItemButton, ListItemText, Drawer, Divider, Typography } from "@mui/material";

const bodyParts = [
  "back", "cardio", "chest", "lower arms", "lower legs",
  "neck", "shoulders", "upper arms", "upper legs", "waist"
];

const targetMuscles = {
  back: ["lats", "traps", "upper back"],
  cardio: ["cardiovascular system"],
  chest: ["pectorals"],
  "lower arms": ["forearms"],
  "lower legs": ["calves"],
  neck: ["levator scapulae"],
  shoulders: ["delts"],
  "upper arms": ["biceps", "triceps"],
  "upper legs": ["quads", "hamstrings", "abductors", "adductors", "glutes"],
  waist: ["abs", "serratus anterior", "spine"]
};

const ExerciseSidebar = ({ setBodyPart, setSelectedTarget }) => {
  const [selectedBodyPart, setSelectedBodyPart] = useState("");

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 200,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 200,
          backgroundColor: "#f8f9fa",
          padding: "10px",
          borderRight: "1px solid #ddd",
        }
      }}
    >
      <Typography variant="h6" sx={{ padding: "10px", fontWeight: "bold" }}>
        Muscle Groups
      </Typography>
      <Divider />
      <List>
        {bodyParts.map((part) => {
          const targets = targetMuscles[part] || [];
          const hasMultipleTargets = targets.length > 1;

          return (
            <div key={part}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setBodyPart(part);
                    setSelectedBodyPart(hasMultipleTargets ? part : "");
                    setSelectedTarget(!hasMultipleTargets ? targets[0] : "");
                  }}
                >
                  <ListItemText primary={part.toUpperCase()} sx={{ fontWeight: "bold" }} />
                </ListItemButton>
              </ListItem>

              {selectedBodyPart === part &&
                hasMultipleTargets &&
                targets.map((target) => (
                  <ListItem key={target} disablePadding sx={{ pl: 3 }}>
                    <ListItemButton onClick={() => setSelectedTarget(target)}>
                      <ListItemText primary={target} />
                    </ListItemButton>
                  </ListItem>
                ))}
            </div>
          );
        })}
      </List>
    </Drawer>
  );
};

export default ExerciseSidebar;
