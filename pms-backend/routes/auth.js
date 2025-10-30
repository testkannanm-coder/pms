const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/db");
const passport = require("../config/passport");
const { sendPasswordResetEmail } = require("../config/email");
require("dotenv").config();

// POST /register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with role
    const userRole = role || 'staff'; // Default to 'staff' if no role provided
    const result = await pool.query(
      "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role",
      [email, hashedPassword, name || null, userRole]
    );

    const newUser = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      token,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      message: "User registered successfully"
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check if user is OAuth-only user (no password set yet)
    if (!user.password && user.provider === 'google') {
      return res.status(400).json({ 
        message: "This account was created with Google. Please use 'Continue with Google' or reset your password to set one." 
      });
    }

    // Check if password exists
    if (!user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      email: user.email,
      name: user.name,
      message: "Login successful"
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Google OAuth routes
// Initiates the Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendURL}/auth/callback?token=${token}&email=${req.user.email}&name=${req.user.name || ""}`);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`);
    }
  }
);

// POST /forgot-password

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // ✅ Check if user exists in DB
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      // 🔹 Show explicit message now
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const user = result.rows[0];

    // ✅ Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // ✅ Save token to DB
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [hashedToken, expiryTime, user.id]
    );

    // ✅ Send email
    try {
      await sendPasswordResetEmail(
        user.name,      // user's name
        user.email,     // email
        resetToken,     // plain token for URL
        !!user.password // has password or not
      );

      return res.json({ message: `Password reset link has been sent to ${user.email}.` });
    } catch (emailError) {
      console.error("Email send error:", emailError);

      // Roll back token if email fails
      await pool.query(
        "UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1",
        [user.id]
      );

      return res.status(500).json({ 
        message: "Failed to send reset email. Please try again later." 
      });
    }

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error during password reset request" });
  }
});

// POST /reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2",
      [hashedToken, new Date()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset." 
      });
    }

    const user = result.rows[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successful. You can now login with your new password." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error during password reset" });
  }
});

// GET /users - Get all users (admin only for now)
router.get("/users", async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = "SELECT id, name, email, role, provider, created_at FROM users";
    const params = [];
    
    if (role) {
      query += " WHERE role = $1";
      params.push(role);
    }
    
    query += " ORDER BY created_at DESC";
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      message: "Users retrieved successfully"
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching users" 
    });
  }
});

// PUT /users/:id - Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role",
      [name, email, role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: "User updated successfully"
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error updating user" 
    });
  }
});

// DELETE /users/:id - Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error deleting user" 
    });
  }
});

module.exports = router;
