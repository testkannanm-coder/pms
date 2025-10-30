// ============================================
// Activity Log Service Layer
// Audit trail for all critical actions
// ============================================

const pool = require('../config/db');

class ActivityLogService {
  // Get all activity logs with filters
  async getAllActivityLogs() {
    try {
      let query = `
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }


  // Create activity log
  async createActivityLog(logData) {
    try {
      const result = await pool.query(`
        INSERT INTO activity_logs 
        (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        logData.user_id,
        logData.action,
        logData.entity_type,
        logData.entity_id || null,
        logData.description || null,
        logData.ip_address || null,
        logData.user_agent || null
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Middleware helper to log activities
  logActivity(action, entityType, req) {
    const logData = {
      user_id: req.user.id,
      action: action,
      entity_type: entityType,
      entity_id: req.params.id || null,
      description: `${action} ${entityType}`,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent')
    };
    
    this.createActivityLog(logData).catch(err => 
      console.error('Failed to log activity:', err)
    );
  }
}

module.exports = new ActivityLogService();
