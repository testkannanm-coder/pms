import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getPatientById } from "../../api/patientApi";
import { getPatientHistory } from "../../api/medicalRecordApi";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Stack,
} from "@mui/material";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useContext(AuthContext);

  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatient();
    fetchMedicalRecords();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const data = await getPatientById(id, token);
      if (data) setPatient(data);
      else setError("Patient not found");
    } catch (err) {
      setError("Failed to load patient details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      setLoadingRecords(true);
      const token = getToken();
      const data = await getPatientHistory(id, token);
      setMedicalRecords(data || []);
    } catch (err) {
      console.error("Failed to load medical records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/patients")}
        >
          Back to Patients
        </Button>
      </Paper>
    );

  return (
    <Paper sx={{ p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Patient Details</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            onClick={() => navigate(`/appointments/add?patientId=${id}`)}
          >
            Book Appointment
          </Button>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => navigate(`/patients/${id}/edit`)}
          >
            Edit
          </Button>
          <Button variant="outlined" onClick={() => navigate("/patients")}>
            Back
          </Button>
        </Box>
      </Box>

      {/* Patient Info in Two Columns */}
      <Grid container spacing={20}>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Patient ID" value={patient.patientid} />
          <InfoItem label="Name" value={patient.name} />
          <InfoItem label="Email" value={patient.email || "N/A"} />
          <InfoItem label="Phone" value={patient.phone} />
          <InfoItem
            label="Date of Birth"
            value={
              patient.date_of_birth
                ? new Date(patient.date_of_birth).toLocaleDateString()
                : "N/A"
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <InfoItem label="Gender" value={patient.gender} />
          <InfoItem label="Blood Type" value={patient.blood_type || "N/A"} />
          <InfoItem label="Address" value={patient.address || "N/A"} />
          <InfoItem
            label="Medical History"
            value={patient.medical_history || "N/A"}
          />
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={patient.status}
              color={patient.status === "active" ? "success" : "default"}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Grid>
      </Grid>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2 }}
      >
        Registered on: {new Date(patient.created_at).toLocaleString()}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2 }}
      >
        Register By: {patient.user_id}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ py: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
         Medical Records
        </Typography>

        {loadingRecords ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : medicalRecords.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No medical records found.
          </Alert>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {medicalRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 2,
                  }}
                >
                  {/* Header */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {new Date(record.visit_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dr. {record.doctor_name || "N/A"}
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Diagnosis:</strong>{" "}
                      {record.diagnosis ? record.diagnosis : "—"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Symptoms:</strong>{" "}
                      {record.symptoms ? record.symptoms : "—"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Treatment:</strong>{" "}
                      {record.treatment ? record.treatment : "—"}
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2, flexWrap: "wrap" }}
                  >
                    {record.follow_up_required && (
                      <Chip
                        label={`Follow-up: ${
                          record.follow_up_date
                            ? new Date(
                                record.follow_up_date
                              ).toLocaleDateString()
                            : "TBD"
                        }`}
                        color="warning"
                        size="small"
                      />
                    )}

                    {record.appointment_id && (
                      <Button
                        component={Link}
                        to={`/medical-records/appointment/${record.appointment_id}`}
                        variant="outlined"
                        size="small"
                      >
                        View Record
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Paper>
  );
}

/* --- Reusable Info Item Component --- */
function InfoItem({ label, value }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
