require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const exerciseRoutes = require("./routes/exercises");
const profileRoutes = require('./routes/profile');
const workoutRoutes = require("./routes/workouts");
const userWorkoutsRoutes = require("./routes/userWorkouts");
const communityRoutes = require('./routes/community');
const nutritionRoutes = require('./routes/nutrition');
const nutritionSearchRoutes = require('./routes/nutritionSearch');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true 
}));

app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/user-workouts", userWorkoutsRoutes);
app.use('/api/community', communityRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/nutrition-search', nutritionSearchRoutes);
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
