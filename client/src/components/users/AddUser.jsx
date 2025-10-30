import { useState, useContext } from "react";
import { createUser } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    MenuItem,
} from "@mui/material";

export default function AddUser() {
    const { getToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
            setError("All fields are required");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Invalid email format");
            return;
        }

        try {
            setLoading(true);
            const token = getToken();
            const result = await createUser(formData, token);

            if (result.success) {
                setSuccess("User added successfully");
                setTimeout(() => navigate("/users"), 1500);
            } else {
                setError(result.message || "Failed to create user");
            }
        } catch (err) {
            setError(err.message || "Failed to create user");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5">Add User</Typography>
                <Button variant="outlined" onClick={() => navigate("/users")}>
                    Back
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    margin="normal"
                    helperText="Minimum 6 characters"
                />

                <TextField
                    select
                    fullWidth
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    margin="normal"
                >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                </TextField>

                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? "Creating..." : "Add User"}
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/users")}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}
