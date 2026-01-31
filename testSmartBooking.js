/**
 * Test script to demonstrate smart booking algorithms
 * Run: node testSmartBooking.js
 */

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           🤖 SMART APPOINTMENT BOOKING ALGORITHMS 🤖             ║
║                                                                  ║
║  Intelligent, efficient, and user-friendly appointment booking  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

📋 Available Algorithms:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Smart Slot Recommendations
    ├─ AI-powered slot suggestions
    ├─ Scores based on ratings, experience, time, urgency, fees
    └─ Endpoint: POST /api/appointments/smart-recommendations

2️⃣  Auto-Schedule Appointment
    ├─ AI automatically books the best slot
    ├─ No manual selection needed
    └─ Endpoint: POST /api/appointments/auto-schedule

3️⃣  Load Balancing
    ├─ Distributes patients across doctors
    ├─ Prevents overbooking
    └─ Endpoint: GET /api/appointments/balanced-slots

4️⃣  Next Available Slot
    ├─ Finds nearest available slot
    ├─ Quick booking
    └─ Endpoint: GET /api/appointments/next-available

5️⃣  Alternative Slot Finder
    ├─ Suggests alternatives when slot is booked
    ├─ Same-day or any-day options
    └─ Endpoint: GET /api/appointments/alternatives/:slotId

6️⃣  Smart Rescheduling
    ├─ Intelligent reschedule suggestions
    ├─ Same doctor or alternative doctors
    └─ Endpoint: GET /api/appointments/:appointmentId/reschedule-options

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Testing with Postman:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Login
────────────────────────────────────────────────────────────────
POST http://localhost:5050/api/users/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123"
}

Copy the token from response.

Step 2: Test Smart Recommendations
────────────────────────────────────────────────────────────────
POST http://localhost:5050/api/appointments/smart-recommendations
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "expertiseId": 1,
  "preferredDate": "2026-01-25",
  "preferredTimeRange": {
    "start": "09:00",
    "end": "12:00"
  },
  "urgency": "NORMAL",
  "maxResults": 5
}

Expected Response:
{
  "success": true,
  "count": 5,
  "recommendations": [
    {
      "slotId": 42,
      "doctorName": "Dr. Sarah Johnson",
      "doctorRating": 4.8,
      "score": 185,
      "recommendationReason": "Highly rated doctor, Experienced specialist"
    }
  ]
}

Step 3: Test Auto-Schedule
────────────────────────────────────────────────────────────────
POST http://localhost:5050/api/appointments/auto-schedule
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "expertiseId": 1,
  "urgency": "URGENT",
  "problems": {
    "diseases": ["Chest pain"],
    "symptoms": ["Severe pain"]
  }
}

Expected Response:
{
  "success": true,
  "message": "Appointment auto-scheduled successfully! 🎯",
  "appointment": { ... },
  "selectedSlot": { ... },
  "tip": "We selected the best slot based on..."
}

Step 4: Test Load Balancing
────────────────────────────────────────────────────────────────
GET http://localhost:5050/api/appointments/balanced-slots?expertiseId=1
Authorization: Bearer <YOUR_TOKEN>

Expected Response:
{
  "success": true,
  "doctorLoads": [
    {
      "doctorName": "Dr. Emily White",
      "availableSlots": 8,
      "bookedAppointments": 2,
      "load": 0.25  // Lower is better (less busy)
    }
  ]
}

Step 5: Test Next Available
────────────────────────────────────────────────────────────────
GET http://localhost:5050/api/appointments/next-available?doctorId=5
Authorization: Bearer <YOUR_TOKEN>

Expected Response:
{
  "success": true,
  "nextSlot": {
    "id": 42,
    "startTime": "2026-01-25T10:00:00.000Z",
    "doctor": { "name": "Dr. Sarah Johnson" }
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Use Cases:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 Emergency Case:
  Use: POST /api/appointments/auto-schedule
  With: urgency: "URGENT"
  Result: Books nearest available slot immediately

⏰ Time-Sensitive Patient:
  Use: POST /api/appointments/smart-recommendations
  With: preferredTimeRange
  Result: Returns slots matching time preference

📊 Hospital Admin:
  Use: GET /api/appointments/balanced-slots
  Result: See which doctors need more patients

🔄 Reschedule After Cancellation:
  Use: GET /api/appointments/:id/reschedule-options
  Result: Smart alternatives from same or different doctor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧮 Scoring Algorithm:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each slot is scored out of 200 points:

  ⭐ Doctor Rating:     0-40 points  (5★ = 40 pts)
  📚 Experience:        0-20 points  (2 pts/year)
  ⏰ Time Match:        0-30 points  (perfect match = 30)
  🚨 Urgency Bonus:     0-40 points  (within 4 hrs = 40)
  💰 Affordable Fees:   0-10 points  (lower = better)
  
  Total Max Score: 140-200 points

Higher score = Better recommendation!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Benefits:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For Patients:
  ✅ Faster booking (no manual browsing)
  ✅ Best doctor match (AI-powered)
  ✅ Time saved (automatic scheduling)
  ✅ Better experience

For Doctors:
  ✅ Balanced appointments (no overload)
  ✅ Higher ratings (better matches)
  ✅ Reduced no-shows

For System:
  ✅ Optimal slot utilization
  ✅ Lower cancellation rates
  ✅ Scalable architecture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Documentation:
  - Full Guide: backend/SMART_BOOKING_GUIDE.md
  - Postman Collection: backend/Doctor_Appointment_Complete_API.postman_collection.json
  - API Routes: backend/src/routes/appointment.routes.js
  - Algorithms: backend/src/utils/booking.algorithms.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Quick Start:
  1. npm start (start server)
  2. Open Postman
  3. Import collection
  4. Test endpoints above

Happy booking! 🎉
`);
