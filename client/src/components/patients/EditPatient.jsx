import { useState, useEffect, useContext } from "react";
import { updatePatient, getPatientById } from "../../api/patientApi";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function EditPatient() {
  const { getToken } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    address: "",
    medical_history: "",
    status: "",
  });

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const patient = await getPatientById(id, token);
      
      if (patient) {
        // Format date for input
        const date = patient.date_of_birth ? new Date(patient.date_of_birth).toISOString().split("T")[0] : "";
        
        setForm({
          name: patient.name || "",
          email: patient.email || "",
          phone: patient.phone || "",
          date_of_birth: date,
          gender: patient.gender || "",
          blood_type: patient.blood_type || "",
          address: patient.address || "",
          medical_history: patient.medical_history || "",
          status: patient.status || "active",
        });
      } else {
        setError("Patient not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.phone || !form.date_of_birth || !form.gender) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const token = getToken();
      const result = await updatePatient(id, form, token);
      
      if (result.success) {
        setSuccess("Patient updated successfully");
        setTimeout(() => navigate("/patients"), 1500);
      } else {
        setError(result.message || "Failed to update patient");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update patient");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Edit Patient</Typography>
        <Button variant="outlined" onClick={() => navigate("/patients")}>
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
          rows={3}
          placeholder="Allergies, chronic conditions, etc."
        />
        <TextField
          select
          label="Status"
          fullWidth
          margin="normal"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Update Patient
        </Button>
      </form>
    </Paper>
  );
}
