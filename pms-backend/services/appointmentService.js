const pool = require('../config/db');
const medicalRecordService = require('./medicalRecordService');

class AppointmentService {
  // Get all appointments with filters
  async getAllAppointments() {
    try {
      const result = await pool.query(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone,
               u.name as doctor_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.doctor_id = u.id
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
      `);
      return result.rows;
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
