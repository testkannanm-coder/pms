import { useState, useEffect, useContext, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import { getAppointments } from "../../api/appointmentApi";
import {
  getReports,
  createReport,
  deleteReport,
  uploadReportDocuments,
  downloadReportDocument,
  deleteReportDocument,
  previewReportDocument,
} from "../../api/reportApi";

export default function ReportList() {
  const { getToken } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tiffCanvas, setTiffCanvas] = useState(null);
  const [tiffPages, setTiffPages] = useState([]);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    appointment_id: "",
    report_type: "",
    report_date: new Date().toISOString().split("T")[0],
  });

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
    "Consultation Report",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const [reportsRes, appointmentsRes] = await Promise.all([
        getReports(token),
        getAppointments(token),
      ]);
      setReports(reportsRes.data || []);
      setAppointments(appointmentsRes || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      appointment_id: "",
      report_type: "",
      report_date: new Date().toISOString().split("T")[0],
    });
    setSelectedFiles([]);
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

      if (
        !formData.appointment_id ||
        !formData.report_type ||
        !formData.report_date
      ) {
        setError("Please fill all required fields");
        return;
      }

      const token = getToken();
      const result = await createReport(formData, token);

      if (result.success) {
        const reportId = result.data.id;

        if (selectedFiles.length > 0) {
          try {
            await uploadReportDocuments(reportId, selectedFiles, token);
            setSuccess(
              `${result.message} and ${selectedFiles.length} file(s) uploaded`
            );
          } catch (uploadError) {
            setSuccess(
              `${result.message} but file upload failed: ${uploadError.message}`
            );
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
      const errorMessage =
        err.response?.data?.message || err.message || "Operation failed";
      setError(errorMessage);
    }
  };

  const handleDelete = async (report) => {
    const confirmed = window.confirm(`Are you sure you want to delete report `);

    if (!confirmed) return;

    try {
      setError("");
      const token = getToken();
      await deleteReport(report.id, token);
      setSuccess("Report deleted successfully");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpload = async () => {
    try {
      if (selectedFiles.length === 0) {
        setError("Please select files");
        return;
      }
      const token = getToken();
      const result = await uploadReportDocuments(
        selectedReport.id,
        selectedFiles,
        token
      );
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
      setError(err.response?.data?.message || err.message);
    }
  };

  const handlePreviewDoc = async (docId, fileName) => {
    try {
      const token = getToken();
      const { url, contentType, blob } = await previewReportDocument(
        docId,
        token
      );

      const fileExt = fileName.toLowerCase().split(".").pop();
      const supportedPreviewTypes = [
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "tif",
        "tiff",
      ];

      if (supportedPreviewTypes.includes(fileExt)) {
        if (fileExt === "tif" || fileExt === "tiff") {
          try {
            const UTIF = (await import("utif")).default;
            const arrayBuffer = await blob.arrayBuffer();

            if (arrayBuffer.byteLength === 0) {
              throw new Error("Empty file received");
            }

            const view = new DataView(arrayBuffer);
            const byte1 = view.getUint8(0);
            const byte2 = view.getUint8(1);

            const isTiff =
              (byte1 === 0x49 && byte2 === 0x49) ||
              (byte1 === 0x4d && byte2 === 0x4d);
            const isJpeg = byte1 === 0xff && byte2 === 0xd8;
            const isPng = byte1 === 0x89 && byte2 === 0x50;
            const isGif = byte1 === 0x47 && byte2 === 0x49;

            if (isJpeg || isPng || isGif) {
              const correctBlob = new Blob([arrayBuffer], {
                type: isJpeg ? "image/jpeg" : isPng ? "image/png" : "image/gif",
              });
              const correctUrl = window.URL.createObjectURL(correctBlob);

              if (url) window.URL.revokeObjectURL(url);

              setTiffCanvas(null);
              setPreviewUrl({
                url: correctUrl,
                fileName,
                contentType: correctBlob.type,
                isTiff: false,
              });
              setPreviewDialog(true);
              return;
            }

            if (!isTiff) {
              throw new Error(
                `File does not appear to be a valid TIFF or common image format`
              );
            }

            const ifds = UTIF.decode(arrayBuffer);

            if (!ifds || ifds.length === 0) {
              throw new Error("No image data found in TIFF file");
            }

            const pageDataUrls = [];

            for (let i = 0; i < ifds.length; i++) {
              const page = ifds[i];

              UTIF.decodeImage(arrayBuffer, page);

              let width = page.width;
              let height = page.height;

              if (!width && page.t256) {
                width = Array.isArray(page.t256) ? page.t256[0] : page.t256;
              }
              if (!height && page.t257) {
                height = Array.isArray(page.t257) ? page.t257[0] : page.t257;
              }

              if (!width || !height || width <= 0 || height <= 0) {
                continue;
              }

              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext("2d");
              if (!ctx) {
                continue;
              }

              const rgba = UTIF.toRGBA8(page);

              if (!rgba || rgba.length === 0) {
                continue;
              }

              const imageData = ctx.createImageData(width, height);
              imageData.data.set(new Uint8ClampedArray(rgba));
              ctx.putImageData(imageData, 0, 0);

              const canvasDataURL = canvas.toDataURL("image/png");
              pageDataUrls.push({
                url: canvasDataURL,
                pageNumber: i + 1,
                width,
                height,
              });
            }

            if (pageDataUrls.length === 0) {
              throw new Error("No valid pages found in TIFF file");
            }

            setTiffPages(pageDataUrls);
            setPreviewUrl({
              url: pageDataUrls[0].url,
              fileName,
              contentType,
              isTiff: true,
              totalPages: pageDataUrls.length,
            });
            setPreviewDialog(true);

            if (url) window.URL.revokeObjectURL(url);
          } catch (tiffError) {
            setError(`Unable to preview TIFF file: ${tiffError.message}`);
            if (url) window.URL.revokeObjectURL(url);
          }
        } else {
          setTiffCanvas(null);
          setPreviewUrl({ url, fileName, contentType, isTiff: false });
          setPreviewDialog(true);
        }
      } else {
        window.open(url, "_blank");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to preview document"
      );
    }
  };

  const handleClosePreview = () => {
    if (previewUrl?.url) {
      window.URL.revokeObjectURL(previewUrl.url);
    }
    setPreviewUrl(null);
    setTiffCanvas(null);
    setTiffPages([]);
    setPreviewDialog(false);
  };

  useEffect(() => {
    if (previewDialog && tiffCanvas && canvasRef.current) {
      canvasRef.current.innerHTML = "";

      tiffCanvas.style.display = "block";
      tiffCanvas.style.margin = "auto";
      tiffCanvas.style.maxWidth = "100%";
      tiffCanvas.style.height = "auto";
      tiffCanvas.style.border = "1px solid #ddd";

      canvasRef.current.appendChild(tiffCanvas);
    }
  }, [previewDialog, tiffCanvas]);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Patient Reports</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              {["#", "Report No", "Patient", "Type", "Date", "Actions"].map(
                (h) => (
                  <TableCell
                    key={h}
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    {h}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((r, i) => (
                <TableRow key={r.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.report_number}</TableCell>
                  <TableCell>
                    {r.patientid} - {r.patient_name}
                  </TableCell>
                  <TableCell>{r.report_type}</TableCell>
                  <TableCell>
                    {new Date(r.report_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedReport(r);
                        setViewDialog(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleDelete(r)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => {
                        setSelectedReport(r);
                        setSelectedFiles([]);
                        setUploadDialog(true);
                      }}
                    >
                      <UploadFileIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Report */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Report</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Select Appointment</InputLabel>
              <Select
                name="appointment_id"
                value={formData.appointment_id}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_id: e.target.value })
                }
                label="Select Appointment"
              >
                <MenuItem value="">
                  <em>Choose Appointment</em>
                </MenuItem>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <MenuItem key={apt.id} value={apt.id}>
                      {apt.patient_name} -{" "}
                      {new Date(apt.appointment_date).toLocaleDateString()} at{" "}
                      {apt.appointment_time}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <em>No appointments available</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                name="report_type"
                value={formData.report_type}
                onChange={(e) =>
                  setFormData({ ...formData, report_type: e.target.value })
                }
                label="Report Type"
              >
                <MenuItem value="">
                  <em>Select Report Type</em>
                </MenuItem>
                {reportTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              type="date"
              label="Report Date"
              value={formData.report_date}
              onChange={(e) =>
                setFormData({ ...formData, report_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Upload Documents (Optional)
              </Typography>
            </Divider>

            <input
              id="file-upload-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.tif,.tiff"
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
                        onClick={() =>
                          setSelectedFiles(
                            selectedFiles.filter((_, x) => x !== i)
                          )
                        }
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Report
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Report  */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography>
                <strong>Report Number:</strong> {selectedReport.report_number}
              </Typography>
              <Typography>
                <strong>Patient:</strong> {selectedReport.patientid} -{" "}
                {selectedReport.patient_name}
              </Typography>
              <Typography>
                <strong>Type:</strong> {selectedReport.report_type}
              </Typography>
              <Typography>
                <strong>Date:</strong>{" "}
                {new Date(selectedReport.report_date).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Attached Documents:</Typography>
              {selectedReport.documents?.length > 0 ? (
                <List>
                  {selectedReport.documents.map((doc) => (
                    <ListItem key={doc.id}>
                      <ListItemText
                        primary={doc.file_name}
                        secondary={`${(doc.file_size / 1024).toFixed(2)} KB`}
                      />
                      <IconButton
                        color="info"
                        onClick={() => handlePreviewDoc(doc.id, doc.file_name)}
                        title="Preview"
                      >
                        <PreviewIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleDownloadDoc(doc.id, doc.file_name)}
                        title="Download"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteDoc(doc.id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center">
                  No documents Attached
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload  */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <>
              <Typography variant="body2" gutterBottom>
                Report: <strong>{selectedReport.report_number}</strong>
              </Typography>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.tif,.tiff"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                style={{ display: "none" }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Select Files
                </Button>
              </label>
              {selectedFiles.length > 0 && (
                <List dense sx={{ mt: 2 }}>
                  {selectedFiles.map((f, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={f.name}
                        secondary={`${(f.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUploadDialog(false);
              setSelectedFiles([]);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={selectedFiles.length === 0}
          >
            Upload ({selectedFiles.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview */}
      <Dialog
        open={previewDialog}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Preview: {previewUrl?.fileName}
          {previewUrl?.isTiff && previewUrl?.totalPages > 1 && (
            <Typography
              component="span"
              variant="body2"
              color="textSecondary"
              sx={{ ml: 2 }}
            >
              ({previewUrl.totalPages} pages)
            </Typography>
          )}
          <IconButton
            onClick={handleClosePreview}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            minHeight: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 0,
          }}
        >
          {previewUrl && (
            <>
              {previewUrl.isTiff ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "70vh",
                    overflow: "auto",
                    p: 2,
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  {tiffPages.map((page, index) => (
                    <Box key={index} sx={{ mb: 3, textAlign: "center" }}>
                      {tiffPages.length > 1 && (
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ mb: 1 }}
                        >
                          Page {page.pageNumber} of {tiffPages.length}
                        </Typography>
                      )}
                      <Box
                        component="img"
                        src={page.url}
                        alt={`${previewUrl.fileName} - Page ${page.pageNumber}`}
                        sx={{
                          maxWidth: "100%",
                          height: "auto",
                          border: "1px solid #ddd",
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : previewUrl.contentType?.startsWith("image/") ||
                previewUrl.fileName
                  ?.toLowerCase()
                  .match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                <Box
                  component="img"
                  src={previewUrl.url}
                  alt={previewUrl.fileName}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    p: 2,
                  }}
                />
              ) : previewUrl.fileName?.toLowerCase().endsWith(".pdf") ||
                previewUrl.contentType === "application/pdf" ? (
                <Box
                  sx={{ width: "100%", height: "70vh", position: "relative" }}
                >
                  <object
                    data={`${previewUrl.url}#toolbar=0&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                  >
                    <iframe
                      src={`${previewUrl.url}#toolbar=0&navpanes=0&scrollbar=1`}
                      title={previewUrl.fileName}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                    >
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography
                          variant="body1"
                          color="textSecondary"
                          gutterBottom
                        >
                          Unable to display PDF in browser.
                        </Typography>
                      </Box>
                    </iframe>
                  </object>
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="textSecondary" gutterBottom>
                    Preview not available for this file type
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
