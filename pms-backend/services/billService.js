// ============================================
// Bill Service
// Business logic for bill management
// ============================================

const pool = require("../config/db");

const billService = {
  // Generate bill number (format: BILL-YYYYMMDD-XXXX)
  generateBillNumber: () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BILL-${year}${month}${day}-${random}`;
  },

  // Create a new bill
  createBill: async (userId, billData) => {
    const {
      patient_id,
      appointment_id,
      consultation_fee = 500.00,
      additional_charges = 0.00,
      discount = 0.00,
      notes = ''
    } = billData;

    // Calculate total amount
    const total_amount = parseFloat(consultation_fee) + parseFloat(additional_charges) - parseFloat(discount);

    // Generate unique bill number
    const bill_number = billService.generateBillNumber();

    const query = `
      INSERT INTO bills 
      (bill_number, user_id, patient_id, appointment_id, consultation_fee, additional_charges, discount, total_amount, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      bill_number,
      userId,
      patient_id,
      appointment_id,
      consultation_fee,
      additional_charges,
      discount,
      total_amount,
      notes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get all bills
  getAllBills: async (userId) => {
    const query = `
      SELECT 
        b.*,
        p.name as patient_name,
        p.patientid,
        a.appointment_date,
        a.appointment_time,
        a.status as appointment_status
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      JOIN appointments a ON b.appointment_id = a.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Get bill by ID
  getBillById: async (billId, userId) => {
    const query = `
      SELECT 
        b.*,
        p.name as patient_name,
        p.patientid,
        p.phone as patient_phone,
        p.email as patient_email,
        a.appointment_date,
        a.appointment_time,
        a.status as appointment_status,
        a.reason as appointment_reason,
        u.name as doctor_name
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      JOIN appointments a ON b.appointment_id = a.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const result = await pool.query(query, [billId, userId]);
    return result.rows[0];
  },

  // Get bills by patient ID
  getBillsByPatientId: async (patientId, userId) => {
    const query = `
      SELECT 
        b.*,
        a.appointment_date,
        a.appointment_time,
        a.status as appointment_status
      FROM bills b
      JOIN appointments a ON b.appointment_id = a.id
      WHERE b.patient_id = $1 AND b.user_id = $2
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [patientId, userId]);
    return result.rows;
  },

  // Get bill by appointment ID
  getBillByAppointmentId: async (appointmentId, userId) => {
    const query = `
      SELECT * FROM bills 
      WHERE appointment_id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [appointmentId, userId]);
    return result.rows[0];
  },

  // Update bill
  updateBill: async (billId, userId, billData) => {
    const {
      consultation_fee,
      additional_charges,
      discount,
      payment_status,
      payment_method,
      notes
    } = billData;

    // Calculate new total amount
    const total_amount = parseFloat(consultation_fee || 0) + parseFloat(additional_charges || 0) - parseFloat(discount || 0);

    const query = `
      UPDATE bills 
      SET 
        consultation_fee = COALESCE($1, consultation_fee),
        additional_charges = COALESCE($2, additional_charges),
        discount = COALESCE($3, discount),
        total_amount = $4,
        payment_status = COALESCE($5, payment_status),
        payment_method = COALESCE($6, payment_method),
        notes = COALESCE($7, notes)
      WHERE id = $8 AND user_id = $9
      RETURNING *
    `;

    const values = [
      consultation_fee,
      additional_charges,
      discount,
      total_amount,
      payment_status,
      payment_method,
      notes,
      billId,
      userId
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update payment status
  updatePaymentStatus: async (billId, userId, paymentStatus, paymentMethod = null) => {
    const query = `
      UPDATE bills 
      SET payment_status = $1, payment_method = $2
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [paymentStatus, paymentMethod, billId, userId]);
    return result.rows[0];
  },

  // Delete bill
  deleteBill: async (billId, userId) => {
    const query = `
      DELETE FROM bills 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [billId, userId]);
    return result.rows[0];
  }
};

module.exports = billService;
