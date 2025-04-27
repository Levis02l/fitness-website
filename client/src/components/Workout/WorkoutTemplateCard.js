import React from "react";
import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const WorkoutTemplateCard = ({ template }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        height: 260,
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.2)",
        },
      }}
      onClick={() => navigate(`/workout-template/${template.id}`)}
    >
      <CardMedia
        component="img"
        image={template.image_url}
        alt={template.name}
        sx={{
          width: "100%",
          height: 150,
          objectFit: "cover",
          backgroundColor: "#f8f9fa",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />
      <CardContent
        sx={{
          width: "100%",
          textAlign: "center",
          paddingBottom: "12px",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {template.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            marginTop: "6px",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Difficulty:
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            fontWeight="bold"
            sx={{
              backgroundColor: "#e3f2fd",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            {template.difficulty}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WorkoutTemplateCard;
