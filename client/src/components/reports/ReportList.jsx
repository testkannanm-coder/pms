import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Modal,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function ReportList() {
  const reports = [
    {
      id: 1,
      patientId: "PAT12345",
      name: "John Doe",
      doctorName: "Dr. Smith",
      reportType: "Blood Test",
      date: "2024-06-15",
      reportFile: "../assets/reports/007A0BFE.pdf",
    },
    {
      id: 2,
      patientId: "PAT12346",
      name: "Jane Roe",
      doctorName: "Dr. Adams",
      reportType: "X-Ray",
      date: "2024-06-20",
      reportFile: "../assets/reports/007A0BFE.pdf",
    },
  ];

  // Modal states
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);

  const handleViewOpen = (report) => {
    setSelectedReport(report);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setSelectedReport(null);
    setViewOpen(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Reports</h2>
        <Button variant="contained" color="primary" onClick={handleAddOpen}>
          Add Report
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Patient ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Doctor Name</TableCell>
              <TableCell>Report Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report, index) => (
              <TableRow key={report.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{report.patientId}</TableCell>
                <TableCell>{report.name}</TableCell>
                <TableCell>{report.doctorName}</TableCell>
                <TableCell>{report.reportType}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewOpen(report)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={addOpen} onClose={handleAddClose}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            marginTop: "50px",
            padding: 4,
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <h3>Add New Report</h3>
          <form>
            <TextField
              select
              label="Patient ID"
              fullWidth
              margin="normal"
              name="patientId"
              required
            >
              <MenuItem value="">Select Patient ID</MenuItem>
              <MenuItem value="PAT12345">PAT12345</MenuItem>
              <MenuItem value="PAT12346">PAT12346</MenuItem>
            </TextField>

            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Doctor Name"
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              select
              label="Report Type"
              fullWidth
              margin="normal"
              name="reportType"
              required
            >
              <MenuItem value="">Select Report Type</MenuItem>
              <MenuItem value="Blood Test">Blood Test</MenuItem>
              <MenuItem value="X-Ray">X-Ray</MenuItem>
              <MenuItem value="MRI">MRI</MenuItem>
              <MenuItem value="CT Scan">CT Scan</MenuItem>
              <MenuItem value="Ultrasound">Ultrasound</MenuItem>
            </TextField>

            <TextField
              label="Date"
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <input
              type="file"
              style={{ marginTop: "16px", marginBottom: "16px" }}
            />
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            marginTop: "50px",
            padding: 4,
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Report Details</h2>
            <Button color="error" onClick={handleViewClose}>
              <CloseIcon />
            </Button>
          </div>
          {selectedReport ? (
            <>
              <p>
                <strong>Patient ID:</strong> {selectedReport.patientId}
              </p>
              <p>
                <strong>Name:</strong> {selectedReport.name}
              </p>
              <p>
                <strong>Doctor Name:</strong> {selectedReport.doctorName}
              </p>
              <p>
                <strong>Report Type:</strong> {selectedReport.reportType}
              </p>
              <p>
                <strong>Date:</strong> {selectedReport.date}
              </p>
              {selectedReport.reportFile && (
                <Button
                  variant="outlined"
                  color="secondary"
                  href={selectedReport.reportFile}
                  target="_blank"
                  style={{ marginTop: "16px" }}
                >
                  View Report File
                </Button>
              )}
            </>
          ) : (
            <p>No report selected</p>
          )}
        </Box>
      </Modal>
    </>
  );
}

export default ReportList;
