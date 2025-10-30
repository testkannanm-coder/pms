import { useEffect, useState, useContext } from "react";
import {
  getAppointments,
  deleteAppointment,
  changeAppointmentStatus,
} from "../../api/appointmentApi";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function AppointmentList() {
  const { getToken } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []); // ✅ fixed missing dependency array

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const data = await getAppointments(token, {
        sortBy: "appointment_date",
        sortOrder: "DESC",
      });
      setAppointments(data || []);
    } catch (err) {
      setError("Failed to load appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (apt) => {
    setSelectedAppointment(apt);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      const result = await deleteAppointment(selectedAppointment.id, token);
      if (result.success) {
        setSuccess("Appointment deleted successfully");
        fetchAppointments();
      } else {
        setError(result.message || "Failed to delete appointment");
      }
    } catch (err) {
      setError("Failed to delete appointment");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleStatusChange = (apt) => {
    setSelectedAppointment(apt);
    setNewStatus(apt.status);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    try {
      const token = getToken();
      const result = await changeAppointmentStatus(
        selectedAppointment.id,
        newStatus,
        token
      );
      if (result.success) {
        setSuccess(`Appointment status changed to ${newStatus}`);
        fetchAppointments();
      } else {
        setError(result.message || "Failed to change status");
      }
    } catch (err) {
      setError("Failed to change status");
    } finally {
      setStatusDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "primary",
      completed: "success",
      cancelled: "error",
      rescheduled: "warning",
    };
    return colors[status] || "default";
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Appointments</Typography>
        <Button variant="contained" component={Link} to="/appointments/add">
          Schedule Appointment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt, i) => (
                <TableRow key={apt.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    {new Date(apt.appointment_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{apt.appointment_time}</TableCell>
                  <TableCell>{apt.patient_name}</TableCell>
                  <TableCell>{apt.doctor_name}</TableCell>
                  <TableCell>{apt.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={apt.status}
                      size="small"
                      color={getStatusColor(apt.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/appointments/${apt.id}/edit`}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 0.5 }}
                      disabled={apt.status === "completed"}
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => handleStatusChange(apt)}
                      variant="outlined"
                      color="info"
                      size="small"
                      sx={{ mr: 1, mb: 0.5 }}
                    >
                      Change Status
                    </Button>

                    {apt.status === "completed" && (
                      <Button
                        component={Link}
                        to={`/medical-records/appointment/${apt.id}`}
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1, mb: 0.5 }}
                      >
                        Record
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDelete(apt)}
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this appointment permanently?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Change Appointment Status</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="rescheduled">Rescheduled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmStatusChange} variant="contained">
            Change
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
