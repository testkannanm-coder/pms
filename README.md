# Patient Management System (PMS)

A full-stack web application for managing patient records, appointments, medical records, and activity logs.

---

## 🎯 How The System Works - Complete Overview

### Data Flow Architecture

```
User Browser
    ↓
React Components (UI)
    ↓
React Hooks (useState, useEffect, useContext)
    ↓
API Layer (axios calls)
    ↓
Express Routes (Backend)
    ↓
Service Layer (Business Logic)
    ↓
PostgreSQL Database
```

---

## 🔧 Technologies & Concepts Used

### **Frontend Technologies:**

#### 1. **React Hooks** - State & Side Effects Management
- **`useState`** - Managing component state (form data, lists, loading states)
  ```javascript
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  ```

- **`useEffect`** - Data fetching, subscriptions, side effects
  ```javascript
  useEffect(() => {
    fetchPatients(); // Runs when component mounts
  }, []); // Empty array = run once on mount
  ```

- **`useContext`** - Access global state (authentication)
  ```javascript
  const { user, token } = useContext(AuthContext);
  ```

- **`useNavigate`** - Programmatic navigation
  ```javascript
  const navigate = useNavigate();
  navigate('/patients'); // Redirect to patients page
  ```

#### 2. **Context API** - Global State Management
- **Purpose**: Share authentication data across all components without prop drilling
- **Location**: `client/src/context/AuthContext.jsx`
- **What it stores**:
  - User information (id, name, email, role)
  - JWT token
  - Login/logout functions

```javascript
// AuthContext provides:
const { user, token, login, logout } = useContext(AuthContext);

// Used in every component that needs auth info
```

#### 3. **API Layer** - Centralized HTTP Requests
- **Purpose**: Single place for all backend communications
- **Location**: `client/src/api/`
- **Uses**: Axios library for HTTP requests

```javascript
// Example: patientApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const getPatients = async (token) => {
  const response = await axios.get(`${API_URL}/patients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

#### 4. **Material-UI (MUI)** - Component Library
- Pre-built React components: Tables, Forms, Buttons, Cards
- Consistent design system
- Responsive layouts with Grid system

#### 5. **React Router** - Client-Side Routing
- **Purpose**: Navigate between pages without page reload
- **Location**: `client/src/routes.jsx`
- Components: `BrowserRouter`, `Routes`, `Route`, `Navigate`

```javascript
// Protected routes - redirect if not logged in
<Route path="/patients" element={
  <ProtectedRoute>
    <PatientList />
  </ProtectedRoute>
} />
```

---

### **Backend Technologies:**

#### 1. **Express.js** - Web Framework
- **Purpose**: Handle HTTP requests, routing, middleware
- **Location**: `pms-backend/index.js`

```javascript
app.use('/patients', patientRoutes);  // Route mounting
app.use('/appointments', appointmentRoutes);
```

#### 2. **Service Layer Pattern** - Business Logic Separation
- **Purpose**: Separate business logic from route handlers
- **Location**: `pms-backend/services/`
- **Benefits**: Reusable, testable, maintainable code

```javascript
// Route just handles HTTP → calls service
router.get('/', authMiddleware, async (req, res) => {
  const patients = await patientService.getAllPatients();
  res.json(patients);
});

// Service contains actual logic
class PatientService {
  async getAllPatients() {
    return await db.query('SELECT * FROM patients');
  }
}
```

#### 3. **JWT (JSON Web Tokens)** - Authentication
- **Purpose**: Secure, stateless authentication
- **How it works**:
  1. User logs in → backend creates JWT
  2. Frontend stores JWT (localStorage + Context)
  3. Every request sends JWT in headers
  4. Backend verifies JWT before processing request

```javascript
// Login creates token
const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '7d' });

// Frontend sends it
headers: { Authorization: `Bearer ${token}` }

// Middleware verifies it
const decoded = jwt.verify(token, SECRET_KEY);
```

#### 4. **PostgreSQL** - Relational Database
- **Purpose**: Store all application data
- **Tables**: users, patients, appointments, medical_records, prescriptions, activity_logs
- **Relationships**: Foreign keys linking tables

#### 5. **Middleware** - Request Processing Pipeline
- **`authMiddleware.js`**: Verify JWT token before allowing access
- **`cors`**: Allow frontend (port 5173) to call backend (port 5000)
- **`express.json()`**: Parse JSON request bodies

---

## 📊 Complete Data Flow Examples

### Example 1: Viewing Patient List

**Step-by-Step Flow:**

1. **User Action**: Navigate to `/patients` URL
   
2. **React Router**: Loads `PatientList.jsx` component

3. **Component Mount**: `useEffect` hook runs
   ```javascript
   useEffect(() => {
     fetchPatients();
   }, []);
   ```

