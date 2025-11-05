const pool = require("../config/db");

class ReportService {
  async generateReportNumber() {
    const result = await pool.query("SELECT COUNT(*) as count FROM reports");
    const count = parseInt(result.rows[0].count) + 1;
    return `REP${count.toString().padStart(6, "0")}`;
  }

  async getAllReports() {
    const result = await pool.query(
      `SELECT r.*, p.name as patient_name, p.patientid, p.phone as patient_phone,
        a.appointment_date, a.appointment_time,
        (SELECT json_agg(json_build_object('id', rd.id, 'file_name', rd.file_name, 
         'file_path', rd.file_path, 'file_type', rd.file_type, 'file_size', rd.file_size, 
         'uploaded_at', rd.uploaded_at)) FROM report_documents rd WHERE rd.report_id = r.id) as documents
       FROM reports r 
       LEFT JOIN appointments a ON r.appointment_id = a.id 
       LEFT JOIN patients p ON a.patient_id = p.id 
       ORDER BY r.created_at DESC`
    );
    return result.rows;
  }

  async getReportById(id) {
    const result = await pool.query(
      `SELECT r.*, p.name as patient_name, p.patientid, p.phone as patient_phone,
        a.appointment_date, a.appointment_time,
        (SELECT json_agg(json_build_object('id', rd.id, 'file_name', rd.file_name, 
         'file_path', rd.file_path, 'file_type', rd.file_type, 'file_size', rd.file_size, 
         'uploaded_at', rd.uploaded_at)) FROM report_documents rd WHERE rd.report_id = r.id) as documents
       FROM reports r 
       LEFT JOIN appointments a ON r.appointment_id = a.id 
       LEFT JOIN patients p ON a.patient_id = p.id 
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getReportsByAppointmentId(appointmentId) {
    const result = await pool.query(
      `SELECT r.*, p.name as patient_name, p.patientid,
        a.appointment_date, a.appointment_time,
        (SELECT json_agg(json_build_object('id', rd.id, 'file_name', rd.file_name, 
         'file_path', rd.file_path, 'file_type', rd.file_type, 'file_size', rd.file_size, 
         'uploaded_at', rd.uploaded_at)) FROM report_documents rd WHERE rd.report_id = r.id) as documents
       FROM reports r 
       LEFT JOIN appointments a ON r.appointment_id = a.id 
       LEFT JOIN patients p ON a.patient_id = p.id 
       WHERE r.appointment_id = $1
       ORDER BY r.created_at DESC`,
      [appointmentId]
    );
    return result.rows;
  }

  async createReport(userId, reportData) {
    const reportNumber = await this.generateReportNumber();
    const result = await pool.query(
      `INSERT INTO reports (report_number, user_id, appointment_id, report_type, 
       report_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reportNumber, userId, reportData.appointment_id,
       reportData.report_type, reportData.report_date]
    );
    return result.rows[0];
  }

  async updateReport(id, reportData) {
    const result = await pool.query(
      `UPDATE reports SET appointment_id = $1, report_type = $2, 
       report_date = $3 WHERE id = $4 RETURNING *`,
      [reportData.appointment_id, reportData.report_type,
       reportData.report_date, id]
    );
    return result.rows[0];
  }

  async deleteReport(id) {
    await pool.query("DELETE FROM report_documents WHERE report_id = $1", [id]);
    const result = await pool.query("DELETE FROM reports WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
  }

  async addDocument(reportId, documentData) {
    const result = await pool.query(
      `INSERT INTO report_documents (report_id, file_name, file_path, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reportId, documentData.file_name, documentData.file_path, 
       documentData.file_type, documentData.file_size]
    );
    return result.rows[0];
  }

  async deleteDocument(documentId) {
    const result = await pool.query(
      "DELETE FROM report_documents WHERE id = $1 RETURNING *", [documentId]
    );
    return result.rows[0];
  }

  async getDocumentById(documentId) {
    const result = await pool.query(
      "SELECT * FROM report_documents WHERE id = $1", [documentId]
    );
    return result.rows[0];
  }
}

module.exports = new ReportService();
