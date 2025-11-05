const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const reportService = require("../services/reportService");
// const activityLogService = require("../services/activityLogService"); // Temporarily disabled
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/reports";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|jpg|jpeg|png|txt/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (mime && ext) return cb(null, true);
    cb(new Error("Only documents and images allowed!"));
  },
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reports", error: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch report", error: error.message });
  }
});

router.get("/appointment/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const reports = await reportService.getReportsByAppointmentId(req.params.appointmentId);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reports", error: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("Creating report with data:", req.body);
    console.log("User ID:", req.user.id);
    
    const newReport = await reportService.createReport(req.user.id, req.body);
    console.log("Report created successfully:", newReport);
    
    // Temporarily disabled activity logging
    // await activityLogService.logActivity(req.user.id, "CREATE", "REPORT", newReport.id, 
    //   `Created report: ${newReport.report_number}`);
    res.status(201).json({ success: true, data: newReport, message: "Report created successfully" });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ success: false, message: "Failed to create report", error: error.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("Updating report ID:", req.params.id, "with data:", req.body);
    
    const updatedReport = await reportService.updateReport(req.params.id, req.body);
    if (!updatedReport) return res.status(404).json({ success: false, message: "Report not found" });
    
    console.log("Report updated successfully:", updatedReport);
    // Temporarily disabled activity logging
    // await activityLogService.logActivity(req.user.id, "UPDATE", "REPORT", updatedReport.id, 
    //   `Updated report: ${updatedReport.report_number}`);
    res.json({ success: true, data: updatedReport, message: "Report updated successfully" });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ success: false, message: "Failed to update report", error: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("Deleting report ID:", req.params.id);
    
    const deletedReport = await reportService.deleteReport(req.params.id);
    if (!deletedReport) return res.status(404).json({ success: false, message: "Report not found" });
    
    console.log("Report deleted successfully:", deletedReport);
    // Temporarily disabled activity logging
    // await activityLogService.logActivity(req.user.id, "DELETE", "REPORT", deletedReport.id, 
    //   `Deleted report: ${deletedReport.report_number}`);
    res.json({ success: true, data: deletedReport, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ success: false, message: "Failed to delete report", error: error.message });
  }
});

router.post("/:id/documents", authMiddleware, upload.array("documents", 10), async (req, res) => {
  try {
    console.log("Uploading documents for report ID:", req.params.id);
    console.log("Files received:", req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    const uploadedDocuments = [];
    for (const file of req.files) {
      console.log("Processing file:", file.originalname);
      const doc = await reportService.addDocument(req.params.id, {
        file_name: file.originalname,
        file_path: file.path,
        file_type: file.mimetype,
        file_size: file.size,
      });
      uploadedDocuments.push(doc);
    }
    // Temporarily disabled activity logging
    // await activityLogService.logActivity(req.user.id, "CREATE", "REPORT_DOCUMENT", req.params.id, 
    //   `Uploaded ${uploadedDocuments.length} document(s)`);
    console.log("Documents uploaded successfully:", uploadedDocuments.length);
    res.json({ success: true, data: uploadedDocuments, 
      message: `${uploadedDocuments.length} document(s) uploaded successfully` });
  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({ success: false, message: "Failed to upload documents", error: error.message });
  }
});

router.delete("/documents/:documentId", authMiddleware, async (req, res) => {
  try {
    console.log("Deleting document ID:", req.params.documentId);
    const deletedDoc = await reportService.deleteDocument(req.params.documentId);
    if (!deletedDoc) return res.status(404).json({ success: false, message: "Document not found" });
    if (fs.existsSync(deletedDoc.file_path)) fs.unlinkSync(deletedDoc.file_path);
    console.log("Document deleted successfully:", deletedDoc.file_name);
    res.json({ success: true, data: deletedDoc, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ success: false, message: "Failed to delete document", error: error.message });
  }
});

// Download/View document endpoint
router.get("/documents/:documentId/download", authMiddleware, async (req, res) => {
  try {
    console.log("Downloading document ID:", req.params.documentId);
    
    // Get document info from database
    const document = await reportService.getDocumentById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    
    // Check if file exists on disk
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }
    
    console.log("Serving file:", document.file_name);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
    
    // Send file
    res.sendFile(path.resolve(document.file_path));
    
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ success: false, message: "Failed to download document", error: error.message });
  }
});

module.exports = router;
