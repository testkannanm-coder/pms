const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// GET all patients
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM patients ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET patient by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM patients WHERE id=$1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add patient
router.post("/", authMiddleware, async (req, res) => {
  const {
    name,
    age,
    gender,
    phone,
    address,
    blood_type,
  } = req.body;

  // ✅ Generate random 9-digit alphanumeric patient ID (e.g., 1234K5678)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomAlpha = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random letter A–Z
  const randomEnd = Math.floor(1000 + Math.random() * 9000);
  const patientid = `${randomNum}${randomAlpha}${randomEnd}`;

  try {
    const result = await pool.query(
      `INSERT INTO patients (patientid, name, age, gender, phone, address, blood_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [patientid, name, parseInt(age), gender, phone, address, blood_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// PUT update patient
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, age, gender, phone, address, blood_type } = req.body;

  try {
    const result = await pool.query(
      `UPDATE patients SET name=$1, age=$2, gender=$3, phone=$4, address=$5, blood_type=$6 WHERE id=$7 RETURNING *`,
      [name, age, gender, phone, address, blood_type, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM patients WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE patient
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM patients WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
