// ============================================
// Patient Service Layer
// Business logic for patient management
// ============================================

const pool = require("../config/db");

class PatientService {
  // Get all patients with filters
  async getAllPatients(filters = {}) {
    try {
      let query = `SELECT * FROM patients`;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get patient by ID
  async getPatientById(id, userId) {
    try {
      const result = await pool.query("SELECT * FROM patients WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new patient
  async createPatient(userId, patientData) {
    try {
      const patientId = await this.generatePatientId();

      const result = await pool.query(
        `INSERT INTO patients 
      (user_id, patientid, name, email, phone, date_of_birth, gender, address, emergency_contact, blood_type, allergies, medical_history, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
        [
          userId,
          patientId,
          patientData.name,
          patientData.email || null,
          patientData.phone || null,
          patientData.date_of_birth || null,
          patientData.gender || null,
          patientData.address || null,
          patientData.emergency_contact || null,
          patientData.blood_type || null,
          patientData.allergies || null,
          patientData.medical_history || null,
          patientData.status || "active",
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update patient
  async updatePatient(id, userId, patientData) {
    try {
      const result = await pool.query(
        `UPDATE patients 
      SET user_id = $1, name = $2, email = $3, phone = $4, date_of_birth = $5, gender = $6, 
          address = $7, emergency_contact = $8, blood_type = $9, 
          allergies = $10, medical_history = $11, status = $12
      WHERE id = $13
      RETURNING *`,
        [
          userId,
          patientData.name,
          patientData.email,
          patientData.phone,
          patientData.date_of_birth,
          patientData.gender,
          patientData.address,
          patientData.emergency_contact,
          patientData.blood_type,
          patientData.allergies,
          patientData.medical_history,
          patientData.status,
          id,
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete patient
  async deletePatient(id) {
    try {
      const result = await pool.query(
        "DELETE FROM patients WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Generate unique patient ID (Format: 4numbers + 1alphabet + 4numbers)
  async generatePatientId() {
    const firstPart = Math.floor(1000 + Math.random() * 9000); // 4 random digits (1000-9999)
    const alphabet = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random A-Z
    const secondPart = Math.floor(1000 + Math.random() * 9000); // 4 random digits (1000-9999)
    return `${firstPart}${alphabet}${secondPart}`;
  }
}

module.exports = new PatientService();
