const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const reportService = require("../services/reportService");
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
    const newReport = await reportService.createReport(req.user.id, req.body);
    
    res.status(201).json({ success: true, data: newReport, message: "Report created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create report", error: error.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    
    const updatedReport = await reportService.updateReport(req.params.id, req.body);
    if (!updatedReport) return res.status(404).json({ success: false, message: "Report not found" });

    res.json({ success: true, data: updatedReport, message: "Report updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update report", error: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
    
    const deletedReport = await reportService.deleteReport(req.params.id);
    if (!deletedReport) return res.status(404).json({ success: false, message: "Report not found" });
   
    res.json({ success: true, data: deletedReport, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete report", error: error.message });
  }
});

router.post("/:id/documents", authMiddleware, upload.array("documents", 10), async (req, res) => {
  try {
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    const uploadedDocuments = [];
    for (const file of req.files) {
      const doc = await reportService.addDocument(req.params.id, {
        file_name: file.originalname,
        file_path: file.path,
        file_type: file.mimetype,
        file_size: file.size,
      });
      uploadedDocuments.push(doc);
    }
    res.json({ success: true, data: uploadedDocuments, 
      message: `${uploadedDocuments.length} document(s) uploaded successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload documents", error: error.message });
  }
});

router.delete("/documents/:documentId", authMiddleware, async (req, res) => {
  try {
    const deletedDoc = await reportService.deleteDocument(req.params.documentId);
    if (!deletedDoc) return res.status(404).json({ success: false, message: "Document not found" });
    if (fs.existsSync(deletedDoc.file_path)) fs.unlinkSync(deletedDoc.file_path);
    res.json({ success: true, data: deletedDoc, message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete document", error: error.message });
  }
});

// Download/View document endpoint
router.get("/documents/:documentId/download", authMiddleware, async (req, res) => {
  try {
    const document = await reportService.getDocumentById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
    
    res.sendFile(path.resolve(document.file_path));
    
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to download document", error: error.message });
  }
});

module.exports = router;
