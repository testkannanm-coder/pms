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
    const userId = req.user.id;
    const userRole = req.user.role;
    const filters = {
      action: req.query.action,
      entity_type: req.query.entity_type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit
    };

    const logs = await activityLogService.getAllActivityLogs(userId, userRole, filters);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs', error: error.message });
  }
});

// Get recent activity
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;
    const logs = await activityLogService.getRecentActivity(userId, userRole, limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity', error: error.message });
  }
});

// Get activity statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const stats = await activityLogService.getActivityStats(userId, userRole);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity statistics', error: error.message });
  }
});

// Get logs for specific entity
router.get('/entity/:entityType/:entityId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const logs = await activityLogService.getEntityLogs(
      req.params.entityType,
      req.params.entityId,
      userId,
      userRole
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get entity logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch entity logs', error: error.message });
  }
});

module.exports = router;
