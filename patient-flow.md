# Patient Management Flow

## Step-by-Step Create Patient Flow

1. **Start: PatientList.jsx**
   ```
   Location: client/src/components/patients/PatientList.jsx
   Action: User clicks "Add Patient" button
   Navigation: Redirects to /patients/add
   ```

2. **Form Display: AddPatient.jsx**
   ```
   Location: client/src/components/patients/AddPatient.jsx
   Action: 
   - Loads the patient creation form
   - User fills in patient details
   - On Submit → calls createPatient() from patientApi.js
   ```

3. **API Call: patientApi.js**
   ```
   Location: client/src/api/patientApi.js
   Function: createPatient(data, token)
   Action: 
   - Makes POST request to /api/patients
   - Sends patient data to backend
   ```

4. **Backend Route: patients.js**
   ```
   Location: pms-backend/routes/patients.js
   Route: POST /api/patients
   Action:
   - Receives request
   - Validates token
   - Calls patientService.createPatient()
   ```

5. **Service Layer: patientService.js**
   ```
   Location: pms-backend/services/patientService.js
   Function: createPatient()
   Action:
   - Validates patient data
   - Generates unique patient ID
   - Creates database record
   ```

6. **Database: schema.sql**
   ```
   Location: pms-backend/database/schema.sql
   Action:
   - Inserts new record into patients table
   ```

7. **Response Flow Back**
   ```
   Database → patientService.js → patients.js route → 
   Frontend patientApi.js → AddPatient.jsx →
   Redirects to PatientList.jsx
   ```

## Overview
The Patient Management System (PMS) allows healthcare providers to manage patient information through Create, Read, Update, and Delete (CRUD) operations.

## File Structure
```
client/
├── src/
│   ├── components/
│   │   └── patients/
│   │       ├── PatientList.jsx       # List all patients with filters
│   │       ├── AddPatient.jsx        # Create new patient form
│   │       ├── EditPatient.jsx       # Edit existing patient form
│   │       └── PatientDetails.jsx    # View patient details
│   ├── api/
│   │   └── patientApi.js            # API calls for patient operations
│   └── context/
│       └── AuthContext.jsx          # Authentication context
pms-backend/
├── routes/
│   └── patients.js                  # Patient API routes
├── services/
│   └── patientService.js           # Business logic for patient operations
└── database/
    └── schema.sql                  # Database schema including patient table
```

## Patient CRUD Operations Flow

### 1. Create Patient (Add New Patient)
**Frontend Flow:**
1. User navigates to `/patients/add` route
2. `AddPatient.jsx` component renders the form
3. On form submit:
   ```javascript
   // AddPatient.jsx
   const handleSubmit = async (formData) => {
     const token = getToken();
     const result = await createPatient(formData, token);
     if (result.success) {
       navigate('/patients');
     }
   };
   ```

**Backend Flow:**
1. Request hits `/api/patients` POST endpoint
2. `patientService.createPatient()` is called
3. Patient data is validated
4. New patient record is inserted into database
5. Returns success response with patient data

### 2. Read Patient (View Patient List and Details)
**Frontend Flow:**
- **List View:**
  1. `PatientList.jsx` loads when user visits `/patients`
  2. Fetches patients using `getPatients()` API call
  3. Displays patients in a table format with search and filters
  
- **Detail View:**
  1. When user clicks patient ID or "View" button
  2. Navigates to `/patients/:id`
  3. `PatientDetails.jsx` loads and fetches patient details

**Backend Flow:**
1. GET requests to `/api/patients` or `/api/patients/:id`
2. `patientService.getPatients()` or `patientService.getPatientById()`
3. Returns patient data from database

### 3. Update Patient
**Frontend Flow:**
1. User clicks "Edit" in patient list or details view
2. Navigates to `/patients/:id/edit`
3. `EditPatient.jsx` loads with pre-filled form
4. On form submit:
   ```javascript
   // EditPatient.jsx
   const handleSubmit = async (formData) => {
     const token = getToken();
     const result = await updatePatient(id, formData, token);
     if (result.success) {
       navigate(`/patients/${id}`);
     }
   };
   ```

**Backend Flow:**
1. PUT request to `/api/patients/:id`
2. `patientService.updatePatient()` processes update
3. Validates changes
4. Updates database record
5. Returns updated patient data

### 4. Delete Patient
**Frontend Flow:**
1. User clicks "Delete" button in patient list
2. Confirmation dialog appears
3. On confirm:
   ```javascript
   // PatientList.jsx
   const handleDeleteConfirm = async () => {
     const token = getToken();
     const result = await deletePatient(id, token);
     if (result.success) {
       fetchPatients(); // Refresh list
     }
   };
   ```

**Backend Flow:**
1. DELETE request to `/api/patients/:id`
2. `patientService.deletePatient()` handles deletion
3. Checks for associated records (appointments, medical records)
4. Performs cascading delete if configured
5. Returns success response

