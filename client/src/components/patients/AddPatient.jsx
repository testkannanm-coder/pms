import { useState, useContext } from "react";
import { addPatient } from "../../api/patientApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Paper,
  Alert,
} from "@mui/material";

export default function AddPatient() {
  const { getToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    address: "",
    medical_history: "",
    status: "active",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.date_of_birth ||
      !form.gender
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const token = getToken();
      const result = await addPatient(form, token);

      if (result.success) {
        setSuccess("Patient added successfully");
        setTimeout(() => navigate("/patients"), 1500);
      } else {
        setError(result.message || "Failed to add patient");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add patient");
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Add Patient</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
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

      <form onSubmit={handleSubmit}>
        {/* Name & Email */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Box>

        {/* Phone & Date of Birth */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            margin="normal"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>

        {/* Gender & Blood Type */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            label="Gender"
            fullWidth
            margin="normal"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            select
            label="Blood Type"
            name="blood_type"
            fullWidth
            margin="normal"
            value={form.blood_type}
            onChange={handleChange}
          >
            <MenuItem value="">Select Blood Type</MenuItem>
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
          </TextField>
        </Box>

        {/* Address & Medical History */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Address"
            fullWidth
            margin="normal"
            name="address"
            value={form.address}
            onChange={handleChange}
            multiline
            rows={2}
          />
          <TextField
            label="Medical History"
            fullWidth
            margin="normal"
            name="medical_history"
            value={form.medical_history}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Allergies, chronic conditions, etc."
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            label="Status"
            margin="normal"
            name="status"
            value={form.status}
            onChange={handleChange}
            sx={{ width: "50%" }}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Add Patient
        </Button>
      </form>
    </Paper>
  );
}
