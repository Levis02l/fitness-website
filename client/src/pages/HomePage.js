import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Container,
} from "@mui/material";
import bannerImage from "../assets/images/banner.jpg"; // 引入 Banner 图片
import workoutImage from "../assets/images/workout.jpg"; // 引入卡片1图片
import nutritionImage from "../assets/images/nutrition.jpg"; // 引入卡片2图片
import communityImage from "../assets/images/community.jpg"; // 引入卡片3图片

const HomePage = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      

      {/* Hero Section */}
      <Box
        sx={{
          height: "80vh",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2.5rem", md: "4rem" },
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
              mb: 3,
              letterSpacing: "-0.5px",
            }}
          >
            Transform Your Body, Transform Your Life
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: { xs: "1.1rem", md: "1.5rem" },
              color: "rgba(255, 255, 255, 0.9)",
              maxWidth: "800px",
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Join our community of fitness enthusiasts. Get personalized workout plans,
            track your progress, and connect with like-minded individuals worldwide.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.1rem",
              borderRadius: "30px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
              },
            }}
          >
            Start Your Journey Today
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 12 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{ 
            mb: 8, 
            fontWeight: 700, 
            color: "text.primary",
            fontSize: { xs: "2rem", md: "2.5rem" },
          }}
        >
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              title: "Personalized Workout Plans",
              description: "Get custom training programs tailored to your goals and fitness level",
              image: workoutImage,
            },
            {
              title: "Nutrition Guidance",
              description: "Expert nutrition advice to maximize your training results",
              image: nutritionImage,
            },
            {
              title: "Community Support",
              description: "Join a vibrant fitness community and share your journey",
              image: communityImage,
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={item.image}
                  alt={item.title}
                  sx={{
                    objectFit: "cover",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ 
                      fontWeight: 600, 
                      color: "text.primary",
                      mb: 2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.7,
                      fontSize: "1.1rem",
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
