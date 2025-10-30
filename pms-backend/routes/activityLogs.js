// ============================================
// Activity Logs Routes
// RESTful API endpoints for audit trail
// ============================================

const express = require('express');
const router = express.Router();
const activityLogService = require('../services/activityLogService');
const authMiddleware = require('../middleware/authMiddleware');

// Get all activity logs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const logs = await activityLogService.getAllActivityLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs', error: error.message });
  }
});

module.exports = router;