4. **Get Token from Context**:
   ```javascript
   const { token } = useContext(AuthContext);
   ```

5. **API Call**: Call `patientApi.js`
   ```javascript
   const fetchPatients = async () => {
     setLoading(true);
     const data = await getPatients(token);
     setPatients(data);
     setLoading(false);
   };
   ```

6. **HTTP Request**: Axios sends GET request
   ```
   GET http://localhost:5000/patients
   Headers: { Authorization: "Bearer eyJhbGc..." }
   ```

7. **Backend Route**: Express receives request
   ```javascript
   router.get('/', authMiddleware, async (req, res) => {
     // authMiddleware runs first
   ```

8. **Auth Middleware**: Verify JWT token
   ```javascript
   const token = req.headers.authorization.split(' ')[1];
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.user = decoded; // Attach user to request
   next(); // Continue to route handler
   ```

9. **Route Handler**: Call service layer
   ```javascript
   const patients = await patientService.getAllPatients();
   res.json(patients);
   ```

10. **Service Layer**: Query database
    ```javascript
    const result = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
    return result.rows;
    ```

11. **Database**: PostgreSQL executes query, returns rows

12. **Response**: Data flows back through service → route → HTTP response

13. **Frontend Receives**: Axios promise resolves with data

14. **State Update**: `setPatients(data)` triggers re-render

15. **UI Renders**: Material-UI Table displays patient list

---

### Example 2: Creating an Appointment

**Step-by-Step Flow:**

1. **User Action**: Fill form in `AddAppointment.jsx`, click Save

2. **Form Submission**:
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     const appointmentData = {
       patient_id: selectedPatient.id,
       doctor_id: selectedDoctor.id,
       appointment_date: date,
       reason: reason
     };
     await createAppointment(appointmentData, token);
     navigate('/appointments');
   };
   ```

3. **API Call**: `appointmentApi.js`
   ```javascript
   export const createAppointment = async (data, token) => {
     const response = await axios.post(`${API_URL}/appointments`, data, {
       headers: { Authorization: `Bearer ${token}` }
     });
     return response.data;
   };
   ```

4. **HTTP Request**:
   ```
   POST http://localhost:5000/appointments
   Headers: { Authorization: "Bearer ..." }
   Body: { patient_id: 5, doctor_id: 2, ... }
   ```

5. **Backend Route**:
   ```javascript
   router.post('/', authMiddleware, async (req, res) => {
     const userId = req.user.id; // From JWT
     const appointment = await appointmentService.createAppointment(userId, req.body);
     res.status(201).json(appointment);
   });
   ```

6. **Service Layer**:
   ```javascript
   async createAppointment(userId, data) {
     const query = `
       INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *
     `;
     const result = await db.query(query, [
       data.patient_id,
       data.doctor_id,
       data.appointment_date,
       data.reason,
       userId
     ]);
     
     // Log activity
     await activityLogService.logActivity({
       user_id: userId,
       action: 'CREATE',
       entity_type: 'appointment',
       entity_id: result.rows[0].id
     });
     
     return result.rows[0];
   }
   ```

7. **Database**: PostgreSQL inserts record, returns new row

8. **Response**: New appointment data sent back to frontend

9. **Navigation**: `navigate('/appointments')` redirects to list

10. **List Refreshes**: `AppointmentList` component mounts, fetches updated data

---

## 💻 Real Code Examples from the Project

### 1. How PatientList Component Works (Frontend)

**File**: `client/src/components/patients/PatientList.jsx`

```javascript
import { useEffect, useState, useContext } from "react";
import { getPatients, deletePatient } from "../../api/patientApi";
import { AuthContext } from "../../context/AuthContext";

