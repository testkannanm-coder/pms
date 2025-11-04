import { useEffect, useState, useContext } from "react";
import { getPatients, deletePatient } from "../../api/patientApi";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PatientList() {
  const { user, getToken } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const data = await getPatients(token, {
        sortBy: "name",
        sortOrder: "ASC",
      });
      setPatients(data || []);
    } catch (err) {
      setError("Failed to load patients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getToken();
      const result = await deletePatient(selectedPatient.id, token);
      if (result.success) {
        fetchPatients();
        setDeleteDialogOpen(false);
        setSelectedPatient(null);
      } else {
        setError(result.message || "Failed to delete patient");
      }
    } catch (err) {
      setError("Failed to delete patient");
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    return status === "active" ? "success" : "default";
  };

  if (loading && patients.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Patients</Typography>
        <Button variant="contained" component={Link} to="/patients/add">
          Add Patient
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Patient ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              patients.map((p, index) => (
                <TableRow key={p.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      to={`/patients/${p.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        fontWeight: 600,
                      }}
                    >
                      {p.patientid}
                    </Link>
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      size="small"
                      color={getStatusColor(p.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/patients/${p.id}`)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        navigate(`/appointments/add?patientId=${p.id}`)
                      }
                      sx={{ mr: 1 }}
                    >
                      Book
                    </Button>
                    <Button
                      component={Link}
                      to={`/patients/${p.id}/edit`}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(p)}
                      variant="outlined"
                      color="error"
                      size="small"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete patient{" "}
          <strong>{selectedPatient?.name}</strong>? This action cannot be undone
          and will delete all associated appointments and medical records.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
