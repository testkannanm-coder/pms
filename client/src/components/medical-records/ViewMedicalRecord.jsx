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
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
                    allergies: record.allergies
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
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/appointments")}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back to Appointments
                    </Button>
                </Box>
            </Box>

            {/* Patient Info */}
            {patientInfo && (
                <Paper sx={{ p: 3, mb: 3, bgcolor: "primary.50", border: 1, borderColor: "primary.200" }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Patient Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Name</Typography>
                            <Typography variant="body1" fontWeight="500">{patientInfo.name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Patient ID</Typography>
                            <Typography variant="body1" fontWeight="500">{patientInfo.patientid}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                            <Typography variant="body1">{patientInfo.date_of_birth ? new Date(patientInfo.date_of_birth).toLocaleDateString() : 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Gender</Typography>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{patientInfo.gender || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Blood Type</Typography>
                            <Typography variant="body1">{patientInfo.blood_type || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Allergies</Typography>
                            <Typography variant="body1" color={patientInfo.allergies ? "error.main" : "text.primary"}>
                                {patientInfo.allergies || 'None'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Visit Information */}
            <Stack spacing={3}>
                <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Visit Date
                    </Typography>
                    <Typography variant="h6">
                        {medicalRecord.visit_date ? new Date(medicalRecord.visit_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'N/A'}
                    </Typography>
                </Box>

                <Divider />

                <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="600">
                        Symptoms
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Typography variant="body1">
                            {medicalRecord.symptoms || 'No symptoms recorded'}
                        </Typography>
                    </Paper>
                </Box>

                <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="600">
                        Diagnosis
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "success.50", border: 2, borderColor: "success.200" }}>
                        <Typography variant="body1" fontWeight="500">
                            {medicalRecord.diagnosis || 'No diagnosis recorded'}
                        </Typography>
                    </Paper>
                </Box>

                <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="600">
                        Treatment Plan
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "info.50" }}>
                        <Typography variant="body1">
                            {medicalRecord.treatment || 'No treatment plan recorded'}
                        </Typography>
                    </Paper>
                </Box>

                {medicalRecord.notes && (
                    <Box>
                        <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="600">
                            Additional Notes
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                            <Typography variant="body1">
                                {medicalRecord.notes}
                            </Typography>
                        </Paper>
                    </Box>
                )}

                {medicalRecord.follow_up_required && (
                    <Box>
                        <Alert severity="warning" icon={false}>
                            <Typography variant="subtitle2" fontWeight="600">Follow-up Required</Typography>
                            <Typography variant="body2">
                                {medicalRecord.follow_up_date
                                    ? `Scheduled for: ${new Date(medicalRecord.follow_up_date).toLocaleDateString()}`
                                    : 'Date to be determined'}
                            </Typography>
                        </Alert>
                    </Box>
                )}

                <Divider />

                {/* Prescriptions Section */}
                <Box>
                    <Typography variant="h6" gutterBottom color="primary">
                        Prescriptions
                    </Typography>

                    {prescriptions.length === 0 ? (
                        <Alert severity="info">No prescriptions prescribed</Alert>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.50" }}>
                                        <TableCell><strong>Medication</strong></TableCell>
                                        <TableCell><strong>Dosage</strong></TableCell>
                                        <TableCell><strong>Frequency</strong></TableCell>
                                        <TableCell><strong>Duration</strong></TableCell>
                                        <TableCell><strong>Quantity</strong></TableCell>
                                        <TableCell><strong>Refills</strong></TableCell>
                                        <TableCell><strong>Instructions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prescriptions.map((prescription, index) => (
                                        <TableRow key={prescription.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'grey.50' } }}>
                                            <TableCell><strong>{prescription.medication_name}</strong></TableCell>
                                            <TableCell>{prescription.dosage}</TableCell>
                                            <TableCell>{prescription.frequency}</TableCell>
                                            <TableCell>{prescription.duration}</TableCell>
                                            <TableCell>{prescription.quantity || '-'}</TableCell>
                                            <TableCell>{prescription.refills || 0}</TableCell>
                                            <TableCell>{prescription.instructions || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>

                <Divider />

                {/* Record Metadata */}
                <Box>
                    <Typography variant="body2" color="textSecondary">
                        Record Created: {new Date(medicalRecord.created_at).toLocaleString()}
                    </Typography>
                    {medicalRecord.updated_at !== medicalRecord.created_at && (
                        <Typography variant="body2" color="textSecondary">
                            Last Updated: {new Date(medicalRecord.updated_at).toLocaleString()}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
}
