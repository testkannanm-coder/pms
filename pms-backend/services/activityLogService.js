// ============================================
// Activity Log Service Layer
// Audit trail for all critical actions
// ============================================

const pool = require('../config/db');

class ActivityLogService {
  // Get all activity logs with filters
  async getAllActivityLogs(userId, userRole, filters = {}) {
    try {
      let query = `
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
      `;
      const params = [];
      let paramIndex = 1;
      const conditions = [];

      // If not admin, only show their own logs
      if (userRole !== 'admin') {
        conditions.push(`al.user_id = $${paramIndex}`);
        params.push(userId);
        paramIndex++;
      }

      // Apply filters
      if (filters.action) {
        conditions.push(`al.action = $${paramIndex}`);
        params.push(filters.action);
        paramIndex++;
      }

      if (filters.entity_type) {
        conditions.push(`al.entity_type = $${paramIndex}`);
        params.push(filters.entity_type);
        paramIndex++;
      }

      if (filters.startDate) {
        conditions.push(`al.created_at >= $${paramIndex}`);
        params.push(filters.startDate);
        paramIndex++;
      }

      if (filters.endDate) {
        conditions.push(`al.created_at <= $${paramIndex}`);
        params.push(filters.endDate);
        paramIndex++;
      }

      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Sorting
      query += ` ORDER BY al.created_at DESC`;

      // Limit
      if (filters.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get recent activity (last 24 hours by default)
  async getRecentActivity(userId, userRole, limit = 10) {
    try {
      let query = `
        SELECT al.*, u.name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.created_at >= NOW() - INTERVAL '24 hours'
      `;
      const params = [];
      
      // If not admin, only show their own logs
      if (userRole !== 'admin') {
        query += ` AND al.user_id = $1`;
        params.push(userId);
        query += ` ORDER BY al.created_at DESC LIMIT $2`;
        params.push(limit);
      } else {
        query += ` ORDER BY al.created_at DESC LIMIT $1`;
        params.push(limit);
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get activity statistics
  async getActivityStats(userId, userRole) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_activities,
          COUNT(*) FILTER (WHERE action = 'CREATE') as create_count,
          COUNT(*) FILTER (WHERE action = 'UPDATE') as update_count,
          COUNT(*) FILTER (WHERE action = 'DELETE') as delete_count,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h_count
        FROM activity_logs
      `;
      const params = [];
      
      // If not admin, only show their own stats
      if (userRole !== 'admin') {
        query += ` WHERE user_id = $1`;
        params.push(userId);
      }

      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get logs for specific entity
  async getEntityLogs(entityType, entityId, userId, userRole) {
    try {
      let query = `
        SELECT al.*, u.name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.entity_type = $1 AND al.entity_id = $2
      `;
      const params = [entityType, entityId];
      
      // If not admin, only show their own logs for this entity
      if (userRole !== 'admin') {
        query += ` AND al.user_id = $3`;
        params.push(userId);
      }
      
      query += ` ORDER BY al.created_at DESC`;

      const result = await pool.query(query, params);
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
    
    // Fire and forget - don't await
    this.createActivityLog(logData).catch(err => 
      console.error('Failed to log activity:', err)
    );
  }
}

module.exports = new ActivityLogService();
