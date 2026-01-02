# Postman Collection Setup Guide

## 📦 What You Have

Two Postman files have been created for easy API testing:

1. **Doctor_Appointment_API.postman_collection.json** - Complete API collection with all endpoints
2. **Doctor_Appointment_Environment.postman_environment.json** - Environment variables

## 📥 Import into Postman

### Step 1: Open Postman
- Download and open [Postman](https://www.postman.com/downloads/)
- Create a free account if needed

### Step 2: Import Collection
1. Click **Import** button (top-left)
2. Select **Upload Files** tab
3. Choose `Doctor_Appointment_API.postman_collection.json`
4. Click **Import**

### Step 3: Import Environment
1. Click the **gear icon** (settings) - top right
2. Click **Import**
3. Choose `Doctor_Appointment_Environment.postman_environment.json`
4. Click **Import**

### Step 4: Select Environment
1. Click the **environment dropdown** (top-right, next to gear icon)
2. Select **Doctor Appointment System - Development**

---

## 🚀 Quick Start Testing

### 1. Login (Get Admin Token)
1. Expand **1. User Management**
2. Click **Login**
3. Click **Send**
4. Token will automatically save to `admin_token` variable

**Response should be:**
```json
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Aayushma bista",
    "email": "admin@example.com"
  }
}
```

### 2. Register a Doctor
1. Expand **2. Doctor Management**
2. Click **Register Doctor**
3. Modify email if needed (make it unique)
4. Click **Send**
5. Doctor token will save to `doctor_token` variable

### 3. Register a Patient
1. Go to **1. User Management**
2. Click **Register User**
3. Change email and name
4. Click **Send**

### 4. Approve Doctor (as Admin)
1. Expand **7. Admin Management**
2. Click **Approve/Reject Doctor**
3. Change `doctor_id` to the doctor you registered
4. Click **Send**

### 5. Create Appointment (as Patient)
1. Expand **3. Appointment Management**
2. Click **Create Appointment**
3. Make sure you have a patient token (login as patient first)
4. Use the approved doctor ID
5. Click **Send**

---

## 📋 Endpoint Organization

### Folder Structure
```
Doctor Appointment System API
├── 1. User Management (6 endpoints)
├── 2. Doctor Management (5 endpoints)
├── 3. Appointment Management (5 endpoints)
├── 4. Payment Management (5 endpoints)
├── 5. Review Management (3 endpoints)
├── 6. Patient Management (2 endpoints)
└── 7. Admin Management (4 endpoints)
```

**Total: 30+ Endpoints**

---

## 🔧 Using Environment Variables

### Pre-defined Variables
```
base_url = http://localhost:5050/api
token = (auto-filled after login)
admin_token = (auto-filled after login)
doctor_token = (auto-filled after registration)
user_id = 1 (change as needed)
doctor_id = 2 (change as needed)
appointment_id = 1 (change as needed)
payment_id = 1 (change as needed)
review_id = 1 (change as needed)
```

### How to Use Variables
In any request URL or body, use: `{{variable_name}}`

Example:
```
GET {{base_url}}/appointments/{{appointment_id}}
```

### Update Variables Manually
1. Click the **environment dropdown** (top-right)
2. Click **Edit**
3. Modify the values
4. Click **Save** (or just close)

---

## 🔐 Authentication

### How Tokens Work
1. When you login, the response includes a `token`
2. Post-request scripts automatically save it to `token` variable
3. All protected endpoints use: `Authorization: Bearer {{token}}`

### Headers in Requests
Most requests already have headers configured:
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

If you need to use a different token, edit the header:
- Use `{{admin_token}}` for admin operations
- Use `{{doctor_token}}` for doctor operations
- Use `{{token}}` for general user operations

---

## 📝 Testing Workflow

### Complete User Journey

**1. Setup**
```
Login as Admin
  ↓
Register Doctor → Approve Doctor
  ↓
Register Patient
```

**2. Booking**
```
Patient → Create Appointment
  ↓
Payment → Create Payment
```

**3. Review**
```
Complete Appointment (manual: update status)
  ↓
Create Review
```

---

## 💡 Pro Tips

### 1. Save Request with Body
Each request has a pre-filled body. You can:
- Modify it temporarily for testing
- Or create a duplicate request with different data

### 2. View Response
After clicking **Send**, click the **Body** tab to see the response:
```json
{
  "message": "Success",
  "data": { ... }
}
```

### 3. Check Response Time
Bottom of response shows:
- Status code (200, 201, 400, etc.)
- Response time (milliseconds)
- Response size

### 4. Save Responses
Click **Save Response** to save examples for later reference

### 5. Use Variables in Body
You can use variables in JSON body too:
```json
{
  "doctorId": {{doctor_id}},
  "appointmentId": {{appointment_id}}
}
```

---

## 🧪 Common Test Scenarios

### Scenario 1: Complete Doctor Workflow
1. **Register Doctor** → Save `doctor_id`
2. **Login as Doctor** → Save `doctor_token`
3. **Update Doctor Availability** → Use `doctor_token`
4. **Get Doctor by ID** → View your profile

### Scenario 2: Complete Patient Workflow
1. **Register User** → Change role to PATIENT
2. **Login** → Save `token`
3. **Get Patient Profile** → View your details
4. **Update Patient Profile** → Modify details

### Scenario 3: Complete Appointment Workflow
1. **Create Appointment** → Save `appointment_id`
2. **Get Appointment by ID** → View details
3. **Create Payment** → For the appointment
4. **Create Review** → After appointment completes

### Scenario 4: Admin Operations
1. **Get Pending Doctors** → List doctors awaiting approval
2. **Approve/Reject Doctor** → Update doctor status
3. **Get All Appointments** → View system appointments
4. **Get All Payments** → View payment history

---

## 🐛 Troubleshooting

### 401 Unauthorized
**Problem**: Token is invalid or expired

**Solution**:
1. Login again to get fresh token
2. Check that `Authorization: Bearer {{token}}` is in headers
3. Verify token is saved in environment

### 404 Not Found
**Problem**: Resource doesn't exist

**Solution**:
1. Check the ID is correct
2. Create the resource first (e.g., create doctor before viewing)
3. Use the correct `{{variable_name}}`

### 400 Bad Request
**Problem**: Invalid request data

**Solution**:
1. Check JSON syntax in body (use JSON validator)
2. Verify all required fields are present
3. Check data types match (numbers vs strings)
4. Ensure enum values are valid

### Connection Refused
**Problem**: Server not running

**Solution**:
```bash
# In backend directory
npm run dev
```

Server must be running on port 5050

### Wrong Token Type
**Problem**: Using patient token for admin operation

**Solution**:
1. Check which token is needed for endpoint
2. Use correct variable: `{{admin_token}}`, `{{doctor_token}}`, or `{{token}}`
3. Login with correct role first

---

## 📊 Response Examples

### Successful Login (200)
```json
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Aayushma bista",
    "email": "admin@example.com",
    "phoneNumber": [""]
  }
}
```

### Created Resource (201)
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "id": 1,
    "patientId": 1,
    "doctorId": 2,
    "scheduledAt": "2026-01-15T10:00:00.000Z",
    "status": "PENDING",
    "mode": "IN_PERSON"
  }
}
```

### Error Response (400)
```json
{
  "error": "Invalid email",
  "message": "Email already exists"
}
```

---

## 🔗 Related Documentation

- **API_TESTING.md** - Detailed API endpoint documentation
- **README.md** - Main project documentation
- **QUICK_REFERENCE.md** - Quick lookup guide

---

## 📞 Need Help?

1. Check the error message in response
2. Review [Troubleshooting](#-troubleshooting) section
3. Refer to API_TESTING.md for endpoint details
4. Check backend logs: `npm run dev`

---

## ✨ Features of This Collection

✅ 30+ pre-configured endpoints
✅ Auto-token saving from login/register responses
✅ Environment variables for easy switching
✅ Request headers pre-configured
✅ Example request bodies for all endpoints
✅ Organized by functional groups
✅ Ready-to-use for testing and development

**Status**: Ready to use immediately after import! 🚀
