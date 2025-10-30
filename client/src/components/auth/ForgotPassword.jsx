import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const backendURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${backendURL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Email sent successfully
        setSuccess(data.message || "Password reset email sent successfully.");
        setEmail("");
      } else {
        if (response.status === 404) {
          setError("No account found with that email address.");
        } else {
          setError(data.message || "Failed to send reset email. Please try again.");
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" mb={1} textAlign="left">
          Forgot Password
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={1}
        >
          Enter your email address to reset your password.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 1 }}>
              {success}
            </Alert>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={18}
                  sx={{ color: "#fff", mr: 1 }}
                />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          {/* Login Link */}
          <Typography textAlign="right" sx={{ mt: 2 }}>
            Remember your password?{" "}
            <Link to="/login" style={{ textDecoration: "none" }}>
              Login here
            </Link>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}
