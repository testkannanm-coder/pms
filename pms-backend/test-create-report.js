const pool = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testCreateReport() {
  try {
    // Create a valid JWT token
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    console.log('Generated token:', token);
    
    // Test data
    const reportData = {
      appointment_id: 1,
      report_type: 'Blood Test',
      report_date: '2025-11-05'
    };
    
    console.log('Testing report creation with data:', reportData);
    
    // This simulates what the frontend sends
    const axios = require('axios');
    
    const response = await axios.post('http://localhost:5000/reports', reportData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success! Response:', response.data);
    
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data || error.message);
  } finally {
    process.exit();
  }
}

testCreateReport();