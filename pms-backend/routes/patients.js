// ============================================
// Patient Routes
// RESTful API endpoints for patient management
// ============================================

const express = require("express");
const router = express.Router();
const patientService = require("../services/patientService");
const activityLogService = require("../services/activityLogService");
const authMiddleware = require("../middleware/authMiddleware");

// Get all patients
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const patients = await patientService.getAllPatients();
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
});

// Get patient by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await patientService.getPatientById(req.params.id, userId);

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    console.error("Get patient error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message,
    });
  }
});

// Create patient
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await patientService.createPatient(userId, req.body);

    // Log activity
    activityLogService.logActivity("CREATE", "patient", req);

    res.status(201).json({
      success: true,
      data: patient,
      message: "Patient created successfully",
    });
  } catch (error) {
    console.error("Create patient error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create patient",
      error: error.message,
    });
  }
});

// Update patient
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await patientService.updatePatient(
      req.params.id,
      userId,
      req.body
    );

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    // Log activity
    activityLogService.logActivity("UPDATE", "patient", req);

    res.json({
      success: true,
      data: patient,
      message: "Patient updated successfully",
    });
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update patient",
      error: error.message,
    });
  }
});

// Delete patient
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await patientService.deletePatient(req.params.id, userId);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    // Log activity
    activityLogService.logActivity("DELETE", "patient", req);

    res.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Delete patient error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete patient",
      error: error.message,
    });
  }
});

module.exports = router;
