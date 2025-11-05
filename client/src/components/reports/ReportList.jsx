import { useState, useEffect, useContext } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { AuthContext } from "../../context/AuthContext";
import { getAppointments } from "../../api/appointmentApi";
import { getReports, createReport, updateReport, deleteReport, uploadReportDocuments, deleteReportDocument, downloadReportDocument } from "../../api/reportApi";

export default function ReportList() {
  const { getToken } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({ appointment_id: "", report_type: "", report_date: new Date().toISOString().split("T")[0] });

  // Report type options
  const reportTypes = [
    "Blood Test",
    "X-Ray", 
    "MRI Scan",
    "CT Scan",
    "Ultrasound",
    "ECG",
    "Lab Report",
    "Pathology Report",
    "Radiology Report",
    "Consultation Report"
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      console.log("Token:", token);
      
      const [reportsRes, appointmentsRes] = await Promise.all([
        getReports(token), 
        getAppointments(token)
      ]);
      
      console.log("Raw API responses:", {
        reportsRes,
        appointmentsRes
      });
      
      setReports(reportsRes.data || []);
      setAppointments(appointmentsRes || []);
      
      console.log("Final state data:", { 
        reports: reportsRes.data || [],
        appointments: appointmentsRes || []
      });
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentChange = (appointmentId) => {
    setFormData({ 
      ...formData, 
      appointment_id: appointmentId
    });
  };

  const handleOpenDialog = (editMode = false, report = null) => {
    setMode(editMode ? "edit" : "create");
    if (editMode && report) {
      setSelectedReport(report);
      setFormData({ 
        appointment_id: report.appointment_id || "", 
        report_type: report.report_type, 
        report_date: report.report_date
      });
    } else {
      setFormData({ appointment_id: "", report_type: "", report_date: new Date().toISOString().split("T")[0] });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { 
    setOpenDialog(false); 
    setError(""); 
    setSuccess(""); 
    setSelectedFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(""); 
      setSuccess("");
      
      // Validation
      if (!formData.appointment_id || !formData.report_type || !formData.report_date) {
        setError("Please fill all required fields: Appointment, Report Type, and Report Date");
        return;
      }
      
      const token = getToken();
      console.log("Submitting report data:", formData);
      
      const result = mode === "create" ? await createReport(formData, token) : await updateReport(selectedReport.id, formData, token);
      console.log("Report creation result:", result);
      
      if (result.success) {
        const reportId = mode === "create" ? result.data.id : selectedReport.id;
        
        // Upload files if any selected
        if (selectedFiles.length > 0) {
          console.log("Uploading files:", selectedFiles);
          try {
            const uploadResult = await uploadReportDocuments(reportId, selectedFiles, token);
            console.log("File upload result:", uploadResult);
            setSuccess(`${result.message} and ${selectedFiles.length} file(s) uploaded`);
          } catch (uploadError) {
            console.error("File upload error:", uploadError);
            setSuccess(`${result.message} but file upload failed: ${uploadError.message}`);
          }
        } else {
          setSuccess(result.message);
        }
        
        await fetchData();
        setTimeout(() => handleCloseDialog(), 1500);
      } else {
        setError(result.message || "Failed to create report");
      }
    } catch (err) {
      console.error("Submit error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Operation failed";
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      setError("");
      setSuccess("");
      const token = getToken();
      console.log("Deleting report:", selectedReport.id);
      
      const result = await deleteReport(selectedReport.id, token);
      console.log("Delete result:", result);
      
      if (result.success) {
        setSuccess(result.message);
        await fetchData();
        setDeleteDialog(false);
      } else {
        setError(result.message || "Failed to delete report");
      }
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete report";
      setError(errorMessage);
    }
  };

  const handleUpload = async () => {
    try {
      if (selectedFiles.length === 0) { setError("Please select files"); return; }
      const token = getToken();
      const result = await uploadReportDocuments(selectedReport.id, selectedFiles, token);
      if (result.success) {
        setSuccess(result.message);
        await fetchData();
        setSelectedFiles([]);
        setTimeout(() => setUploadDialog(false), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const token = getToken();
      await deleteReportDocument(docId, token);
      setSuccess("Document deleted");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDownloadDoc = async (docId, fileName) => {
    try {
      const token = getToken();
      await downloadReportDocument(docId, fileName, token);
      setSuccess("File downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      setError(err.response?.data?.message || err.message || "Failed to download file");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Patient Reports</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog(false)}>Add Report</Button>
      </Box>
      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: Appointments: {appointments?.length || 0}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              {["#", "Report No", "Patient", "Type", "Date", "Docs", "Actions"].map(h => <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? <TableRow><TableCell colSpan={7} align="center">No reports found</TableCell></TableRow> : reports.map((r, i) => (
              <TableRow key={r.id} hover>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{r.report_number}</TableCell>
                <TableCell>{r.patientid} - {r.patient_name}</TableCell>
                <TableCell>{r.report_type}</TableCell>
                <TableCell>{new Date(r.report_date).toLocaleDateString()}</TableCell>
                <TableCell><Chip label={r.documents?.length || 0} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => { setSelectedReport(r); setViewDialog(true); }}><VisibilityIcon /></IconButton>
                  <IconButton size="small" color="info" onClick={() => handleOpenDialog(true, r)}><EditIcon /></IconButton>
                  <IconButton size="small" color="secondary" onClick={() => { setSelectedReport(r); setSelectedFiles([]); setUploadDialog(true); }}><UploadFileIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => { setSelectedReport(r); setDeleteDialog(true); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {mode === "create" ? "Add New Report" : "Edit Report"}
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Row 1: Appointment and Report Type */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth required>
                  <InputLabel>Select Appointment</InputLabel>
                  <Select
                    name="appointment_id"
                    value={formData.appointment_id}
                    onChange={(e) => handleAppointmentChange(e.target.value)}
                    label="Select Appointment"
                  >
                    <MenuItem value="">
                      <em>-- Choose Appointment --</em>
                    </MenuItem>
                    {appointments && appointments.length > 0 ? appointments.map((apt) => (
                      <MenuItem key={apt.id} value={apt.id}>
                        {apt.patient_name} ({apt.patientid}) - {new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time}
                      </MenuItem>
                    )) : (
                      <MenuItem disabled>
                        <em>No appointments available</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    name="report_type"
                    value={formData.report_type}
                    onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                    label="Report Type"
                  >
                    <MenuItem value="">
                      <em>-- Select Report Type --</em>
                    </MenuItem>
                    {reportTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Row 2: Report Date */}
              <Box>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Report Date"
                  name="report_date"
                  value={formData.report_date}
                  onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Divider */}
              <Divider>
                <Typography variant="body2" color="textSecondary">
                  Upload Documents (Optional)
                </Typography>
              </Divider>

              {/* Row 3: File Upload */}
              <Box>
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  style={{ display: "none" }}
                />
                <label htmlFor="file-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                    sx={{ py: 1.5, borderStyle: "dashed" }}
                  >
                    Select Files to Upload
                  </Button>
                </label>

                {selectedFiles.length > 0 && (
                  <List dense sx={{ mt: 2 }}>
                    {selectedFiles.map((file, i) => (
                      <ListItem
                        key={i}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, x) => x !== i))}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {mode === "create" ? "Create Report" : "Update Report"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">Report Number</Typography>
                  <Typography>{selectedReport.report_number}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">Patient</Typography>
                  <Typography>{selectedReport.patientid} - {selectedReport.patient_name}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">Report Type</Typography>
                  <Typography>{selectedReport.report_type}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                  <Typography>{new Date(selectedReport.report_date).toLocaleDateString()}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Attached Documents ({selectedReport.documents?.length || 0})</Typography>
              {selectedReport.documents && selectedReport.documents.length > 0 ? (
                <List>
                  {selectedReport.documents.map(doc => (
                    <ListItem key={doc.id}>
                      <ListItemText primary={doc.file_name} secondary={`${(doc.file_size / 1024).toFixed(2)} KB`} />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          color="primary" 
                          onClick={() => handleDownloadDoc(doc.id, doc.file_name)}
                          sx={{ mr: 1 }}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton edge="end" color="error" onClick={() => handleDeleteDoc(doc.id)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center">No documents</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {selectedReport && <>
            <Typography variant="body2" gutterBottom>Report: <strong>{selectedReport.report_number}</strong></Typography>
            <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={(e) => setSelectedFiles(Array.from(e.target.files))} style={{display:"none"}} id="file-input" />
            <label htmlFor="file-input">
              <Button variant="outlined" component="span" fullWidth sx={{mt:2}}>Select Files</Button>
            </label>
            {selectedFiles.length > 0 && (
              <List dense sx={{mt:2}}>
                {selectedFiles.map((f, i) => <ListItem key={i}><ListItemText primary={f.name} secondary={`${(f.size / 1024).toFixed(2)} KB`} /></ListItem>)}
              </List>
            )}
          </>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setUploadDialog(false); setSelectedFiles([]);}}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={selectedFiles.length === 0}>Upload ({selectedFiles.length})</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete report {selectedReport?.report_number}?</Typography>
          <Alert severity="warning" sx={{mt:2}}>All documents will be deleted</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
