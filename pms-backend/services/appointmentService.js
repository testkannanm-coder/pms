const pool = require('../config/db');
const medicalRecordService = require('./medicalRecordService');

class AppointmentService {
  // Get all appointments with filters
  async getAllAppointments(filters = {}) {
    try {
      let query = `
        SELECT a.*, p.name as patient_name, p.phone as patient_phone,
               u.name as doctor_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.doctor_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (filters.status) {
        query += ` AND a.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.patient_id) {
        query += ` AND a.patient_id = $${paramIndex}`;
        params.push(filters.patient_id);
        paramIndex++;
      }

      if (filters.startDate) {
        query += ` AND a.appointment_date >= $${paramIndex}`;
        params.push(filters.startDate);
        paramIndex++;
      }

      if (filters.endDate) {
        query += ` AND a.appointment_date <= $${paramIndex}`;
        params.push(filters.endDate);
        paramIndex++;
      }

      const sortBy = filters.sortBy || 'appointment_date';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY a.${sortBy} ${sortOrder}`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get today's appointments
  async getTodaysAppointments() {
    try {
      const result = await pool.query(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        WHERE a.appointment_date = CURRENT_DATE
        ORDER BY a.appointment_time ASC
      `);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments(days = 7) {
    try {
      const result = await pool.query(`
        SELECT a.*, p.name as patient_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        WHERE a.appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1
        AND a.status = 'scheduled'
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
      `, [days]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get appointment statistics
  async getAppointmentStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
          COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE) as today_count
        FROM appointments
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get appointment by ID
  async getAppointmentById(id) {
    try {
      const result = await pool.query(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email,
               u.name as doctor_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.doctor_id = u.id
        WHERE a.id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create appointment
  async createAppointment(userId, appointmentData) {
    try {
      const result = await pool.query(`
        INSERT INTO appointments 
        (user_id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        userId,
        appointmentData.patient_id,
        appointmentData.doctor_id || null,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.status || 'scheduled',
        appointmentData.reason || null,
        appointmentData.notes || null
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update appointment
  async updateAppointment(id, userId, appointmentData) {
    try {
      const currentAppointment = await this.getAppointmentById(id);

      const result = await pool.query(`
        UPDATE appointments 
        SET user_id = $1, patient_id = $2, doctor_id = $3, appointment_date = $4, 
            appointment_time = $5, status = $6, reason = $7, notes = $8
        WHERE id = $9
        RETURNING *
      `, [
        userId,
        appointmentData.patient_id,
        appointmentData.doctor_id,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.status,
        appointmentData.reason,
        appointmentData.notes,
        id
      ]);

      const updatedAppointment = result.rows[0];

      if (updatedAppointment && 
          (appointmentData.status === 'completed' || appointmentData.status === 'rescheduled') &&
          currentAppointment.status !== appointmentData.status) {
        
        const existingRecord = await medicalRecordService.getMedicalRecordByAppointmentId(id);
        
        if (!existingRecord) {
          await medicalRecordService.createMedicalRecord(userId, {
            patient_id: updatedAppointment.patient_id,
            appointment_id: updatedAppointment.id,
            visit_date: updatedAppointment.appointment_date,
            symptoms: '',
            diagnosis: '',
            treatment: '',
            notes: appointmentData.notes || ''
          });
        }
      }

      return updatedAppointment;
    } catch (error) {
      throw error;
    }
  }

  // Cancel appointment
  async cancelAppointment(id) {
    try {
      const result = await pool.query(`
        UPDATE appointments 
        SET status = 'cancelled'
        WHERE id = $1
        RETURNING *
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete appointment
  async deleteAppointment(id) {
    try {
      const result = await pool.query(
        'DELETE FROM appointments WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}


module.exports = new AppointmentService();
