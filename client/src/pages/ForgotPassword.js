import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  CssBaseline,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import API from "../api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const sendResetCode = async () => {
    try {
      await API.post("/send-reset-code", { email });
      alert("Verification code sent!");
      setStep(2);
    } catch (error) {
      alert("Failed to send verification code.");
    }
  };

  const resetPassword = async () => {
    try {
      await API.post("/reset-password", { 
        email, 
        code: verificationCode, 
        newPassword 
      });
      alert("Password reset successful!");
      navigate("/login");
    } catch (error) {
      alert("Failed to reset password.");
    }
  };

  const steps = ['Enter Email', 'Reset Password'];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
        py: 4
      }}
    >
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
            bgcolor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)"
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: "text.primary",
              textAlign: "center"
            }}
          >
            Reset Password
          </Typography>

          <Stepper 
            activeStep={step - 1} 
            alternativeLabel 
            sx={{ width: '100%', mb: 4 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ width: "100%" }}>
            {step === 1 && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={sendResetCode}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mb: 3
                  }}
                >
                  Send Verification Code
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={resetPassword}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mb: 3
                  }}
                >
                  Reset Password
                </Button>
              </>
            )}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
