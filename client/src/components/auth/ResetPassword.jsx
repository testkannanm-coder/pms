import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { TextField, Button, Container, Box, Typography, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        if (!tokenFromUrl) {
            setError("Invalid reset link. Please request a new password reset.");
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const backendURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const response = await fetch(`${backendURL}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setError(data.message || "Failed to reset password");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
                    <Typography variant="h4" mb={2} color="success.main">
                        Password Reset Successful!
                    </Typography>
                    <Typography variant="body1" mb={3}>
                        Your password has been successfully reset.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Redirecting to login page...
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/login")}
                        sx={{ mt: 2 }}
                    >
                        Go to Login
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
                <Typography variant="h4" mb={1} >
                    Reset Password
                </Typography>
                <Typography variant="body2" color="text.secondary"  >
                    Enter your new password below.
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading || !token}
                        helperText="Minimum 6 characters"
                    />

                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading || !token}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 3 }}
                        disabled={loading || !token}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>

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
