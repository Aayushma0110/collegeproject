# ✅ POSTMAN COLLECTION - SETUP COMPLETE!

## 📦 Two Files Ready to Import

### ✅ Doctor_Appointment_API.postman_collection.json
**Complete API Collection with 30+ Endpoints**

Features:
- ✅ All endpoints pre-configured
- ✅ Request headers included
- ✅ Example request bodies
- ✅ Auto-token saving scripts
- ✅ Organized in 7 folders
- ✅ Ready to use immediately

### ✅ Doctor_Appointment_Environment.postman_environment.json
**Environment Variables Configuration**

Includes:
- ✅ base_url (http://localhost:5050/api)
- ✅ token variables
- ✅ ID variables (user_id, doctor_id, etc.)
- ✅ All pre-configured

---

## 🚀 How to Use (3 Simple Steps)

### Step 1️⃣ Open Postman
Download: https://www.postman.com/downloads/

### Step 2️⃣ Import Collection
```
1. Click Import button (top-left)
2. Select Doctor_Appointment_API.postman_collection.json
3. Click Import
```

### Step 3️⃣ Import Environment & Start Testing
```
1. Click gear icon ⚙️ (Settings)
2. Click Import
3. Select Doctor_Appointment_Environment.postman_environment.json
4. Select the environment from dropdown
5. Click Login endpoint
6. Click Send
7. Token automatically saved! ✅
```

---

## 📊 What's Included

### 30+ API Endpoints Organized in 7 Groups:

```
📁 1. User Management (6 endpoints)
   ├─ Register User
   ├─ Login
   ├─ Get All Users
   ├─ Get User by ID
   ├─ Update User
   └─ Change Password

📁 2. Doctor Management (5 endpoints)
   ├─ Register Doctor
   ├─ Get All Doctors
   ├─ Get Doctor by ID
   ├─ Get Doctors by Specialty
   └─ Update Doctor Availability

📁 3. Appointment Management (5 endpoints)
   ├─ Create Appointment
   ├─ Get My Appointments
   ├─ Get Appointment by ID
   ├─ Update Appointment (Reschedule)
   └─ Cancel Appointment

📁 4. Payment Management (5 endpoints)
   ├─ Create Payment
   ├─ Get All Payments
   ├─ Get Payment by ID
   ├─ Update Payment Status
   └─ Delete Payment

📁 5. Review Management (3 endpoints)
   ├─ Create Review
   ├─ Get Reviews for Doctor
   └─ Get Reviews with Pagination

📁 6. Patient Management (2 endpoints)
   ├─ Get Patient Profile
   └─ Update Patient Profile

📁 7. Admin Management (4 endpoints)
   ├─ Get Pending Doctors
   ├─ Approve/Reject Doctor
   ├─ Get All Appointments (Admin)
   └─ Get All Payments (Admin)
```

---

## 🎯 Quick Test Workflow

### Test 1: Login (30 seconds)
```
1. Go to: User Management → Login
2. Click Send
3. See token appear in response ✅
4. Token auto-saves to {{token}} variable ✅
```

### Test 2: Get All Users (10 seconds)
```
1. Go to: User Management → Get All Users
2. Click Send
3. See list of users in response ✅
```

### Test 3: Create Appointment (20 seconds)
```
1. Go to: Appointment Management → Create Appointment
2. Click Send (uses {{token}} automatically)
3. Appointment created! ✅
4. ID auto-saves to {{appointment_id}} ✅
```

**Total time: Less than 1 minute to test 3 endpoints!**

---

## 🔐 Authentication Explained

All endpoints that need authentication automatically include:
```
Authorization: Bearer {{token}}
```

Tokens are auto-populated after login/register using Postman scripts.

**Types of tokens:**
- `{{token}}` - Regular user token
- `{{admin_token}}` - Admin user token
- `{{doctor_token}}` - Doctor user token

---

## 📋 Documentation Files for Postman

### Setup Instructions
- **POSTMAN_QUICK_START.md** ⭐ Start here!
- **POSTMAN_SETUP.md** - Detailed guide

### API Reference
- **API_TESTING.md** - curl examples
- **README.md** - Full API documentation

### Quick Reference
- **QUICK_REFERENCE.md** - One-page cheat sheet
- **DOCUMENTATION_MAP.md** - Navigation guide

---

## 💡 Smart Features

### ✨ Auto-Token Saving
When you login or register, scripts automatically:
- Extract the JWT token from response
- Save to environment variable `{{token}}`
- All future requests use it automatically

### ✨ Auto-ID Saving
Creation requests automatically:
- Extract the created resource ID
- Save to environment variables
- Use in subsequent requests

### ✨ Pre-filled Request Bodies
All endpoints include example JSON:
- Just click Send to use examples
- Or modify as needed for your tests
- No manual data entry required

### ✨ Grouped by Function
7 organized folders make it easy to find endpoints by purpose:
- User Management
- Doctor Management
- Appointment Management
- Payment Management
- Review Management
- Patient Management
- Admin Management

---

## 🧪 Testing Examples

### Example 1: Complete User Registration Flow
```
Step 1: User Management → Register User
        Click Send
        
Step 2: User Management → Login
        Click Send (token saved)
        
Step 3: User Management → Get User by ID
        Click Send (uses {{user_id}})
        
Step 4: User Management → Update User
        Click Send (uses {{token}} and {{user_id}})
```

### Example 2: Complete Doctor Registration & Approval
```
Step 1: Doctor Management → Register Doctor
        Click Send (doctor_id & doctor_token saved)
        
Step 2: Admin Management → Get Pending Doctors
        Click Send (uses {{admin_token}})
        
Step 3: Admin Management → Approve/Reject Doctor
        Change status to "APPROVED"
        Click Send
```

### Example 3: Complete Appointment Booking
```
Step 1: Appointment Management → Create Appointment
        Click Send (appointment_id saved)
        
Step 2: Appointment Management → Get Appointment by ID
        Click Send
        
Step 3: Payment Management → Create Payment
        Click Send
        
Step 4: Review Management → Create Review
        Click Send
```

---

## ✅ Verification Checklist

Before using, make sure:
- ✅ Postman is installed and open
- ✅ Both JSON files are in backend folder
- ✅ Backend server is running (`npm run dev`)
- ✅ Port 5050 is available
- ✅ Database is set up and migrations applied

---

## 🆘 Quick Troubleshooting

### Problem: "Connection refused"
**Solution**: Start the backend
```bash
npm run dev
```

### Problem: "401 Unauthorized"
**Solution**: Login first to get token
1. User Management → Login
2. Click Send
3. Use returned token

### Problem: "404 Not Found"
**Solution**: Check the resource exists
1. Verify ID is correct in URL
2. Create resource first if needed
3. Check variable {{variable_name}} is set

### Problem: "Token not saving"
**Solution**: 
1. Check response is 200/201 status
2. Check "Tests" tab has scripts
3. Run request again to populate

### Problem: "Can't find endpoint"
**Solution**: 
1. Check folder organization (7 groups)
2. Use Postman search (Ctrl+K)
3. See DOCUMENTATION_MAP.md

---

## 🎁 Bonus: Environment Variables

Postman environment includes these variables:

```
{{base_url}}        → http://localhost:5050/api
{{token}}           → User JWT token
{{admin_token}}     → Admin JWT token
{{doctor_token}}    → Doctor JWT token
{{user_id}}         → User ID
{{doctor_id}}       → Doctor ID
{{appointment_id}}  → Appointment ID
{{payment_id}}      → Payment ID
{{review_id}}       → Review ID
```

Use them in any request URL or body!

---

## 📱 Mobile Testing

Postman also has mobile apps:
- iOS: App Store
- Android: Google Play

Import the same collection and test on mobile!

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| POSTMAN_QUICK_START.md | 1-page overview |
| POSTMAN_SETUP.md | Complete setup guide |
| API_TESTING.md | curl examples |
| README.md | Full API docs |
| QUICK_REFERENCE.md | Cheat sheet |
| DOCUMENTATION_MAP.md | Navigation guide |

---

## 🎯 Next Steps

1. **Import** the collection files
2. **Select** the environment
3. **Click** Login endpoint
4. **Send** request
5. **Explore** other endpoints
6. **Test** complete workflows

---

## ✨ Features Summary

✅ 30+ pre-configured endpoints
✅ Auto-token and ID saving
✅ Environment variables ready
✅ Example request bodies
✅ Organized in 7 folders
✅ Production-ready
✅ All HTTP methods (GET, POST, PUT, DELETE)
✅ Full authentication support
✅ Admin operations included
✅ Complete test workflows

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| Total Endpoints | 30+ |
| Endpoint Groups | 7 |
| Environment Variables | 9 |
| Documentation Files | 11 |
| Time to First Test | < 1 minute |
| Lines of Config | 770+ |
| Test Scripts | Included |

---

## 🚀 Ready to Go!

**Status**: ✅ Ready to import and use immediately

**Next Action**: 
1. Download Postman
2. Import the two JSON files
3. Start testing!

---

**Everything you need is ready. Start testing now! 🎉**

Files created:
- ✅ Doctor_Appointment_API.postman_collection.json
- ✅ Doctor_Appointment_Environment.postman_environment.json
- ✅ POSTMAN_QUICK_START.md
- ✅ POSTMAN_SETUP.md
- ✅ Complete documentation suite

**Happy Testing! 🚀**
