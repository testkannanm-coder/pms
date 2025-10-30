const express = require('express');
const router = express.Router();
const medicalRecordService = require('../services/medicalRecordService');
const activityLogService = require('../services/activityLogService');
const authMiddleware = require('../middleware/authMiddleware');

// Get all medical records (with filters)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      patient_id: req.query.patient_id,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const records = await medicalRecordService.getAllMedicalRecords(userId, filters);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medical records', error: error.message });
  }
});

// Get patient medical history
router.get('/patient/:patientId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await medicalRecordService.getPatientHistory(req.params.patientId, userId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient history', error: error.message });
  }
});

// Get medical record by appointment ID
router.get('/appointment/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const record = await medicalRecordService.getMedicalRecordByAppointmentId(req.params.appointmentId, userId);
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found for this appointment' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Get medical record by appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medical record', error: error.message });
  }
});

// Get medical record by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const record = await medicalRecordService.getMedicalRecordById(req.params.id, userId);
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medical record', error: error.message });
  }
});

// Create medical record
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const record = await medicalRecordService.createMedicalRecord(userId, req.body);
    
    // Log activity
    activityLogService.logActivity('CREATE', 'medical_record', req);
    
    res.status(201).json({ success: true, data: record, message: 'Medical record created successfully' });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to create medical record', error: error.message });
  }
});

// Add prescription to medical record
router.post('/:id/prescriptions', authMiddleware, async (req, res) => {
  try {
    const prescription = await medicalRecordService.addPrescription(req.params.id, req.body);
    
    // Log activity
    activityLogService.logActivity('CREATE', 'prescription', req);
    
    res.status(201).json({ success: true, data: prescription, message: 'Prescription added successfully' });
  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to add prescription', error: error.message });
  }
});

// Update medical record
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const record = await medicalRecordService.updateMedicalRecord(req.params.id, userId, req.body);
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Log activity
    activityLogService.logActivity('UPDATE', 'medical_record', req);
    
    res.json({ success: true, data: record, message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to update medical record', error: error.message });
  }
});

// Update prescription
router.put('/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const prescription = await medicalRecordService.updatePrescription(req.params.id, req.body);
    
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Log activity
    activityLogService.logActivity('UPDATE', 'prescription', req);
    
    res.json({ success: true, data: prescription, message: 'Prescription updated successfully' });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to update prescription', error: error.message });
  }
});

// Delete medical record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await medicalRecordService.deleteMedicalRecord(req.params.id, userId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Log activity
    activityLogService.logActivity('DELETE', 'medical_record', req);
    
    res.json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete medical record', error: error.message });
  }
});

// Delete prescription
router.delete('/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await medicalRecordService.deletePrescription(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Log activity
    activityLogService.logActivity('DELETE', 'prescription', req);
    
    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete prescription', error: error.message });
  }
});

module.exports = router;
