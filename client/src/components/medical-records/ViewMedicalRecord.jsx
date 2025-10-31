import { useState, useEffect, useContext } from "react";
import { getMedicalRecordByAppointment } from "../../api/medicalRecordApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ViewMedicalRecord() {
  const { appointmentId } = useParams();
  const { getToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [medicalRecord, setMedicalRecord] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
        setMedicalRecord(record);
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/appointments")}
          startIcon={<ArrowBackIcon />}
        >
          Back to Appointments
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Medical Record Details</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            component={Link}
            to={`/medical-records/appointment/${appointmentId}/edit`}
            startIcon={<EditIcon />}
          >
            Edit Record
          </Button>
          <Button variant="outlined"
            onClick={() => navigate("/appointments")}
            startIcon={<ArrowBackIcon />}
          >
            Back to Appointments
          </Button>
        </Box>
      </Box>

      <Stack spacing={3}>
        {patientInfo && (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              <strong>Patient Information</strong>
            </Typography>
            <>
              <Typography>
                <strong>Name:</strong> {patientInfo.name}
              </Typography>
              <Typography>
                <strong>Patient ID:</strong> {patientInfo.patientid}
              </Typography>
              <Typography>
                <strong> Date of Birth: </strong>
                {patientInfo.date_of_birth
                  ? new Date(patientInfo.date_of_birth).toLocaleDateString()
                  : "N/A"}
              </Typography>
              <Typography>
                <strong>Gender: </strong> {patientInfo.gender || "N/A"}
              </Typography>
              <Typography>
                <strong>Blood Type:</strong> {patientInfo.blood_type || "N/A"}
              </Typography>
              <Typography>
                <strong>Allergies:</strong> {patientInfo.allergies || "N/A"}
              </Typography>
            </>
          </Box>
        )}
        <Divider />

        <Box>
          <Typography>
            <strong>Visit Date:</strong>{" "}
            {medicalRecord.visit_date
              ? new Date(medicalRecord.visit_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography>
            <strong>Symptoms:</strong>
            {"  "}
            {medicalRecord.symptoms || "No symptoms recorded"}
          </Typography>

          <Typography>
            <strong>Diagnosis:</strong>
            {"  "}
            {medicalRecord.diagnosis || "No diagnosis recorded"}
          </Typography>

          <Typography>
            <strong>Treatment Plan:</strong>
            {"  "}
            {medicalRecord.treatment || "No treatment plan recorded"}
          </Typography>

          {medicalRecord.notes && (
            <>
              <Typography>
                <strong>Additional Notes:</strong> {medicalRecord.notes}
              </Typography>
            </>
          )}

          {medicalRecord.follow_up_required && (
            <>
              <Typography>
                <strong>Follow-up Required:</strong>{" "}
                {medicalRecord.follow_up_date
                  ? `Scheduled for: ${new Date(
                      medicalRecord.follow_up_date
                    ).toLocaleDateString()}`
                  : "Date to be determined"}
              </Typography>
            </>
          )}
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Prescriptions
          </Typography>

          {prescriptions.length === 0 ? (
            <Typography>No prescriptions prescribed</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.50" }}>
                    <TableCell>
                      <strong>Medication</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Dosage</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Frequency</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Duration</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Refills</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Instructions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescriptions.map((prescription, index) => (
                    <TableRow
                      key={prescription.id}
                      hover
                      sx={{ "&:nth-of-type(even)": { bgcolor: "grey.50" } }}
                    >
                      <TableCell>
                        <strong>{prescription.medication_name}</strong>
                      </TableCell>
                      <TableCell>{prescription.dosage}</TableCell>
                      <TableCell>{prescription.frequency}</TableCell>
                      <TableCell>{prescription.duration}</TableCell>
                      <TableCell>{prescription.quantity || "-"}</TableCell>
                      <TableCell>{prescription.refills || 0}</TableCell>
                      <TableCell>{prescription.instructions || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Divider />

        {/* Record Metadata */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="textSecondary">
            Record Created:{" "}
            {new Date(medicalRecord.created_at).toLocaleString()}
          </Typography>
          {medicalRecord.updated_at !== medicalRecord.created_at && (
            <Typography variant="body2" color="textSecondary">
              Last Updated:{" "}
              {new Date(medicalRecord.updated_at).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
