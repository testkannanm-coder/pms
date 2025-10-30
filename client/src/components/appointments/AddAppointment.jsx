import { useState, useEffect, useContext } from "react";
import { createAppointment } from "../../api/appointmentApi";
import { getPatients } from "../../api/patientApi";
import { getUsersByRole } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Paper,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";

export default function AddAppointment() {
  const { getToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId");

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    notes: "",
    status: "scheduled",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = getToken();
      const data = await getPatients(token, { status: "active" });
      setPatients(data || []);

      if (preSelectedPatientId && data) {
        const patient = data.find(p => p.id === parseInt(preSelectedPatientId));
        if (patient) {
          setSelectedPatient(patient);
          setForm(prev => ({ ...prev, patient_id: patient.id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = getToken();
      const data = await getUsersByRole(token, 'doctor');
      setDoctors(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePatientChange = (event, value) => {
    setSelectedPatient(value);
    setForm({ ...form, patient_id: value ? value.id : "" });
  };

  const handleDoctorChange = (event, value) => {
    setSelectedDoctor(value);
    setForm({ ...form, doctor_id: value ? value.id : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.patient_id || !form.appointment_date || !form.appointment_time || !form.reason) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const token = getToken();
      const result = await createAppointment(form, token);

      if (result.success) {
        setSuccess("Appointment scheduled successfully");
        setTimeout(() => navigate("/appointments"), 1500);
      } else {
        setError(result.message || "Failed to schedule appointment");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to schedule appointment");
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Schedule Appointment</Typography>
        <Button variant="outlined" onClick={() => navigate("/appointments")}>
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
        <Autocomplete
          options={patients}
          getOptionLabel={(option) => `${option.name} (${option.patientid})`}
          loading={loadingPatients}
          value={selectedPatient}
          onChange={handlePatientChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Patient"
              margin="normal"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingPatients ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Autocomplete
          options={doctors}
          getOptionLabel={(option) => `${option.name} - ${option.role}`}
          loading={loadingDoctors}
          value={selectedDoctor}
          onChange={handleDoctorChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Doctor (Optional)"
              margin="normal"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingDoctors ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <TextField
          label="Appointment Date"
          type="date"
          fullWidth
          margin="normal"
          name="appointment_date"
          value={form.appointment_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: new Date().toISOString().split("T")[0] }}
          required
        />

        <TextField
          label="Appointment Time"
          type="time"
          fullWidth
          margin="normal"
          name="appointment_time"
          value={form.appointment_time}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Reason for Visit"
          fullWidth
          margin="normal"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          multiline
          rows={2}
          required
        />

        <TextField
          label="Notes"
          fullWidth
          margin="normal"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          multiline
          rows={3}
          placeholder="Any additional notes or instructions"
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
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="rescheduled">Rescheduled</MenuItem>
        </TextField>

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Schedule Appointment
        </Button>
      </form>
    </Paper>
  );
}
