import { useState, useEffect, useContext } from "react";
import {
  updateAppointment,
  getAppointmentById,
} from "../../api/appointmentApi";
import { getPatients } from "../../api/patientApi";
import { getUsersByRole } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditAppointment() {
  const { id } = useParams();
  const { getToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    notes: "",
    status: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [appointmentData, patientsData, doctorsData] = await Promise.all([
        getAppointmentById(id, token),
        getPatients(token, {}),
        getUsersByRole(token, "doctor"),
      ]);

      if (appointmentData) {
        const date = new Date(appointmentData.appointment_date);
        const formattedDate = date.toISOString().split("T")[0];

        setForm({
          patient_id: appointmentData.patient_id,
          doctor_id: appointmentData.doctor_id || "",
          appointment_date: formattedDate,
          appointment_time: appointmentData.appointment_time,
          reason: appointmentData.reason || "",
          notes: appointmentData.notes || "",
          status: appointmentData.status,
        });

        const patient = patientsData.find(
          (p) => p.id === appointmentData.patient_id
        );
        setSelectedPatient(patient);

        if (appointmentData.doctor_id && doctorsData) {
          const doctor = doctorsData.find(
            (d) => d.id === appointmentData.doctor_id
          );
          setSelectedDoctor(doctor);
        }
      } else {
        setError("Appointment not found");
      }

      setPatients(patientsData || []);
      setDoctors(doctorsData || []);
    } catch (err) {
      setError("Failed to load appointment");
      console.error(err);
    } finally {
      setLoadingAppointment(false);
      setLoadingPatients(false);
      setLoadingDoctors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePatientChange = (event, value) => {
    setForm({ ...form, patient_id: value ? value.id : "" });
    setSelectedPatient(value);
  };

  const handleDoctorChange = (event, value) => {
    setForm({ ...form, doctor_id: value ? value.id : "" });
    setSelectedDoctor(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.patient_id ||
      !form.appointment_date ||
      !form.appointment_time ||
      !form.reason
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const token = getToken();
      const result = await updateAppointment(id, form, token);

      if (result.success) {
        setSuccess("Appointment updated successfully");
        setTimeout(() => navigate("/appointments"), 1500);
      } else {
        setError(result.message || "Failed to update appointment");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update appointment");
    }
  };

  if (loadingAppointment) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Edit Appointment</Typography>
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
          value={selectedPatient}
          getOptionLabel={(option) => `${option.name} (${option.patientid})`}
          loading={loadingPatients}
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
                    {loadingPatients ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Autocomplete
          options={doctors}
          value={selectedDoctor}
          getOptionLabel={(option) => `${option.name} - ${option.role}`}
          loading={loadingDoctors}
          onChange={handleDoctorChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Doctor"
              margin="normal"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingDoctors ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
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

        {form.status !== "completed" && form.status !== "rescheduled" && (
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
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="rescheduled">Rescheduled</MenuItem>
          </TextField>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Update Appointment
        </Button>
      </form>
    </Paper>
  );
}
