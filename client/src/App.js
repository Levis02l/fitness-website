import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ 引入认证上下文
import ProtectedRoutes from "./ProtectedRoutes"; // ✅ 受保护路由
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import HomePage from "./pages/HomePage";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ExerciseDetail from "./pages/ExerciseDetail";
import NavBar from "./components/NavBar/NavBar";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import Workouts from "./pages/Workouts";
import TrainingPlan from "./pages/workout/TrainingPlan";
import SetupWorkout from "./pages/workout/SetupWorkout";
import WorkoutSchedule from "./pages/WorkoutSchedule";  
import WorkoutDetailPage from "./pages/WorkoutDetailPage";
import ReplaceExercise from "./pages/workout/ReplaceExercise";
import WorkoutHistory from './pages/WorkoutHistory';
import Community from './pages/Community';
import Nutrition from './pages/Nutrition';
import NutritionTemplate from './pages/NutritionTemplate';
import FoodSearch from './pages/FoodSearch';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const noNavRoutes = ["/login", "/register", "/forgot-password"];

  return (
    <>
      {!noNavRoutes.includes(location.pathname) && <NavBar />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider> {/* ✅ 用 AuthProvider 包裹整个应用 */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <MainLayout>
            <Routes>
              {/* 公共路由 */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* 受保护的路由 */}
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/exercises" element={<ExerciseLibrary />} />
                <Route path="/exercise/:id" element={<ExerciseDetail />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/workout-template/:id" element={<TrainingPlan />} />
                <Route path="/setup-workout/:id" element={<SetupWorkout />} />
                <Route path="/schedule" element={<WorkoutSchedule />} />
                <Route path="/workout-detail/:date" element={<WorkoutDetailPage />} />
                <Route path="/replace-exercise" element={<ReplaceExercise />} />
                <Route path="/history" element={<WorkoutHistory />} />
                <Route path="/community" element={<Community />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/nutrition/template" element={<NutritionTemplate />} />
                <Route path="/food-search" element={<FoodSearch />} />
              </Route>

              {/* 未匹配路由重定向到登录页 */}
              <Route path="*" element={<Login />} />
            </Routes>
          </MainLayout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
