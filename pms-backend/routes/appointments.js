// ============================================
// Appointment Routes
// RESTful API endpoints for appointment management
// ============================================

const express = require('express');
const router = express.Router();
const appointmentService = require('../services/appointmentService');
const activityLogService = require('../services/activityLogService');
const authMiddleware = require('../middleware/authMiddleware');

// ============================================
// GET ROUTES
// ============================================

// Get all appointments (with filters)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      patient_id: req.query.patient_id,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const appointments = await appointmentService.getAllAppointments(userId, filters);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
  }
});

// Get today's appointments
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentService.getTodaysAppointments(userId);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch today\'s appointments', error: error.message });
  }
});

// Get upcoming appointments
router.get('/upcoming', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 7;
    const appointments = await appointmentService.getUpcomingAppointments(userId, days);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming appointments', error: error.message });
  }
});

// Get appointment statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await appointmentService.getAppointmentStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment statistics', error: error.message });
  }
});

// Get appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointment = await appointmentService.getAppointmentById(req.params.id, userId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment', error: error.message });
  }
});

// ============================================
// POST ROUTES
// ============================================

// Create appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointment = await appointmentService.createAppointment(userId, req.body);
    
    // Log activity
    activityLogService.logActivity('CREATE', 'appointment', req);
    
    res.status(201).json({ success: true, data: appointment, message: 'Appointment created successfully' });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create appointment', error: error.message });
  }
});

// ============================================
// PUT ROUTES
// ============================================

// Update appointment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointment = await appointmentService.updateAppointment(req.params.id, userId, req.body);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Log activity
    activityLogService.logActivity('UPDATE', 'appointment', req);
    
    res.json({ success: true, data: appointment, message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment', error: error.message });
  }
});

// Cancel appointment
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointment = await appointmentService.cancelAppointment(req.params.id, userId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Log activity
    activityLogService.logActivity('UPDATE', 'appointment', req);
    
    res.json({ success: true, data: appointment, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment', error: error.message });
  }
});

// Change appointment status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;
    
    if (!status || !['scheduled', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Get current appointment
    const currentAppointment = await appointmentService.getAppointmentById(req.params.id, userId);
    if (!currentAppointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update status
    const appointment = await appointmentService.updateAppointment(req.params.id, userId, {
      ...currentAppointment,
      status: status
    });

    // Log activity
    activityLogService.logActivity('UPDATE', 'appointment', req);
    
    res.json({ success: true, data: appointment, message: `Appointment status changed to ${status}` });
  } catch (error) {
    console.error('Change status error:', error);
    res.status(500).json({ success: false, message: 'Failed to change status', error: error.message });
  }
});

// ============================================
// DELETE ROUTES
// ============================================

// Delete appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointment = await appointmentService.deleteAppointment(req.params.id, userId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Log activity
    activityLogService.logActivity('DELETE', 'appointment', req);
    
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete appointment', error: error.message });
  }
});

module.exports = router;
