# 🚀 Postman Collection Ready to Use!

## ✅ Files Created

### 1. **Doctor_Appointment_API.postman_collection.json**
Complete Postman collection with 30+ pre-configured API endpoints

### 2. **Doctor_Appointment_Environment.postman_environment.json**
Environment file with all variables needed for testing

### 3. **POSTMAN_SETUP.md**
Step-by-step guide for importing and using the collection

---

## 🎯 What's Included

### 📦 Endpoint Groups (7 folders)

| # | Group | Endpoints |
|---|-------|-----------|
| 1 | User Management | 6 endpoints |
| 2 | Doctor Management | 5 endpoints |
| 3 | Appointment Management | 5 endpoints |
| 4 | Payment Management | 5 endpoints |
| 5 | Review Management | 3 endpoints |
| 6 | Patient Management | 2 endpoints |
| 7 | Admin Management | 4 endpoints |

**Total: 30 Endpoints**

---

## 🔧 Pre-configured Features

✅ **Auto Token Saving**
- Login/Register automatically saves tokens
- No manual copying needed

✅ **Environment Variables**
- `base_url` - API endpoint
- `token` - User token
- `admin_token` - Admin token
- `doctor_token` - Doctor token
- `user_id`, `doctor_id`, `appointment_id`, etc.

✅ **Request Headers**
- Content-Type: application/json
- Authorization: Bearer {{token}}
- All pre-configured

✅ **Example Request Bodies**
- All endpoints have sample JSON bodies
- Easy to modify for testing

---

## 📥 Quick Import (3 Steps)

### Step 1: Open Postman
Download from: https://www.postman.com/downloads/

### Step 2: Import Collection
1. Click **Import**
2. Select `Doctor_Appointment_API.postman_collection.json`
3. Click **Import**

### Step 3: Import Environment
1. Click gear icon ⚙️ (Settings)
2. Click **Import**
3. Select `Doctor_Appointment_Environment.postman_environment.json`

---

## 🎬 Start Testing

### First Test - Login
1. Select environment: **Doctor Appointment System - Development**
2. Go to: **1. User Management** → **Login**
3. Click **Send**
4. Token automatically saves!

### Next Steps
1. Register a doctor
2. Approve the doctor (as admin)
3. Create an appointment
4. Process a payment
5. Leave a review

---

## 📋 All Endpoints at a Glance

### User Management
- POST /api/users - Register
- POST /api/users/login - Login
- POST /api/users/password-change - Change password
- GET /api/users - Get all users
- GET /api/users/:id - Get user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Doctor Management
- POST /api/doctors - Register doctor
- GET /api/doctors - List doctors
- GET /api/doctors/:id - Get doctor
- GET /api/doctors?specialty=X - Filter by specialty
- PUT /api/doctors/me/availability - Update availability

### Appointment Management
- POST /api/appointments - Create appointment
- GET /api/appointments - Get my appointments
- GET /api/appointments/:id - Get appointment
- PUT /api/appointments/:id - Reschedule
- DELETE /api/appointments/:id - Cancel

### Payment Management
- POST /api/payments - Create payment
- GET /api/payments - Get payments
- GET /api/payments/:id - Get payment
- PUT /api/payments/:id - Update status
- DELETE /api/payments/:id - Delete payment

### Review Management
- POST /api/reviews - Create review
- GET /api/reviews/doctor/:id - Get reviews
- GET /api/reviews/doctor/:id?page=X&perPage=Y - With pagination

### Patient Management
- GET /api/patients - Get profile
- PUT /api/patients/:id - Update profile

### Admin Management
- GET /api/admin/doctors/pending - Pending doctors
- PUT /api/admin/doctors/:id/verify - Approve/reject
- GET /api/admin/appointments - All appointments
- GET /api/admin/payments - All payments

---

## 💡 Pro Tips

### Tip 1: Token Management
```
Login → Token saved to {{token}}
Doctor Register → Token saved to {{doctor_token}}
Admin Login → Token saved to {{admin_token}}
```

### Tip 2: Use Variables in URLs
```
{{base_url}}/appointments/{{appointment_id}}
```

### Tip 3: Use Variables in Body
```json
{
  "doctorId": {{doctor_id}},
  "amount": 5000
}
```

### Tip 4: Switch Environment
Click dropdown (top-right) → Select environment

### Tip 5: View Response
Click **Body** tab after sending → See formatted JSON

---

## 🔐 Authentication

All protected endpoints automatically include:
```
Authorization: Bearer {{token}}
```

Change to different token for different operations:
- `{{admin_token}}` - Admin operations
- `{{doctor_token}}` - Doctor operations
- `{{token}}` - General user operations

---

## 🧪 Testing Scenarios

### Scenario: Complete User Flow
```
1. Register User → Save ID
2. Login → Save Token
3. Update User → Modify profile
4. Get User → View details
5. Change Password → Update credentials
```

### Scenario: Complete Doctor Flow
```
1. Register Doctor → Save ID
2. Login as Doctor → Save Token
3. Update Availability → Set schedule
4. Get Doctor Profile → View details
```

### Scenario: Complete Appointment Flow
```
1. Create Appointment → Save ID
2. Get Appointment → View details
3. Reschedule → Update date
4. Create Payment → Process payment
5. Create Review → Leave feedback
```

### Scenario: Admin Operations
```
1. Get Pending Doctors → List for approval
2. Approve Doctor → Change status
3. Get All Appointments → View all bookings
4. Get All Payments → View payment history
```

---

## 📊 Variable Auto-Fill

These variables are automatically populated after requests:

| After Request | Variable | Value |
|---------------|----------|-------|
| Login | `token` | JWT token |
| Register User | `user_id` | User ID |
| Register Doctor | `doctor_id` | Doctor ID |
| Register Doctor | `doctor_token` | Doctor JWT token |
| Create Appointment | `appointment_id` | Appointment ID |
| Create Payment | `payment_id` | Payment ID |
| Create Review | `review_id` | Review ID |

---

## ✨ Collection Features

| Feature | Status |
|---------|--------|
| All 30+ endpoints | ✅ Included |
| Auth headers | ✅ Pre-configured |
| Environment variables | ✅ Pre-configured |
| Request bodies | ✅ Example data |
| Auto-token saving | ✅ Scripts included |
| Grouped by function | ✅ 7 folders |
| Production ready | ✅ Yes |

---

## 🎯 Next Steps

1. **Import** the Postman collection and environment
2. **Login** to get your first token
3. **Explore** all endpoints
4. **Test** complete workflows
5. **Modify** example data as needed
6. **Share** with your team

---

## 📞 Support

For detailed information:
- See **POSTMAN_SETUP.md** for step-by-step guide
- See **API_TESTING.md** for curl examples
- See **README.md** for full documentation

---

## 📝 Version Info

**Created**: January 2, 2026  
**API Version**: 1.0  
**Collection Version**: 1.0  
**Status**: Ready to use ✅

---

**Happy Testing! 🎉**

You now have everything you need to test your Doctor Appointment System API in Postman!
