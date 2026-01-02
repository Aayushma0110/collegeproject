# API Testing Examples

This file contains curl commands and JSON examples for testing the Doctor Appointment System API.

## Base URL
```
http://localhost:5050/api
```

## 1. User Management

### Register User
```bash
curl -X POST http://localhost:5050/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123!",
    "role": "PATIENT",
    "phoneNumber": ["1234567890"]
  }'
```

### Login
```bash
curl -X POST http://localhost:5050/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123!"
  }'
```

Response:
```json
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": ["1234567890"]
  }
}
```

### Get All Users
```bash
curl http://localhost:5050/api/users
```

### Get User by ID
```bash
curl http://localhost:5050/api/users/1
```

### Update User
```bash
curl -X PUT http://localhost:5050/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Doe",
    "phoneNumber": ["9876543210"]
  }'
```

### Change Password
```bash
curl -X POST http://localhost:5050/api/users/password-change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "currentPassword": "securePassword123!",
    "newPassword": "newSecurePassword456!"
  }'
```

## 2. Doctor Management

### Register Doctor
```bash
curl -X POST http://localhost:5050/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "dr.smith@example.com",
    "password": "doctorPass123!",
    "specialty": "Cardiology",
    "phone": "9876543210"
  }'
```

### Get All Doctors
```bash
curl -X GET http://localhost:5050/api/doctors \
  -H "Authorization: Bearer <token>"
```

### Get Doctor by ID
```bash
curl http://localhost:5050/api/doctors/2
```

### Get Doctors by Specialty (with Query)
```bash
curl "http://localhost:5050/api/doctors?specialty=Cardiology" \
  -H "Authorization: Bearer <token>"
```

### Update Doctor Availability
```bash
curl -X PUT http://localhost:5050/api/doctors/me/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "availability": {
      "monday": ["09:00-12:00", "14:00-17:00"],
      "tuesday": ["09:00-12:00", "14:00-17:00"],
      "wednesday": ["09:00-12:00"],
      "thursday": ["14:00-17:00"],
      "friday": ["09:00-12:00", "14:00-17:00"]
    }
  }'
```

## 3. Appointment Management

### Create Appointment
```bash
curl -X POST http://localhost:5050/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <patient-token>" \
  -d '{
    "doctorId": 2,
    "scheduledAt": "2026-01-15T10:00:00.000Z"
  }'
```

### Get My Appointments
```bash
curl -X GET http://localhost:5050/api/appointments \
  -H "Authorization: Bearer <token>"
```

### Get Appointment by ID
```bash
curl -X GET http://localhost:5050/api/appointments/1 \
  -H "Authorization: Bearer <token>"
```

### Update Appointment (Reschedule)
```bash
curl -X PUT http://localhost:5050/api/appointments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "scheduledAt": "2026-01-20T14:00:00.000Z"
  }'
```

### Cancel Appointment
```bash
curl -X DELETE http://localhost:5050/api/appointments/1 \
  -H "Authorization: Bearer <token>"
```

## 4. Payment Management

### Create Payment
```bash
curl -X POST http://localhost:5050/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "appointmentId": 1,
    "amount": 5000,
    "method": "CARD",
    "transactionId": "txn_123456789"
  }'
```

### Get All Payments
```bash
curl -X GET http://localhost:5050/api/payments \
  -H "Authorization: Bearer <token>"
```

### Get Payment by ID
```bash
curl -X GET http://localhost:5050/api/payments/1 \
  -H "Authorization: Bearer <token>"
```

### Update Payment Status
```bash
curl -X PUT http://localhost:5050/api/payments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "SUCCESS",
    "method": "STRIPE"
  }'
```

### Delete Payment
```bash
curl -X DELETE http://localhost:5050/api/payments/1 \
  -H "Authorization: Bearer <token>"
```

## 5. Review Management

### Create Review
```bash
curl -X POST http://localhost:5050/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <patient-token>" \
  -d '{
    "appointmentId": 1,
    "rating": 5,
    "comment": "Excellent doctor! Very professional and caring."
  }'
```

### Get Reviews for Doctor
```bash
curl "http://localhost:5050/api/reviews/doctor/2"
```

### Get Reviews with Pagination
```bash
curl "http://localhost:5050/api/reviews/doctor/2?page=1&perPage=10"
```

## 6. Patient Management

### Get Patient Profile
```bash
curl -X GET http://localhost:5050/api/patients \
  -H "Authorization: Bearer <token>"
```

### Update Patient Profile
```bash
curl -X PUT http://localhost:5050/api/patients/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Smith",
    "medicalHistory": "Allergies: Penicillin. Previous surgeries: Appendectomy"
  }'
```

## 7. Admin Management

### Get Pending Doctors
```bash
curl -X GET http://localhost:5050/api/admin/doctors/pending \
  -H "Authorization: Bearer <admin-token>"
```

### Approve/Reject Doctor
```bash
curl -X PUT http://localhost:5050/api/admin/doctors/2/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "status": "APPROVED"
  }'
```

### Get All Appointments (Admin)
```bash
curl -X GET http://localhost:5050/api/admin/appointments \
  -H "Authorization: Bearer <admin-token>"
```

### Get All Payments (Admin)
```bash
curl -X GET http://localhost:5050/api/admin/payments \
  -H "Authorization: Bearer <admin-token>"
```

## Payment Methods
- CASH
- CARD
- STRIPE
- ESEWA
- KHALTI

## Appointment Modes
- IN_PERSON
- ONLINE

## Appointment Status
- PENDING
- CONFIRMED
- CANCELLED
- COMPLETED

## Doctor Status
- PENDING (awaiting approval)
- APPROVED (can accept appointments)
- REJECTED

## Payment Status
- PENDING
- SUCCESS
- FAILED
- REFUNDED

## Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Authentication Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing with Postman

1. Import the base URL: `http://localhost:5050/api`
2. Create variables:
   - `token`: Your JWT token from login response
   - `admin_token`: Admin user JWT token
   - `doctor_id`: ID of a doctor
   - `patient_id`: ID of a patient
   - `appointment_id`: ID of an appointment

3. Use these variables in requests:
   ```
   Authorization: Bearer {{token}}
   ```

## Testing with curl Environment Variables

```bash
export API_URL="http://localhost:5050/api"
export TOKEN="your_jwt_token_here"
export DOCTOR_ID=2
export APPOINTMENT_ID=1

# Use in commands
curl -X GET $API_URL/appointments/$APPOINTMENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### 401 Unauthorized
- Token expired or invalid
- Missing "Bearer " prefix in Authorization header
- Check JWT_SECRET matches

### 403 Forbidden
- User role doesn't have permission
- Check user role matches endpoint requirements

### 404 Not Found
- Resource doesn't exist
- Check ID in URL is correct

### 400 Bad Request
- Missing or invalid JSON fields
- Check request body format
- Validate data types
