const pool = require("../config/db");

class MedicalRecordService {
  // Get all medical records
  async getAllMedicalRecords() {
    try {
      const query = `
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patientid,
          u.name as doctor_name,
          a.appointment_date,
          a.appointment_time
        FROM medical_records mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN users u ON mr.user_id = u.id
        LEFT JOIN appointments a ON mr.appointment_id = a.id
        ORDER BY mr.visit_date DESC, mr.created_at DESC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get medical record by ID
  async getMedicalRecordById(id) {
    try {
      const query = `
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patientid,
          p.date_of_birth,
          p.gender,
          p.blood_type,
          p.allergies,
          u.name as doctor_name,
          a.appointment_date,
          a.appointment_time
        FROM medical_records mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN users u ON mr.user_id = u.id
        LEFT JOIN appointments a ON mr.appointment_id = a.id
        WHERE mr.id = $1
      `;

      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;

      const record = result.rows[0];

      const prescriptionsQuery = `
        SELECT * FROM prescriptions 
        WHERE medical_record_id = $1 
        ORDER BY created_at DESC
      `;
      const prescriptions = await pool.query(prescriptionsQuery, [id]);
      record.prescriptions = prescriptions.rows;

      return record;
    } catch (error) {
      throw error;
    }
  }

  // Get medical record by appointment ID
  async getMedicalRecordByAppointmentId(appointmentId) {
    try {
      const query = `
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patientid,
          p.date_of_birth,
          p.gender,
          p.blood_type,
          p.allergies,
          u.name as doctor_name
        FROM medical_records mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN users u ON mr.user_id = u.id
        WHERE mr.appointment_id = $1
      `;

      const result = await pool.query(query, [appointmentId]);
      if (result.rows.length === 0) return null;

      const record = result.rows[0];

      const prescriptionsQuery = `
        SELECT * FROM prescriptions 
        WHERE medical_record_id = $1 
        ORDER BY created_at DESC
      `;
      const prescriptions = await pool.query(prescriptionsQuery, [record.id]);
      record.prescriptions = prescriptions.rows;

      return record;
    } catch (error) {
      throw error;
    }
  }

  // Get patient medical history
  async getPatientHistory(patientId) {
    try {
      const query = `
        SELECT 
          mr.*,
          u.name as doctor_name,
          a.appointment_date,
          a.appointment_time
        FROM medical_records mr
        LEFT JOIN users u ON mr.user_id = u.id
        LEFT JOIN appointments a ON mr.appointment_id = a.id
        WHERE mr.patient_id = $1
        ORDER BY mr.visit_date DESC
      `;

      const result = await pool.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Create medical record
  async createMedicalRecord(userId, recordData) {
    try {
      const {
        patient_id,
        appointment_id,
        visit_date,
        symptoms,
        diagnosis,
        treatment,
        notes,
        follow_up_required,
        follow_up_date,
      } = recordData;

      const query = `
        INSERT INTO medical_records (
          user_id, patient_id, appointment_id, visit_date,
          symptoms, diagnosis, treatment, notes, 
          follow_up_required, follow_up_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        userId,
        patient_id,
        appointment_id || null,
        visit_date || new Date(),
        symptoms || "",
        diagnosis || "",
        treatment || "",
        notes || "",
        follow_up_required || false,
        follow_up_date || null,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update medical record
  async updateMedicalRecord(id, userId, recordData) {
    try {
      const {
        symptoms,
        diagnosis,
        treatment,
        notes,
        follow_up_required,
        follow_up_date,
      } = recordData;

      const query = `
        UPDATE medical_records SET
          user_id = $1,
          symptoms = $2,
          diagnosis = $3,
          treatment = $4,
          notes = $5,
          follow_up_required = $6,
          follow_up_date = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const values = [
        userId,
        symptoms,
        diagnosis,
        treatment,
        notes,
        follow_up_required,
        follow_up_date || null,
        id,
      ];

      const result = await pool.query(query, values);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Delete medical record
  async deleteMedicalRecord(id) {
    try {
      const query = `
        DELETE FROM medical_records 
        WHERE id = $1
        RETURNING id
      `;

      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Add prescription to medical record
  async addPrescription(medicalRecordId, prescriptionData) {
    try {
      const {
        medication_name,
        dosage,
        frequency,
        duration,
        quantity,
        refills,
        instructions,
      } = prescriptionData;

      const query = `
        INSERT INTO prescriptions (
          medical_record_id, medication_name, dosage, frequency,
          duration, quantity, refills, instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [
        medicalRecordId,
        medication_name,
        dosage,
        frequency,
        duration,
        quantity || 0,
        refills || 0,
        instructions || "",
      ];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update prescription
  async updatePrescription(id, prescriptionData) {
    try {
      const {
        medication_name,
        dosage,
        frequency,
        duration,
        quantity,
        refills,
        instructions,
      } = prescriptionData;

      const query = `
        UPDATE prescriptions SET
          medication_name = $1,
          dosage = $2,
          frequency = $3,
          duration = $4,
          quantity = $5,
          refills = $6,
          instructions = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const values = [
        medication_name,
        dosage,
        frequency,
        duration,
        quantity,
        refills,
        instructions,
        id,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete prescription
  async deletePrescription(id) {
    try {
      const query = `DELETE FROM prescriptions WHERE id = $1 RETURNING id`;
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MedicalRecordService();
