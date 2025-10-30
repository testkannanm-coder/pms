import { useState, useContext, useEffect } from "react";
import { registerUser } from "../../api/patientApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Container, Box, Typography, Divider } from "@mui/material";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.token) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            const data = await registerUser(email, password, name);
            if (data.token) {
                login(data);
                alert("Registration successful!");
                navigate("/dashboard");
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError(err.message || "An error occurred during registration");
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = `${"http://localhost:5000"}/auth/google`;
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
                <Typography variant="h4" textAlign="center">
                    Register
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Name"
                        type="text"
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        helperText="Minimum 6 characters"
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 2 }}
                    >
                        Register
                    </Button>

                    <Divider sx={{ my: 3 }}>OR</Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={handleGoogleSignup}
                        sx={{
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            textTransform: 'none',
                            py: 1.5
                        }}
                    >
                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        Sign up with Google
                    </Button>

                    <Typography textAlign="left" sx={{ mt: 2 }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ textDecoration: "none" }}>
                            Login here
                        </Link>
                    </Typography>
                </form>
            </Box>
        </Container>
    );
}
