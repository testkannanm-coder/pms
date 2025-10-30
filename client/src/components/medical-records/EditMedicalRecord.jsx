import { useState, useEffect, useContext } from "react";
import {
  getMedicalRecordByAppointment,
  updateMedicalRecord,
  addPrescription,
  deletePrescription,
} from "../../api/medicalRecordApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function EditMedicalRecord() {
  const { appointmentId } = useParams();
  const { getToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    follow_up_required: false,
    follow_up_date: "",
  });

  const [prescriptions, setPrescriptions] = useState([]);
  const [newPrescription, setNewPrescription] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "",
    refills: "",
    instructions: "",
  });

  const [medicalRecordId, setMedicalRecordId] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);

  useEffect(() => {
    fetchMedicalRecord();
  }, [appointmentId]);

  const fetchMedicalRecord = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const result = await getMedicalRecordByAppointment(appointmentId, token);

      if (result.success && result.data) {
        const record = result.data;
        setMedicalRecordId(record.id);
        setFormData({
          symptoms: record.symptoms || "",
          diagnosis: record.diagnosis || "",
          treatment: record.treatment || "",
          notes: record.notes || "",
          follow_up_required: record.follow_up_required || false,
          follow_up_date: record.follow_up_date || "",
        });
        setPrescriptions(record.prescriptions || []);
        setPatientInfo({
          name: record.patient_name,
          patientid: record.patientid,
          date_of_birth: record.date_of_birth,
          gender: record.gender,
          blood_type: record.blood_type,
          allergies: record.allergies,
        });
      } else {
        setError(result.message || "Medical record not found");
      }
    } catch (err) {
      setError("Failed to load medical record");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.diagnosis) {
      setError("Diagnosis is required");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const result = await updateMedicalRecord(
        medicalRecordId,
        formData,
        token
      );

      if (result.success) {
        setSuccess("Medical record updated successfully");
        setTimeout(() => navigate("/appointments"), 1500);
      } else {
        setError(result.message || "Failed to update medical record");
      }
    } catch (err) {
      setError(err.message || "Failed to update medical record");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setNewPrescription({ ...newPrescription, [name]: value });
  };

  const handleAddPrescription = async () => {
    if (
      !newPrescription.medication_name ||
      !newPrescription.dosage ||
      !newPrescription.frequency ||
      !newPrescription.duration
    ) {
      setError("Please fill all required prescription fields");
      return;
    }

    try {
      const token = getToken();
      const result = await addPrescription(
        medicalRecordId,
        newPrescription,
        token
      );

      if (result.success) {
        setPrescriptions([...prescriptions, result.data]);
        setNewPrescription({
          medication_name: "",
          dosage: "",
          frequency: "",
          duration: "",
          quantity: "",
          refills: "",
          instructions: "",
        });
        setPrescriptionDialogOpen(false);
        setSuccess("Prescription added successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to add prescription");
      }
    } catch (err) {
      setError("Failed to add prescription");
      console.error(err);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      const token = getToken();
      const result = await deletePrescription(prescriptionId, token);

      if (result.success) {
        setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionId));
        setSuccess("Prescription deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete prescription");
      }
    } catch (err) {
      setError("Failed to delete prescription");
      console.error(err);
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
        <Typography variant="h5">Edit Medical Record</Typography>
        <Button variant="outlined" onClick={() => navigate("/appointments")}>
          Back to Appointments
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

      {/* Patient Info */}
      {patientInfo && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
          <Typography variant="h6" gutterBottom>
            Patient Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Name:</strong> {patientInfo.name}
              </Typography>
              <Typography>
                <strong>Patient ID:</strong> {patientInfo.patientid}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>DOB:</strong>{" "}
                {patientInfo.date_of_birth
                  ? new Date(patientInfo.date_of_birth).toLocaleDateString()
                  : "N/A"}
              </Typography>
              <Typography>
                <strong>Gender:</strong> {patientInfo.gender || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Blood Type:</strong> {patientInfo.blood_type || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Allergies:</strong> {patientInfo.allergies || "None"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Medical Information */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Medical Information
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Describe the patient's symptoms"
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            margin="normal"
            multiline
            rows={3}
            placeholder="Enter the diagnosis"
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Treatment"
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Describe the treatment plan"
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Additional notes or observations"
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.follow_up_required}
                onChange={handleChange}
                name="follow_up_required"
              />
            }
            label="Follow-up Required"
          />

          {formData.follow_up_required && (
            <TextField
              type="date"
              label="Follow-up Date"
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Box>

        
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Updating..." : "Update Medical Record"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/appointments")}>
            Cancel
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Prescriptions Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Prescriptions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setPrescriptionDialogOpen(true)}
        >
          Add Prescription
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medication</TableCell>
              <TableCell>Dosage</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Refills</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No prescriptions added yet
                </TableCell>
              </TableRow>
            ) : (
              prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.medication_name}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>{prescription.frequency}</TableCell>
                  <TableCell>{prescription.duration}</TableCell>
                  <TableCell>{prescription.quantity || "-"}</TableCell>
                  <TableCell>{prescription.refills || 0}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDeletePrescription(prescription.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

        <Divider></Divider>


      {/* Add Prescription Dialog */}
      <Dialog
        open={prescriptionDialogOpen}
        onClose={() => setPrescriptionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Prescription</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Medication Name"
            name="medication_name"
            value={newPrescription.medication_name}
            onChange={handlePrescriptionChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Dosage"
            name="dosage"
            value={newPrescription.dosage}
            onChange={handlePrescriptionChange}
            required
            margin="normal"
            placeholder="e.g., 500mg"
          />
          <TextField
            fullWidth
            label="Frequency"
            name="frequency"
            value={newPrescription.frequency}
            onChange={handlePrescriptionChange}
            required
            margin="normal"
            placeholder="e.g., Twice daily"
          />
          <TextField
            fullWidth
            label="Duration"
            name="duration"
            value={newPrescription.duration}
            onChange={handlePrescriptionChange}
            required
            margin="normal"
            placeholder="e.g., 7 days"
          />
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={newPrescription.quantity}
            onChange={handlePrescriptionChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Refills"
            name="refills"
            type="number"
            value={newPrescription.refills}
            onChange={handlePrescriptionChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Instructions"
            name="instructions"
            value={newPrescription.instructions}
            onChange={handlePrescriptionChange}
            margin="normal"
            multiline
            rows={2}
            placeholder="e.g., Take with food"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddPrescription} variant="contained">
            Add Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
