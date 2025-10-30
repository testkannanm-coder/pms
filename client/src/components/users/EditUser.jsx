import { useState, useEffect, useContext } from "react";
import { getUsers, updateUser } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    MenuItem,
} from "@mui/material";

export default function EditUser() {
    const { id } = useParams();
    const { getToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const data = await getUsers(token, {});
            const user = data.find((u) => u.id === parseInt(id));

            if (user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                });
            } else {
                setError("User not found");
            }
        } catch (err) {
            setError("Failed to load user");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!formData.name || !formData.email || !formData.role) {
            setError("All fields are required");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Invalid email format");
            return;
        }

        try {
            setSubmitting(true);
            const token = getToken();
            const result = await updateUser(id, formData, token);

            if (result.success) {
                setSuccess("User updated successfully");
                setTimeout(() => navigate("/users"), 1500);
            } else {
                setError(result.message || "Failed to update user");
            }
        } catch (err) {
            setError(err.message || "Failed to update user");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Paper sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5">Edit User</Typography>
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
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? "Updating..." : "Update User"}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}