export default function PatientList() {
  // 🎯 HOOKS USED:
  
  // 1. useContext - Get global auth state
  const { user, getToken } = useContext(AuthContext);
  
  // 2. useState - Manage component state
  const [patients, setPatients] = useState([]);        // List of patients
  const [loading, setLoading] = useState(true);        // Loading indicator
  const [error, setError] = useState("");              // Error messages
  const [search, setSearch] = useState("");            // Search filter
  const [statusFilter, setStatusFilter] = useState(""); // Status filter
  
  // 3. useEffect - Fetch data when component mounts or filters change
  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter]); // Re-run when these change
  
  // 📡 API CALL FUNCTION
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();  // Get JWT from context
      
      // Call API layer
      const data = await getPatients(token, { search, status: statusFilter });
      
      setPatients(data);  // Update state → triggers re-render
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // 🖼️ RENDER UI
  return (
    <div>
      {loading ? <CircularProgress /> : (
        <Table>
          {patients.map(patient => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.phone}</TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
```

**What happens here:**
1. Component mounts → `useEffect` runs → calls `fetchPatients()`
2. `fetchPatients()` gets token from Context
3. Calls API layer (`getPatients`)
4. API makes HTTP request to backend
5. Data comes back → `setPatients(data)` updates state
6. State update → React re-renders → Table shows data

---

### 2. How API Layer Works (Frontend)

**File**: `client/src/api/patientApi.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 📡 GET ALL PATIENTS
export const getPatients = async (token, filters = {}) => {
  try {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    
    // Make HTTP GET request
    const response = await axios.get(`${API_URL}/patients?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // JWT in header
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;  // Return data to component
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch patients';
  }
};

// 📡 CREATE PATIENT
export const createPatient = async (patientData, token) => {
  const response = await axios.post(`${API_URL}/patients`, patientData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// 📡 UPDATE PATIENT
export const updatePatient = async (id, patientData, token) => {
  const response = await axios.put(`${API_URL}/patients/${id}`, patientData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// 📡 DELETE PATIENT
export const deletePatient = async (id, token) => {
  const response = await axios.delete(`${API_URL}/patients/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};
```

**What this does:**
- Centralizes all HTTP calls for patients
- Adds JWT token to every request
- Handles errors consistently
- Used by all patient components

---

### 3. How AuthContext Works (Global State)

**File**: `client/src/context/AuthContext.jsx`

```javascript
import { createContext, useState } from "react";

// 1️⃣ CREATE CONTEXT
export const AuthContext = createContext();

// 2️⃣ PROVIDER COMPONENT
export const AuthProvider = ({ children }) => {
  // State: user object stored in localStorage
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // 🔐 LOGIN FUNCTION
  const login = (userData) => {
    // Save token separately for easy access
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);  // Update state
  };

  // 🚪 LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🎫 GET TOKEN HELPER
  const getToken = () => {
    return localStorage.getItem("token") || user?.token;
  };

  // 3️⃣ PROVIDE VALUES TO ALL CHILDREN
  return (
    <AuthContext.Provider value={{ user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**How to use in components:**
```javascript
// In Login.jsx
const { login } = useContext(AuthContext);
const handleLogin = async () => {
  const response = await loginApi(email, password);
  login(response);  // Saves user globally
};

// In any component
const { user, getToken } = useContext(AuthContext);
console.log(user.name);  // Access user info
const token = getToken(); // Get JWT for API calls
```

**Why use Context?**
- ✅ User info available in ANY component
- ✅ No need to pass props down many levels
- ✅ Single source of truth for auth state
- ✅ Persists across page refreshes (localStorage)

---

### 4. How Backend Routes Work

**File**: `pms-backend/routes/patients.js`

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const patientService = require('../services/patientService');

// 📡 GET ALL PATIENTS
// Route: GET /patients
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 1. authMiddleware already verified JWT
    // 2. req.user contains decoded JWT data
    
    // Get query parameters (filters)
    const { search, status, gender } = req.query;
    
    // Call service layer
    const patients = await patientService.getAllPatients({
      search,
      status,
      gender
    });
    
    // Send JSON response
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📡 CREATE PATIENT
// Route: POST /patients
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // From JWT
    const patientData = req.body;  // From request body
    
    // Validate data
    if (!patientData.name || !patientData.phone) {
      return res.status(400).json({ message: 'Name and phone required' });
    }
    
    // Create via service
    const newPatient = await patientService.createPatient(userId, patientData);
    
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📡 GET PATIENT BY ID
router.get('/:id', authMiddleware, async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  res.json(patient);
});

// 📡 UPDATE PATIENT
router.put('/:id', authMiddleware, async (req, res) => {
  const updated = await patientService.updatePatient(req.params.id, req.body);
  res.json(updated);
});

// 📡 DELETE PATIENT
router.delete('/:id', authMiddleware, async (req, res) => {
  await patientService.deletePatient(req.params.id);
  res.json({ message: 'Patient deleted successfully' });
});

module.exports = router;
```

**Route Breakdown:**
- `authMiddleware` - Runs BEFORE route handler, verifies JWT
- `req.user` - Contains user info from JWT (id, email, role)
- `req.body` - Contains data sent from frontend
- `req.params.id` - URL parameters (e.g., `/patients/5` → id = 5)
- `req.query` - Query string (e.g., `/patients?search=john` → search = "john")

---

### 5. How Service Layer Works (Business Logic)

**File**: `pms-backend/services/patientService.js`

```javascript
const db = require('../config/db');
const activityLogService = require('./activityLogService');

class PatientService {
  
  // 📊 GET ALL PATIENTS
  async getAllPatients(filters = {}) {
    let query = `
      SELECT p.*, 
             u.name as created_by_name,
             COUNT(DISTINCT a.id) as appointment_count
      FROM patients p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN appointments a ON p.id = a.patient_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add search filter
    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (p.name ILIKE $${params.length} 
                      OR p.phone ILIKE $${params.length}
                      OR p.email ILIKE $${params.length})`;
    }
    
    // Add status filter
    if (filters.status) {
      params.push(filters.status);
      query += ` AND p.status = $${params.length}`;
    }
    
    query += ` GROUP BY p.id, u.name ORDER BY p.created_at DESC`;
    
    // Execute query
    const result = await db.query(query, params);
    return result.rows;
  }
  
  // ➕ CREATE PATIENT
  async createPatient(userId, data) {
    const query = `
      INSERT INTO patients (name, phone, email, address, gender, 
                           date_of_birth, blood_type, user_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING *
    `;
    
    const values = [
      data.name,
      data.phone,
      data.email,
      data.address,
      data.gender,
      data.date_of_birth,
      data.blood_type,
      userId
    ];
    
    const result = await db.query(query, values);
    const newPatient = result.rows[0];
    
    // 📝 Log activity
    await activityLogService.logActivity({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'patient',
      entity_id: newPatient.id,
      details: `Created patient: ${newPatient.name}`
    });
    
    return newPatient;
  }
  
  // 🔍 GET BY ID
  async getPatientById(id) {
    const query = `
      SELECT p.*,
             u.name as created_by_name,
             json_agg(
               json_build_object(
                 'id', a.id,
                 'appointment_date', a.appointment_date,
                 'status', a.status,
                 'reason', a.reason
               )
             ) FILTER (WHERE a.id IS NOT NULL) as appointments
      FROM patients p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN appointments a ON p.id = a.patient_id
      WHERE p.id = $1
      GROUP BY p.id, u.name
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
  
  // ✏️ UPDATE PATIENT
  async updatePatient(id, data) {
    const query = `
      UPDATE patients 
      SET name = $1, phone = $2, email = $3, address = $4,
          gender = $5, date_of_birth = $6, blood_type = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await db.query(query, [
      data.name, data.phone, data.email, data.address,
      data.gender, data.date_of_birth, data.blood_type, id
    ]);
    
    return result.rows[0];
  }
  
  // ❌ DELETE PATIENT
  async deletePatient(id) {
    await db.query('DELETE FROM patients WHERE id = $1', [id]);
  }
}

module.exports = new PatientService();
```

**Service Layer Benefits:**
- ✅ Separate business logic from routes
- ✅ Complex queries in one place
- ✅ Reusable across multiple routes
- ✅ Easier to test
- ✅ Handles database transactions
- ✅ Logs activities automatically

---

### 6. How Authentication Middleware Works

**File**: `pms-backend/middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // 2. Extract token (format: "Bearer TOKEN_HERE")
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach user data to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    // 5. Continue to next middleware/route handler
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

**How it protects routes:**
```javascript
// Without middleware - anyone can access
router.get('/public', (req, res) => {
  res.json({ message: 'Public data' });
});

// With middleware - must have valid JWT
router.get('/protected', authMiddleware, (req, res) => {
  // Only runs if JWT is valid
  console.log(req.user.id);  // User ID from token
  res.json({ message: 'Protected data' });
});
```

---

## 📋 Summary: Technologies Used in This Project

### **Frontend:**
| Technology | Purpose | Files |
|------------|---------|-------|
| **React Hooks** | State management, side effects | All components |
| `useState` | Component state (data, loading, errors) | PatientList.jsx, AddPatient.jsx, etc. |
| `useEffect` | Fetch data on mount, watch dependencies | All list components |
| `useContext` | Access global auth state | Every component needing auth |
| `useNavigate` | Programmatic routing | Form components |
| **Context API** | Global state (auth) | AuthContext.jsx |
| **Axios** | HTTP requests | api/*.js files |
| **Material-UI** | UI components | All JSX files |
| **React Router** | Client-side routing | routes.jsx, App.jsx |

### **Backend:**
| Technology | Purpose | Files |
|------------|---------|-------|
| **Express.js** | Web server, routing | index.js, routes/*.js |
| **PostgreSQL** | Database | config/db.js, schema.sql |
| **JWT** | Authentication | auth.js, authMiddleware.js |
| **Bcrypt** | Password hashing | auth.js |
| **Service Layer** | Business logic | services/*.js |
| **Middleware** | Request processing | middleware/*.js |
| **Node-postgres (pg)** | Database driver | config/db.js |

---

## 🏗️ System Architecture

### Technology Stack

**Frontend:**
- React 18
- Material-UI (MUI) v5
- React Router v6
- Vite (Build tool)

**Backend:**
- Node.js with Express
- PostgreSQL Database
- JWT Authentication
- Passport.js (Google OAuth)

---

## 📁 Project Structure

```
pms/
├── client/                      # Frontend React Application
│   ├── public/
│   │   └── _redirects          # Netlify redirects for SPA
│   ├── src/
│   │   ├── api/                # API service layer
│   │   │   ├── activityLogApi.js
│   │   │   ├── appointmentApi.js
│   │   │   ├── medicalRecordApi.js
│   │   │   ├── patientApi.js
│   │   │   └── userApi.js
│   │   ├── components/         # React components
│   │   │   ├── activity-logs/
│   │   │   │   └── ActivityLogsList.jsx
│   │   │   ├── appointments/
│   │   │   │   ├── AddAppointment.jsx
│   │   │   │   ├── AppointmentList.jsx
│   │   │   │   └── EditAppointment.jsx
│   │   │   ├── auth/
│   │   │   │   ├── AuthCallback.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── common/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   ├── medical-records/
│   │   │   │   ├── EditMedicalRecord.jsx
│   │   │   │   └── ViewMedicalRecord.jsx
│   │   │   ├── patients/
│   │   │   │   ├── AddPatient.jsx
│   │   │   │   ├── EditPatient.jsx
│   │   │   │   ├── PatientDetails.jsx
│   │   │   │   └── PatientList.jsx
│   │   │   └── users/
│   │   │       ├── AddUser.jsx
│   │   │       ├── EditUser.jsx
│   │   │       └── UserList.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── App.jsx              # Main App component
│   │   ├── main.jsx             # Entry point
│   │   └── routes.jsx           # Route definitions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── pms-backend/                 # Backend Node.js Application
    ├── config/
    │   ├── db.js               # PostgreSQL connection
    │   ├── email.js            # Email configuration
    │   └── passport.js         # Passport strategies
    ├── database/
    │   └── schema.sql          # Database schema
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification
    │   └── patients.js
    ├── routes/
    │   ├── activityLogs.js
    │   ├── appointments.js
    │   ├── auth.js
    │   ├── medicalRecords.js
    │   └── patients.js
    ├── services/
    │   ├── activityLogService.js
    │   ├── appointmentService.js
    │   ├── medicalRecordService.js
    │   └── patientService.js
    ├── index.js                # Server entry point
    ├── migrate.js              # Database migration
    ├── package.json
    └── envexample              # Environment template

```

---

## 🔄 How Frontend & Backend Work Together

### 1. Authentication Flow

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Browser   │         │   Frontend  │         │   Backend    │
│  (User)     │         │   (React)   │         │  (Express)   │
└──────┬──────┘         └──────┬──────┘         └──────┬───────┘
       │                       │                       │
       │ 1. Enter credentials  │                       │
       │──────────────────────>│                       │
       │                       │ 2. POST /auth/login   │
       │                       │──────────────────────>│
       │                       │                       │ 3. Verify password
       │                       │                       │    (bcrypt.compare)
       │                       │                       │
       │                       │ 4. Return JWT token   │
       │                       │<──────────────────────│
       │                       │ 5. Store in context   │
       │                       │    & localStorage     │
       │ 6. Redirect to        │                       │
       │    Dashboard          │                       │
       │<──────────────────────│                       │
```

**Files Involved:**
- Frontend: `client/src/components/auth/Login.jsx`
- Frontend: `client/src/context/AuthContext.jsx`
- Backend: `pms-backend/routes/auth.js`
- Backend: `pms-backend/config/passport.js`

### 2. Data Fetching Flow (Example: Get Patients)

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │         │  Component  │         │   Backend    │         │  Database    │
└──────┬──────┘         └──────┬──────┘         └──────┬───────┘         └──────┬───────┘
       │                       │                       │                        │
       │ 1. Visit /patients    │                       │                        │
       │──────────────────────>│                       │                        │
       │                       │ 2. useEffect runs     │                        │
       │                       │    fetchPatients()    │                        │
       │                       │                       │                        │
       │                       │ 3. GET /patients      │                        │
       │                       │    + JWT Token        │                        │
       │                       │──────────────────────>│                        │
       │                       │                       │ 4. Verify JWT          │
       │                       │                       │    (authMiddleware)    │
       │                       │                       │                        │
       │                       │                       │ 5. SELECT * FROM       │
       │                       │                       │    patients            │
       │                       │                       │───────────────────────>│
       │                       │                       │                        │
       │                       │                       │ 6. Return rows         │
       │                       │                       │<───────────────────────│
       │                       │ 7. JSON response      │                        │
       │                       │<──────────────────────│                        │
       │                       │ 8. Update state       │                        │
       │                       │    setPatients(data)  │                        │
       │ 9. Render table       │                       │                        │
       │<──────────────────────│                       │                        │
```

**Files Involved:**
- Frontend Component: `client/src/components/patients/PatientList.jsx`
- Frontend API: `client/src/api/patientApi.js`
- Backend Route: `pms-backend/routes/patients.js`
- Backend Service: `pms-backend/services/patientService.js`
- Database: PostgreSQL `patients` table

### 3. Creating Data Flow (Example: Add Appointment)

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │         │  Component  │         │   Backend    │         │  Database    │
└──────┬──────┘         └──────┬──────┘         └──────┬───────┘         └──────┬───────┘
       │                       │                       │                        │
       │ 1. Fill form          │                       │                        │
       │    & click Save       │                       │                        │
       │──────────────────────>│                       │                        │
       │                       │ 2. handleSubmit()     │                        │
       │                       │    validate form      │                        │
       │                       │                       │                        │
       │                       │ 3. POST /appointments │                        │
       │                       │    + JWT + data       │                        │
       │                       │──────────────────────>│                        │
       │                       │                       │ 4. Verify JWT          │
       │                       │                       │                        │
       │                       │                       │ 5. INSERT INTO         │
       │                       │                       │    appointments        │
       │                       │                       │───────────────────────>│
       │                       │                       │                        │
       │                       │                       │ 6. Return new ID       │
       │                       │                       │<───────────────────────│
       │                       │ 7. Success response   │                        │
       │                       │<──────────────────────│                        │
       │                       │ 8. Show success msg   │                        │
       │                       │    & redirect         │                        │
       │ 9. Navigate to list   │                       │                        │
       │<──────────────────────│                       │                        │
```

---

## 📋 API Endpoints Reference

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/google` | Google OAuth login |
| GET | `/auth/google/callback` | Google OAuth callback |

### Patient Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients` | Get all patients |
| GET | `/patients/stats` | Get patient statistics |
| GET | `/patients/:id` | Get patient by ID |
| POST | `/patients` | Create new patient |
| PUT | `/patients/:id` | Update patient |
| DELETE | `/patients/:id` | Delete patient |

### Appointment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | Get all appointments |
| GET | `/appointments/today` | Get today's appointments |
| GET | `/appointments/upcoming` | Get upcoming appointments |
| GET | `/appointments/stats` | Get appointment statistics |
| GET | `/appointments/:id` | Get appointment by ID |
| POST | `/appointments` | Create new appointment |
| PUT | `/appointments/:id` | Update appointment |
| PUT | `/appointments/:id/status` | Change appointment status |
| DELETE | `/appointments/:id` | Delete appointment |

### Medical Records Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/medical-records` | Get all medical records |
| GET | `/medical-records/:id` | Get record by ID |
| GET | `/medical-records/appointment/:appointmentId` | Get record by appointment |
| GET | `/medical-records/patient/:patientId` | Get patient history |
| POST | `/medical-records` | Create medical record |
| PUT | `/medical-records/:id` | Update medical record |
| DELETE | `/medical-records/:id` | Delete medical record |

### Activity Log Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activity-logs` | Get all activity logs |
| GET | `/activity-logs/recent` | Get recent activity |
| GET | `/activity-logs/stats` | Get activity statistics |
| GET | `/activity-logs/entity/:type/:id` | Get entity-specific logs |

---

## 🔐 Authentication System

### JWT Token Flow

1. **Login**: User provides email/password
2. **Verification**: Backend verifies credentials using bcrypt
3. **Token Generation**: Backend creates JWT with user info
4. **Storage**: Frontend stores token in:
   - `AuthContext` (React Context)
   - `localStorage` (for persistence)
5. **API Calls**: Token sent in Authorization header:
   ```
   Authorization: Bearer <jwt_token>
   ```
6. **Verification**: `authMiddleware.js` verifies token on each request
7. **User Data**: Decoded user info attached to `req.user`

### Protected Routes

**Frontend:**
```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/patients" element={<PatientList />} />
  // ... more protected routes
</Route>
```

**Backend:**
```javascript
router.get('/patients', authMiddleware, async (req, res) => {
  // authMiddleware verifies JWT first
  // req.user contains decoded user data
});
```

---

## 💾 Database Schema Overview

### Core Tables

1. **users** - Authentication & user management
   - Stores: name, email, password (hashed), role
   - Roles: admin, doctor, nurse, staff

2. **patients** - Patient demographics
   - Stores: name, email, phone, DOB, medical history
   - Status: active/inactive

3. **appointments** - Scheduling
   - Links: patient_id, doctor_id, user_id
   - Status: scheduled, completed, cancelled, rescheduled

4. **medical_records** - Visit records
   - Links: patient_id, appointment_id, user_id
   - Contains: symptoms, diagnosis, treatment, notes

5. **prescriptions** - Medications
   - Links: medical_record_id
   - Contains: medication, dosage, frequency, duration

6. **activity_logs** - Audit trail
   - Tracks: user actions, timestamps, IP addresses

---

## 🔄 State Management

### AuthContext

Provides global authentication state:

```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Usage in Components:**
```jsx
const { user, token, getToken } = useContext(AuthContext);
```

---

## 🛠️ How to Add a New Feature

### Example: Adding a "Lab Tests" Feature

#### 1. Database (Backend)

Create table in `schema.sql`:
```sql
CREATE TABLE lab_tests (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    results TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Service Layer (Backend)

Create `pms-backend/services/labTestService.js`:
```javascript
class LabTestService {
  async getAllLabTests(userId, filters = {}) {
    const result = await pool.query(`
      SELECT lt.*, p.name as patient_name
      FROM lab_tests lt
      LEFT JOIN patients p ON lt.patient_id = p.id
      ORDER BY lt.test_date DESC
    `);
    return result.rows;
  }

  async createLabTest(userId, testData) {
    const result = await pool.query(`
      INSERT INTO lab_tests (patient_id, test_name, test_date, results)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [testData.patient_id, testData.test_name, testData.test_date, testData.results]);
    return result.rows[0];
  }
}
module.exports = new LabTestService();
```

#### 3. Routes (Backend)

Create `pms-backend/routes/labTests.js`:
```javascript
const express = require('express');
const router = express.Router();
const labTestService = require('../services/labTestService');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  const tests = await labTestService.getAllLabTests(req.user.id);
  res.json({ success: true, data: tests });
});

router.post('/', authMiddleware, async (req, res) => {
  const test = await labTestService.createLabTest(req.user.id, req.body);
  res.json({ success: true, data: test });
});

module.exports = router;
```

Register in `pms-backend/index.js`:
```javascript
const labTestRoutes = require('./routes/labTests');
app.use('/lab-tests', labTestRoutes);
```

#### 4. API Layer (Frontend)

Create `client/src/api/labTestApi.js`:
```javascript
const API_URL = 'http://localhost:5000';

export const getLabTests = async (token) => {
  const response = await fetch(`${API_URL}/lab-tests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.success ? data.data : [];
};

export const createLabTest = async (testData, token) => {
  const response = await fetch(`${API_URL}/lab-tests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(testData),
  });
  return await response.json();
};
```

#### 5. Component (Frontend)

Create `client/src/components/lab-tests/LabTestList.jsx`:
```jsx
import { useState, useEffect, useContext } from 'react';
import { getLabTests } from '../../api/labTestApi';
import { AuthContext } from '../../context/AuthContext';

export default function LabTestList() {
  const { getToken } = useContext(AuthContext);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const data = await getLabTests(getToken());
    setTests(data);
  };

  return (
    <div>
      <h2>Lab Tests</h2>
      {tests.map(test => (
        <div key={test.id}>{test.test_name}</div>
      ))}
    </div>
  );
}
```

#### 6. Routes (Frontend)

Add to `client/src/routes.jsx`:
```jsx
import LabTestList from './components/lab-tests/LabTestList';

// Inside Routes:
<Route path="/lab-tests" element={<LabTestList />} />
```

#### 7. Navigation (Frontend)

Add to `client/src/components/layout/Navbar.jsx`:
```jsx
<Button onClick={() => navigate("/lab-tests")}>
  Lab Tests
</Button>
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd pms-backend
npm install
```

Create `.env` file:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/pms
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Run database migration:
```bash
node migrate.js
```

Start server:
```bash
npm start
```

### Frontend Setup

```bash
cd client
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Start development server:
```bash
npm run dev
```

---

## 🔍 Debugging Tips

### Check API Calls
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Click on a request to see:
   - Request headers (check Authorization token)
   - Request payload
   - Response data
   - Status code

### Check Backend Logs
- Server logs appear in terminal where `npm start` is running
- Look for:
  - Request URLs
  - Error messages
  - Database query results

### Common Issues

**"Failed to fetch"**
- Backend server not running
- CORS issue (check backend has cors enabled)
- Wrong API_URL in frontend

**"Unauthorized" / 401**
- JWT token expired
- Token not sent in headers
- User not logged in

**"Internal Server Error" / 500**
- Check backend terminal for error details
- Database connection issue
- SQL query error

---

## 📊 Data Flow Summary

```
User Action (Browser)
    ↓
React Component
    ↓
API Service Function (fetch)
    ↓
HTTP Request + JWT Token
    ↓
Express Route Handler
    ↓
Auth Middleware (verify JWT)
    ↓
Service Layer (business logic)
    ↓
PostgreSQL Database Query
    ↓
Return Results
    ↓
JSON Response
    ↓
Update Component State
    ↓
Re-render UI
```

---

## 🎯 Key Concepts

### 1. Separation of Concerns
- **Frontend**: UI/UX, user interactions
- **Backend**: Business logic, data validation
- **Database**: Data storage

### 2. RESTful API
- Use HTTP methods (GET, POST, PUT, DELETE)
- Stateless communication
- JSON data format

### 3. Authentication
- JWT for stateless auth
- Tokens in Authorization headers
- Protected routes on both frontend & backend

### 4. Service Layer Pattern
- Routes handle HTTP
- Services handle business logic
- Easy to test and maintain

---

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `PatientList.jsx`)
- **Services**: camelCase (e.g., `patientService.js`)
- **API files**: camelCase (e.g., `patientApi.js`)
- **Routes**: camelCase (e.g., `patients.js`)
- **Folders**: kebab-case (e.g., `activity-logs/`)

---

## 🎓 Quick Reference: Complete Request Cycle

### When you click "View Patients" button:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS BUTTON                                           │
│    Component: PatientList.jsx                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. REACT HOOKS EXECUTE                                          │
│    useEffect(() => {                                            │
│      fetchPatients();  // Auto-runs on component mount          │
│    }, []);                                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. GET TOKEN FROM CONTEXT                                       │
│    const { getToken } = useContext(AuthContext);               │
│    const token = getToken(); // Returns JWT from localStorage   │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CALL API LAYER                                               │
│    File: client/src/api/patientApi.js                          │
│    const data = await getPatients(token);                      │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. AXIOS HTTP REQUEST                                           │
│    axios.get('http://localhost:5000/patients', {               │
│      headers: { Authorization: 'Bearer eyJhbGc...' }           │
│    })                                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND RECEIVES REQUEST                                     │
│    File: pms-backend/routes/patients.js                        │
│    router.get('/', authMiddleware, async (req, res) => {       │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. AUTH MIDDLEWARE VERIFIES JWT                                 │
│    File: pms-backend/middleware/authMiddleware.js              │
│    const decoded = jwt.verify(token, SECRET);                  │
│    req.user = decoded; // Attach user to request               │
│    next(); // Continue to route handler                        │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. ROUTE CALLS SERVICE LAYER                                    │
│    const patients = await patientService.getAllPatients();     │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. SERVICE QUERIES DATABASE                                     │
│    File: pms-backend/services/patientService.js                │
│    const result = await db.query(                              │
│      'SELECT * FROM patients ORDER BY created_at DESC'         │
│    );                                                           │
│    return result.rows;                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. POSTGRESQL EXECUTES QUERY                                   │
│     Returns array of patient objects:                          │
│     [                                                           │
│       { id: 1, name: 'John', phone: '123...' },               │
│       { id: 2, name: 'Jane', phone: '456...' }                │
│     ]                                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. SERVICE RETURNS TO ROUTE                                    │
│     return result.rows;                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. ROUTE SENDS JSON RESPONSE                                   │
│     res.json(patients);                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 13. AXIOS RECEIVES RESPONSE                                     │
│     response.data = [{ id: 1, name: 'John' }, ...]            │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 14. COMPONENT UPDATES STATE                                     │
│     setPatients(data); // Triggers React re-render             │
│     setLoading(false);                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 15. REACT RENDERS UI                                            │
│     return (                                                   │
│       <Table>                                                  │
│         {patients.map(p => <TableRow>{p.name}</TableRow>)}    │
│       </Table>                                                 │
│     )                                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    USER SEES TABLE! ✅
```

### Key Files in This Flow:

| Step | File | Technology |
|------|------|------------|
| 1-2 | `PatientList.jsx` | React, useState, useEffect |
| 3 | `AuthContext.jsx` | Context API |
| 4 | `api/patientApi.js` | Axios |
| 5 | Network request | HTTP |
| 6 | `routes/patients.js` | Express.js |
| 7 | `middleware/authMiddleware.js` | JWT |
| 8-9 | `services/patientService.js` | Service Pattern |
| 10 | Database | PostgreSQL |
| 11-15 | Response chain back | HTTP → React |

---

## 🤝 Contributing

When adding new features:
1. Create database table/columns first
2. Add service layer methods
3. Create route handlers
4. Add frontend API functions
5. Build React components
6. Add routes
7. Update navigation

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)
- [Material-UI Components](https://mui.com/material-ui/)
- [JWT.io](https://jwt.io)

---

Made with ❤️ for Patient Management
