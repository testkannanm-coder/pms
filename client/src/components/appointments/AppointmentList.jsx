import { useEffect, useState, useContext } from "react";
import {
  getAppointments,
  cancelAppointment,
  deleteAppointment,
  changeAppointmentStatus,
} from "../../api/appointmentApi";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function AppointmentList() {
  const { getToken } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const data = await getAppointments(token, {
      });
      setAppointments(data || []);
    } catch (err) {
      setError("Failed to load appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      const token = getToken();
      const result = await cancelAppointment(selectedAppointment.id, token);
      if (result.success) {
        fetchAppointments();
        setCancelDialogOpen(false);
        setSelectedAppointment(null);
      } else {
        setError(result.message || "Failed to cancel appointment");
      }
    } catch (err) {
      setError("Failed to cancel appointment");
      console.error(err);
    }
  };

  const handleDeleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getToken();
      const result = await deleteAppointment(selectedAppointment.id, token);
      if (result.success) {
        setSuccess("Appointment deleted successfully");
        fetchAppointments();
        setDeleteDialogOpen(false);
        setSelectedAppointment(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete appointment");
      }
    } catch (err) {
      setError("Failed to delete appointment");
      console.error(err);
    }
  };

  const handleStatusChangeClick = (appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setStatusDialogOpen(true);
  };

  const handleStatusChangeConfirm = async () => {
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
        setStatusDialogOpen(false);
        setSelectedAppointment(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to change status");
      }
    } catch (err) {
      setError("Failed to change status");
      console.error(err);
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

  if (loading && appointments.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

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
      
      <TableContainer component={Paper}>
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
              appointments.map((apt, index) => (
                <TableRow key={apt.id} hover>
                  <TableCell>{index + 1}</TableCell>
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
                      disabled={
                        apt.status === "cancelled" || apt.status === "completed"
                      }
                    >
                      Edit
                    </Button>
                    {apt.status !== "completed" &&
                      apt.status !== "rescheduled" && (
                        <Button
                          onClick={() => handleStatusChangeClick(apt)}
                          variant="outlined"
                          color="info"
                          size="small"
                          sx={{ mr: 1, mb: 0.5 }}
                          disabled={apt.status === "cancelled"}
                        >
                          Change Status
                        </Button>
                      )}
                    {(apt.status === "completed" ||
                      apt.status === "rescheduled") && (
                      <Button
                        component={Link}
                        to={`/medical-records/appointment/${apt.id}`}
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1, mb: 0.5 }}
                      >
                        Medical Record
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteClick(apt)}
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ mb: 0.5 }}
                      disabled={apt.status === "completed"}
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
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel the appointment for{" "}
          <strong>{selectedAppointment?.patient_name}</strong> on{" "}
          {selectedAppointment &&
            new Date(selectedAppointment.appointment_date).toLocaleDateString()}
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
          <Button
            onClick={handleCancelConfirm}
            color="warning"
            variant="contained"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete this appointment? This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>No</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>Change Appointment Status</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Current appointment for{" "}
            <strong>{selectedAppointment?.patient_name}</strong> on{" "}
            {selectedAppointment &&
              new Date(
                selectedAppointment.appointment_date
              ).toLocaleDateString()}
          </Typography>
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
          {(newStatus === "completed" || newStatus === "rescheduled") && (
            <Alert severity="info" sx={{ mt: 2 }}>
              A medical record will be automatically created when status is
              changed to "{newStatus}".
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusChangeConfirm}
            color="primary"
            variant="contained"
          >
            Change Status
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