## Database Schema (Patient Table)
```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patientid VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact VARCHAR(20),
    blood_type VARCHAR(10),
    allergies TEXT,
    medical_history TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Patient Routes
```javascript
// routes/patients.js
router.post('/', authenticate, patientController.createPatient);
router.get('/', authenticate, patientController.getPatients);
router.get('/:id', authenticate, patientController.getPatientById);
router.put('/:id', authenticate, patientController.updatePatient);
router.delete('/:id', authenticate, patientController.deletePatient);
```

## Step-by-Step Update Patient Flow

1. **Start: PatientList.jsx**
   ```
   Location: client/src/components/patients/PatientList.jsx
   Action: User clicks "Edit" button on a patient row
   Navigation: Redirects to /patients/:id/edit
   ```

2. **Form Display: EditPatient.jsx**
   ```
   Location: client/src/components/patients/EditPatient.jsx
   Action: 
   - Loads existing patient data using getPatientById()
   - Displays pre-filled form
   - User modifies details
   - On Submit → calls updatePatient() from patientApi.js
   ```

3. **API Call: patientApi.js**
   ```
   Location: client/src/api/patientApi.js
   Function: updatePatient(id, data, token)
   Action: 
   - Makes PUT request to /api/patients/:id
   - Sends updated data to backend
   ```

4. **Backend Route: patients.js**
   ```
   Location: pms-backend/routes/patients.js
   Route: PUT /api/patients/:id
   Action:
   - Receives request
   - Validates token
   - Calls patientService.updatePatient()
   ```

5. **Service Layer: patientService.js**
   ```
   Location: pms-backend/services/patientService.js
   Function: updatePatient()
   Action:
   - Validates updated data
   - Updates database record
   ```

6. **Response Flow Back**
   ```
   Database → patientService.js → patients.js route → 
   Frontend patientApi.js → EditPatient.jsx →
   Redirects to PatientList.jsx or PatientDetails.jsx
   ```

## Step-by-Step Delete Patient Flow

1. **Start: PatientList.jsx**
   ```
   Location: client/src/components/patients/PatientList.jsx
   Action: 
   - User clicks "Delete" button
   - Shows confirmation dialog
   - User confirms deletion
   - Calls deletePatient() from patientApi.js
   ```

2. **API Call: patientApi.js**
   ```
   Location: client/src/api/patientApi.js
   Function: deletePatient(id, token)
   Action: 
   - Makes DELETE request to /api/patients/:id
   ```

3. **Backend Route: patients.js**
   ```
   Location: pms-backend/routes/patients.js
   Route: DELETE /api/patients/:id
   Action:
   - Receives request
   - Validates token
   - Calls patientService.deletePatient()
   ```

4. **Service Layer: patientService.js**
   ```
   Location: pms-backend/services/patientService.js
   Function: deletePatient()
   Action:
   - Checks for related records
   - Performs cascade delete if needed
   - Removes database record
   ```

5. **Response Flow Back**
   ```
   Database → patientService.js → patients.js route → 
   Frontend patientApi.js → PatientList.jsx →
   Refreshes patient list
   ```

## Step-by-Step View Patient Flow

1. **Start: PatientList.jsx**
   ```
   Location: client/src/components/patients/PatientList.jsx
   Action: User clicks patient ID or "View" button
   Navigation: Redirects to /patients/:id
   ```

2. **Details Display: PatientDetails.jsx**
   ```
   Location: client/src/components/patients/PatientDetails.jsx
   Action: 
   - Calls getPatientById() from patientApi.js
   - Displays comprehensive patient information
   ```

3. **API Call: patientApi.js**
   ```
   Location: client/src/api/patientApi.js
   Function: getPatientById(id, token)
   Action: 
   - Makes GET request to /api/patients/:id
   ```

4. **Backend Route: patients.js**
   ```
   Location: pms-backend/routes/patients.js
   Route: GET /api/patients/:id
   Action:
   - Receives request
   - Validates token
   - Calls patientService.getPatientById()
   ```

5. **Response Flow Back**
   ```
   Database → patientService.js → patients.js route → 
   Frontend patientApi.js → PatientDetails.jsx
   ```

## Frontend Components

### PatientList.jsx
- Displays all patients in a table
- Includes search and filter functionality
- Provides actions: View, Edit, Delete, Book Appointment

### AddPatient.jsx & EditPatient.jsx
- Form components for creating/editing patients
- Form validation
- File upload for documents
- Success/error notifications

### PatientDetails.jsx
- Comprehensive view of patient information
- Medical history
- Appointment history
- Documents/attachments
- Related actions (Book Appointment, Edit, etc.)

## Security Considerations
1. All routes are protected with authentication middleware
2. User role-based access control
3. Input validation on both frontend and backend
4. SQL injection protection through parameterized queries
5. XSS protection through proper escaping
6. CSRF protection through tokens

## Error Handling
- Frontend displays user-friendly error messages
- Backend provides detailed error responses
- Validation errors are properly formatted and displayed
- Network errors are caught and handled appropriately
- Form validation provides immediate feedback

This documentation provides a comprehensive overview of the patient management flow in the PMS system. For specific implementation details, refer to the individual component files and their comments.