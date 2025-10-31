// ============================================
// Bill Routes
// RESTful API endpoints for bill management
// ============================================

const express = require('express');
const router = express.Router();
const billService = require('../services/billService');
const activityLogService = require('../services/activityLogService');
const authMiddleware = require('../middleware/authMiddleware');

// Get all bills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bills = await billService.getAllBills(userId);
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bills', error: error.message });
  }
});

// Get bill by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await billService.getBillById(req.params.id, userId);
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bill', error: error.message });
  }
});

// Get bills by patient ID
router.get('/patient/:patientId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bills = await billService.getBillsByPatientId(req.params.patientId, userId);
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Get patient bills error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient bills', error: error.message });
  }
});

// Get bill by appointment ID
router.get('/appointment/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await billService.getBillByAppointmentId(req.params.appointmentId, userId);
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found for this appointment' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Get appointment bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment bill', error: error.message });
  }
});

// Create bill manually
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await billService.createBill(userId, req.body);
    
    activityLogService.logActivity('CREATE', 'bill', req);
    
    res.status(201).json({ success: true, data: bill, message: 'Bill created successfully' });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to create bill', error: error.message });
  }
});

// Update bill
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await billService.updateBill(req.params.id, userId, req.body);
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    activityLogService.logActivity('UPDATE', 'bill', req);
    
    res.json({ success: true, data: bill, message: 'Bill updated successfully' });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill', error: error.message });
  }
});

// Update payment status
router.put('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_status, payment_method } = req.body;
    
    if (!payment_status || !['pending', 'paid', 'cancelled'].includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const bill = await billService.updatePaymentStatus(req.params.id, userId, payment_status, payment_method);
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    activityLogService.logActivity('UPDATE', 'bill', req);
    
    res.json({ success: true, data: bill, message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment status', error: error.message });
  }
});

// Delete bill
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await billService.deleteBill(req.params.id, userId);
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    activityLogService.logActivity('DELETE', 'bill', req);
    
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bill', error: error.message });
  }
});

module.exports = router;
